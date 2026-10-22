import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'yaml'
import { afterEach, expect, it } from 'vitest'
import { KATCAT_INSTALLATION_FILE, prepareKatcatInstallation, readKatcatInstallationId } from '../src/katcat-installation.ts'

const roots: string[] = []
const firstId = '{11111111-1111-4111-8111-111111111111}'
const secondId = '{22222222-2222-4222-8222-222222222222}'

function fixture(): { root: string; profile: string; userData: string; patch: string; consumed: string } {
  const root = mkdtempSync(join(tmpdir(), 'katcat-installation-'))
  roots.push(root)
  const profile = join(root, 'profile')
  const userData = join(root, 'user-data')
  mkdirSync(profile, { recursive: true })
  writeFileSync(join(profile, 'package.json'), '{}\n')
  return { root, profile, userData, patch: join(profile, 'cordis.patch.yml'), consumed: join(userData, 'desktop', 'installation-theme-id.txt') }
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

it('reads a successful installer GUID and permits an unpacked build without a marker', async () => {
  const { root } = fixture()
  expect(await readKatcatInstallationId(root)).toBeUndefined()
  writeFileSync(join(root, KATCAT_INSTALLATION_FILE), firstId + '\r\n')
  expect(await readKatcatInstallationId(root)).toBe(firstId)
  writeFileSync(join(root, KATCAT_INSTALLATION_FILE), 'incomplete installation')
  await expect(readKatcatInstallationId(root)).rejects.toThrow('identifier is invalid')
})

it('initializes light appearance while retaining acknowledgement, typography, provider and session data', async () => {
  const { root, profile, userData, patch, consumed } = fixture()
  const original = [
    { id: 'ui-theme', config: { preference: 'dark', fontSize: 18, textFontFamily: 'My Font' } },
    { id: 'ui-settings-general', config: { welcomeNoticeVersion: '2026-09-28.1' } },
    { id: 'llm-deepseek', config: { credential: 'saved-reference' } },
  ]
  writeFileSync(patch, JSON.stringify(original))
  const session = join(root, 'keep-session.jsonl')
  writeFileSync(session, 'existing session data\n')
  await prepareKatcatInstallation(profile, userData, firstId)
  expect(parse(readFileSync(patch, 'utf8'))).toEqual([
    { ...original[0], config: { ...original[0]!.config, preference: 'light' } },
    original[1], original[2],
  ])
  expect(readFileSync(session, 'utf8')).toBe('existing session data\n')
  expect(readFileSync(consumed, 'utf8').trim()).toBe(firstId)
})

it('preserves a later dark selection on ordinary restart and resets it for a same-build reinstall', async () => {
  const { profile, userData, patch } = fixture()
  await prepareKatcatInstallation(profile, userData, firstId)
  const dark = '# Selected after installation\n- id: ui-theme\n  config:\n    preference: dark\n    fontSize: 17\n'
  writeFileSync(patch, dark)
  await prepareKatcatInstallation(profile, userData, firstId)
  expect(readFileSync(patch, 'utf8')).toBe(dark)
  await prepareKatcatInstallation(profile, userData, secondId)
  expect(parse(readFileSync(patch, 'utf8'))).toEqual([{ id: 'ui-theme', config: { preference: 'light', fontSize: 17 } }])
  expect(readFileSync(patch, 'utf8')).toContain('# Selected after installation')
})

it('retains expressions and other rows when adding the appearance override', async () => {
  const { profile, userData, patch } = fixture()
  writeFileSync(patch, '# User configuration\n- id: custom\n  config:\n    dynamic: !!js ctx.someValue\n')
  await prepareKatcatInstallation(profile, userData, firstId)
  const text = readFileSync(patch, 'utf8')
  expect(text).toContain('# User configuration')
  expect(text).toContain('!!js ctx.someValue')
  expect(text).toContain('preference: light')
})

it('does not consume an installation or overwrite an unreadable profile', async () => {
  const { profile, userData, patch, consumed } = fixture()
  const malformed = 'not: [a valid profile\n'
  writeFileSync(patch, malformed)
  await expect(prepareKatcatInstallation(profile, userData, firstId)).rejects.toThrow()
  expect(readFileSync(patch, 'utf8')).toBe(malformed)
  expect(existsSync(consumed)).toBe(false)
})
