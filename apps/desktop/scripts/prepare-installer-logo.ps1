# Compile the installer artwork into white-backed NSIS bitmaps.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$buildPath = Join-Path $PSScriptRoot '../build'
$outputs = @(
    @{ Source = 'installer-robot-source.png'; Name = 'installer-product-logo.bmp'; Width = 480; Height = 400 },
    @{ Source = 'installer-robot-source.png'; Name = 'installer-product-logo-small.bmp'; Width = 72; Height = 72 },
    @{ Source = 'installer-company-source.png'; Name = 'installer-company-logo.bmp'; Width = 110; Height = 28;
       Area = [System.Drawing.RectangleF]::new(45, 135, 2082, 425) }
)
foreach ($output in $outputs) {
    $sourceImage = [System.Drawing.Image]::FromFile([System.IO.Path]::GetFullPath((Join-Path $buildPath $output.Source)))
    try {
        $sourceArea = if ($output.Area) { $output.Area } else { [System.Drawing.RectangleF]::new(0, 0, $sourceImage.Width, $sourceImage.Height) }
        $bitmap = [System.Drawing.Bitmap]::new($output.Width, $output.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $scale = [Math]::Min(($output.Width - 4) / $sourceArea.Width, ($output.Height - 4) / $sourceArea.Height)
                $width = $sourceArea.Width * $scale
                $height = $sourceArea.Height * $scale
                $targetArea = [System.Drawing.RectangleF]::new(($output.Width - $width) / 2, ($output.Height - $height) / 2, $width, $height)
                $graphics.DrawImage($sourceImage, $targetArea, $sourceArea, [System.Drawing.GraphicsUnit]::Pixel)
            } finally {
                $graphics.Dispose()
            }
            $bitmap.Save((Join-Path $buildPath $output.Name), [System.Drawing.Imaging.ImageFormat]::Bmp)
        } finally {
            $bitmap.Dispose()
        }
    } finally {
        $sourceImage.Dispose()
    }
}
