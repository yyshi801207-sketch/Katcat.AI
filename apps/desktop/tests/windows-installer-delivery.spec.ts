import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { expect, it } from 'vitest'
import { copyWindowsInstallerDelivery } from '../scripts/windows-installer-delivery.ts'

it('uses the Shanghai build date and retains the original installer bytes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'katcat-delivery-'))
  try {
    const source = join(root, 'original.exe')
    const installer = Buffer.from('installer bytes')
    await writeFile(source, installer)
    const destination = await copyWindowsInstallerDelivery(source, join(root, 'delivery'), '1.0.2', new Date('2026-10-22T16:00:00Z'))
    expect(destination).toBe(join(root, 'delivery', 'Katcat.AI-V1.0.2-Windows-x64-20261023.exe'))
    expect(await readFile(destination)).toEqual(installer)
    expect(await readFile(source)).toEqual(installer)
  } finally { await rm(root, { recursive: true, force: true }) }
})
