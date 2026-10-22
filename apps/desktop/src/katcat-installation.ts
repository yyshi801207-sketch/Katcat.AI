/** Per-installation appearance initialization before the Desktop Host starts. */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { isMap, isScalar, isSeq, parseDocument } from 'yaml'

/** Installer-owned GUID file, replaced even by a same-version reinstall. */
export const KATCAT_INSTALLATION_FILE = 'katcat-installation-id.txt'

/**
 * Read the successful installation identifier; unpacked builds may have none.
 * @param directory - Directory containing the installed application executable.
 * @returns The installer GUID, or undefined for a build without an installer marker.
 */
export async function readKatcatInstallationId(directory: string): Promise<string | undefined> {
  const value = await readOptional(join(directory, KATCAT_INSTALLATION_FILE))
  if (value === undefined) return undefined
  const id = value.trim()
  if (!/^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/iu.test(id)) {
    throw new Error('Katcat installation identifier is invalid')
  }
  return id
}

/**
 * Initialize light appearance once for an installation, preserving other profile fields.
 * The caller holds the Desktop profile lock and has initialized its package metadata.
 * @param profile - Desktop profile directory whose patch stores the theme preference.
 * @param userData - Application data directory containing the consumed installation record.
 * @param installationId - Validated identifier read from the installed application.
 * @returns Fulfillment after the patch and then its consumed record have been saved.
 */
export async function prepareKatcatInstallation(profile: string, userData: string, installationId: string): Promise<void> {
  await withFileLock(join(profile, 'package.json'), async () => {
    const consumed = join(userData, 'desktop', 'installation-theme-id.txt')
    if ((await readOptional(consumed))?.trim() === installationId) return
    const patch = join(profile, 'cordis.patch.yml')
    const document = parseDocument(await readOptional(patch) ?? '[]\n', {
      customTags: [{ tag: 'tag:yaml.org,2002:js', resolve: (value: string) => value }],
    })
    if (document.errors[0] !== undefined) throw document.errors[0]
    if (!isSeq(document.contents)) throw new Error('Katcat profile patch must be a YAML sequence')
    let found = false
    for (const item of document.contents.items) {
      if (!isMap(item) || item.has('insert')) continue
      const id: unknown = item.get('id', true)
      if (!isScalar(id) || id.value !== 'ui-theme') continue
      const config = item.get('config', true)
      if (config !== undefined && !isMap(config)) throw new Error('Katcat theme configuration must be a YAML mapping')
      item.setIn(['config', 'preference'], 'light')
      found = true
    }
    if (!found) document.add({ id: 'ui-theme', config: { preference: 'light' } })
    await writeFileAtomic(patch, String(document), { mode: 0o600 })
    await writeFileAtomic(consumed, installationId + '\n', { mode: 0o600, dirMode: 0o700 })
  })
}

/** Read a private initialization file while preserving errors other than absence. */
async function readOptional(path: string): Promise<string | undefined> {
  try { return await readFile(path, 'utf8') }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}
