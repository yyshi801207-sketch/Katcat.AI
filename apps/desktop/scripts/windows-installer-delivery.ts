/** Copy completed Windows installers to the dated Katcat delivery directory. */
import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Copy an installer using its product version and Asia/Shanghai build date.
 * @param source - Installer that completed packaging and runtime checks.
 * @param directory - Directory receiving the delivery copy.
 * @param version - Validated product or explicit build version.
 * @param createdAt - Packaging run creation time.
 * @returns The delivery path; an existing file with this name is replaced.
 */
export async function copyWindowsInstallerDelivery(
  source: string,
  directory: string,
  version: string,
  createdAt: Date,
): Promise<string> {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(createdAt)
  const date = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('')
  const destination = join(directory, `Katcat.AI-V${version}-Windows-x64-${date}.exe`)
  await mkdir(directory, { recursive: true })
  await copyFile(source, destination)
  return destination
}
