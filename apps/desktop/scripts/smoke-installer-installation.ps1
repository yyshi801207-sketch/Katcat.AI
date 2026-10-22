param([Parameter(Mandatory)][string]$Makensis)
$ErrorActionPreference = 'Stop'
$scratch = Join-Path ([IO.Path]::GetTempPath()) ('katcat-installation-smoke-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $scratch | Out-Null

function Run-Installer([string]$Path, [int]$Expected = 0) {
  $process = Start-Process -FilePath $Path -ArgumentList '/S' -WindowStyle Hidden -PassThru
  try {
    if (-not $process.WaitForExit(15000)) {
      $process.Kill()
      $process.WaitForExit()
      throw 'Installation-marker smoke installer did not exit'
    }
    if ($process.ExitCode -ne $Expected) { throw "Installer exited with $($process.ExitCode), expected $Expected" }
  } finally { $process.Dispose() }
}

function Compile-Installer([string]$Name, [string]$Target, [string[]]$Options = @()) {
  $output = Join-Path $scratch ($Name + '.exe')
  $fixture = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../tests/fixtures/installer-installation-smoke.nsi'))
  $arguments = @('/WX', '/V2', "/DOUTPUT_FILE=$output", "/DPAYLOAD_FILE=$payload", "/DTARGET_DIR=$Target", "/DDSH_SEVENZIP_PATH=$env:WINDIR\System32\where.exe")
  & $Makensis @arguments @Options $fixture | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'Installation-marker smoke compilation failed' }
  return $output
}

function Read-Marker([string]$Target) {
  $value = [IO.File]::ReadAllText((Join-Path $Target 'katcat-installation-id.txt')).Trim()
  if ($value -notmatch '^\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}$') {
    throw "Invalid installation id: $value"
  }
  return $value
}

try {
  $payload = Join-Path $scratch 'payload.txt'
  [IO.File]::WriteAllText($payload, 'current payload')
  $target = Join-Path $scratch 'Application'
  $installer = Compile-Installer 'success' $target
  Run-Installer $installer
  $first = Read-Marker $target
  Run-Installer $installer
  $second = Read-Marker $target
  if ($first -eq $second) { throw 'Same-build reinstall reused its installation id' }
  Write-Output 'Installation marker smoke passed: fresh installation and same-build reinstall'

  [IO.File]::WriteAllText((Join-Path $target 'previous-only.txt'), 'retained prior payload')
  foreach ($case in @(@{ Name = 'cancelled'; Flag = '/DCANCELLED'; Exit = 1602 }, @{ Name = 'write-failed'; Flag = '/DFAIL_MARKER'; Exit = 2 })) {
    $probe = Compile-Installer $case.Name $target @($case.Flag)
    Run-Installer $probe $case.Exit
    if ((Read-Marker $target) -ne $second -or [IO.File]::ReadAllText((Join-Path $target 'previous-only.txt')) -ne 'retained prior payload') {
      throw "Installation $($case.Name) did not restore the previous id and payload"
    }
    if (@(Get-ChildItem -LiteralPath $scratch -Directory -Filter 'Application.*-*').Count -ne 0) {
      throw "Installation $($case.Name) retained transaction directories"
    }
    Write-Output "Installation marker smoke passed: $($case.Name) rollback"
  }
  $freshFailure = Join-Path $scratch 'FreshFailure'
  $probe = Compile-Installer 'fresh-write-failed' $freshFailure @('/DFAIL_MARKER')
  Run-Installer $probe 2
  if (Test-Path -LiteralPath $freshFailure) { throw 'Failed fresh installation retained its new payload' }
  if (@(Get-ChildItem -LiteralPath $scratch -Directory -Filter 'FreshFailure.*-*').Count -ne 0) { throw 'Failed fresh installation retained transaction directories' }
  Write-Output 'Installation marker smoke passed: fresh write-failure cleanup'
} finally {
  $resolvedScratch = [IO.Path]::GetFullPath($scratch)
  $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
  if (-not $resolvedScratch.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase)) { throw "Refusing cleanup outside temporary directory: $resolvedScratch" }
  Remove-Item -LiteralPath $resolvedScratch -Recurse -Force
}
