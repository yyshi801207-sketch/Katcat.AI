/** Verify installation ids and failure rollback without the real app or registry. */
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { getMakeNsisPath } from 'app-builder-lib/out/toolsets/windows.js'

const compiler = await getMakeNsisPath()
const env = Object.fromEntries(Object.entries(process.env)
  .filter(([key]) => !/KEY|SECRET|TOKEN|PASSWORD|^PSModulePath$/i.test(key)))
const { stdout } = await promisify(execFile)('powershell.exe', [
  '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
  '-File', fileURLToPath(new URL('./smoke-installer-installation.ps1', import.meta.url)),
  '-Makensis', compiler.path,
], { env: { ...env, ...compiler.env }, windowsHide: true, timeout: 60_000 })
process.stdout.write(stdout)
