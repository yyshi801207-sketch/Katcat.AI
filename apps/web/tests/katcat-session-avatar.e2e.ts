/** Avatar selection over real sidebar slots, local persistence, and recorded history. */
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { afterAll, expect, it, onTestFailed, vi } from 'vitest'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import {
  acknowledgeReloadConnectionLoss, captureStableAria, compareOrRefreshGolden,
  launchWebScaffold, seedSession, watchConsole, webClientProfile, webSnapshotMode, type WebScaffold,
} from './scaffold.ts'
import { newEnglishPage, saveFailureShot } from './support.ts'

let scaffold: WebScaffold | undefined
let browser: Browser | undefined
afterAll(async () => {
  try { await browser?.close() } finally {
    try { await scaffold?.close() } finally { vi.unstubAllEnvs() }
  }
})

it.skipIf(webClientProfile() !== 'xiaojing')('edits seven cat heads per session, restores saved choices, and fits both themes and small windows', async () => {
  vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'xiaojing')
  scaffold = await launchWebScaffold({})
  const host = scaffold
  const workspace = await host.ctx.workspaceRegistry.create(host.workspaceCwd)
  await workspace.setTitle('Avatar acceptance')
  const fixture = await readFile(new URL('../../../snapshots/web/seeded-history/session.v3.jsonl', import.meta.url), 'utf8')
  const sessionIds = new Map<string, SessionId>()
  for (const [index, title] of ['Research', 'Writing'].entries()) {
    const id = await seedSession(host, fixture, `avatar-${index}`, 'standard')
    sessionIds.set(title, id)
    await workspace.attachSession(id)
    await host.ctx.sessionController.rename({ sessionId: id, title })
  }
  browser = await chromium.launch()
  const page = await newEnglishPage(browser)
  page.setDefaultTimeout(15_000)
  const tripwire = watchConsole(page)
  onTestFailed(async () => {
    console.error(await page.locator('body').innerText())
    await saveFailureShot(page, 'katcat-session-avatar')
  })
  await page.goto(host.authenticatedUrl)
  const tree = page.getByRole('tree', { name: 'Sessions', exact: true })
  const group = tree.getByText('Avatar acceptance', { exact: true }).locator('xpath=ancestor::*[@role="treeitem"][1]')
  await group.waitFor()
  if (await group.getAttribute('aria-expanded') !== 'true') await group.click()
  const row = (title: string) => tree.locator('[data-row-key]').filter({ hasText: title })
  await expect.poll(async () => {
    if (await group.getAttribute('aria-expanded') !== 'true') await group.click()
    return await row('Research').isVisible()
  }, { timeout: 15_000 }).toBe(true)
  const openEditor = async (title: string) => {
    await row(title).hover()
    await row(title).getByRole('button', { name: `Session actions for ${title}`, exact: true }).click()
    await page.getByRole('menuitem', { name: 'Set avatar', exact: true }).click()
    await page.getByRole('dialog', { name: 'Set avatar' }).waitFor()
  }
  await openEditor('Research')
  const dialog = page.getByRole('dialog', { name: 'Set avatar' })
  expect(await dialog.getByRole('group', { name: 'Cat shape' }).getByRole('button').count()).toBe(7)
  const palette = dialog.getByRole('group', { name: 'Avatar color' })
  expect(await palette.getByRole('button').evaluateAll(buttons => buttons.map(button => button.style.getPropertyValue('--katcat-avatar-color'))))
    .toEqual(['#202124', '#ff2849', '#ff6b0b', '#10c477', '#2288ff', '#9253ff', '#f52c93', '#10b8a6'])
  const expected = new URL('./expected/session-avatar/', import.meta.url)
  await mkdir(expected, { recursive: true })
  await compareOrRefreshGolden(fileURLToPath(new URL('editor.expected.md', expected)),
    await captureStableAria(page, '[role="dialog"][aria-label="Set avatar"]', host.workspaceCwd), webSnapshotMode())
  const preview = dialog.locator('svg[width="44"]')
  expect(await preview.evaluate(element => getComputedStyle(element).color)).toBe('rgb(255, 40, 73)')
  const screenshots = fileURLToPath(new URL('../../../output/design/katcat-session-avatar-implemented/', import.meta.url))
  await mkdir(screenshots, { recursive: true })
  await page.screenshot({ path: screenshots + '/light.png' })
  const gestures: { head: string | null; duration: number; iterations: number; moves: boolean }[] = []
  const names = new Set<string>()
  for (const shape of await dialog.getByRole('group', { name: 'Cat shape' }).getByRole('button').all()) {
    await shape.hover()
    const graphic = shape.locator('svg')
    await expect.poll(() => graphic.evaluate(element => element.getAnimations().length)).toBe(1)
    const motion = await graphic.evaluate((element) => {
      const animation = element.getAnimations()[0]!
      animation.pause()
      animation.currentTime = 240
      const timing = animation.effect!.getComputedTiming()
      const transform = getComputedStyle(element).transform
      return {
        name: (animation as CSSAnimation).animationName, head: element.getAttribute('data-head'),
        duration: Number(timing.duration), iterations: Number(timing.iterations),
        moves: transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)',
      }
    })
    names.add(motion.name)
    gestures.push({ head: motion.head, duration: motion.duration, iterations: motion.iterations, moves: motion.moves })
  }
  expect(names.size).toBe(7)
  expect(gestures.every(gesture => gesture.duration === 600 && gesture.iterations === 1 && gesture.moves)).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await dialog.getByRole('button', { name: 'Classic', exact: true }).hover()
  expect(await dialog.locator('svg').evaluateAll(elements => elements.flatMap(element => element.getAnimations()).length)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await dialog.getByRole('button', { name: 'Fluffy', exact: true }).click()
  await dialog.getByLabel('Custom color', { exact: true }).fill('#2288FF')
  await dialog.getByRole('button', { name: 'Done', exact: true }).click()
  const avatar = (title: string) => row(title).locator('svg[viewBox="0 0 64 64"]')
  await expect.poll(() => avatar('Research').getAttribute('style')).toContain('#2288ff')
  expect(await avatar('Writing').getAttribute('style')).toContain('#ff2849')
  expect(await avatar('Writing').getAttribute('data-neutral')).toBeNull()
  const warningStart = tripwire.warnings.length
  await page.reload()
  acknowledgeReloadConnectionLoss(tripwire, warningStart)
  await openEditor('Research')
  expect(await dialog.getByRole('button', { name: 'Fluffy', exact: true }).getAttribute('aria-pressed')).toBe('true')
  expect(await dialog.getByLabel('Custom color', { exact: true }).inputValue()).toBe('#2288FF')
  await dialog.getByRole('button', { name: 'Round', exact: true }).click()
  await page.keyboard.press('Escape')
  await openEditor('Research')
  expect(await dialog.getByRole('button', { name: 'Fluffy', exact: true }).getAttribute('aria-pressed')).toBe('true')
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await openEditor('Writing')
  expect(await dialog.getByRole('button', { name: 'Classic', exact: true }).getAttribute('aria-pressed')).toBe('true')
  await dialog.getByRole('button', { name: 'Green', exact: true }).click()
  await dialog.getByRole('button', { name: 'Done', exact: true }).click()
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Dark', exact: true }).click()
  await expect.poll(() => page.locator('body').getAttribute('data-ds-dark-theme')).not.toBeNull()
  await page.keyboard.press('Escape')
  await row('Research').click()
  await openEditor('Research')
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click()
  expect(await preview.evaluate(element => getComputedStyle(element).color)).toBe('rgb(255, 40, 73)')
  await page.screenshot({ path: screenshots + '/dark.png' })
  await page.setViewportSize({ width: 640, height: 500 })
  await expect.poll(async () => {
    const bounds = await dialog.boundingBox()
    return bounds !== null && bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= 640 && bounds.y + bounds.height <= 500
  }).toBe(true)
  await dialog.getByRole('button', { name: 'Done', exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: screenshots + '/small-window.png' })
  await page.mouse.click(630, 450)
  await dialog.waitFor({ state: 'hidden' })
  await page.setViewportSize({ width: 1680, height: 1000 })
  await row('Research').waitFor()
  expect(await avatar('Research').getAttribute('style')).toContain('#2288ff')
  expect(await avatar('Writing').getAttribute('style')).toContain('#10c477')
  expect(await avatar('Writing').getAttribute('width')).toBe('24')
  expect(await avatar('Writing').getAttribute('height')).toBe('24')
  await page.mouse.move(1600, 20)
  const activity = row('Writing').locator('[data-avatar-status]')
  expect(await activity.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0)
  host.ctx.emit('api-session/status', sessionIds.get('Writing')!, true)
  await expect.poll(() => activity.getAttribute('data-avatar-status')).toBe('ongoing')
  await expect.poll(() => activity.evaluate(element => element.getAnimations()
    .some(animation => animation.effect!.getComputedTiming().iterations === Infinity))).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => activity.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  // Hold the real browser animation at an intermediate frame to observe completion without racing its duration.
  await activity.evaluate((element) => {
    const original = element.animate.bind(element)
    element.animate = (keyframes, options) => {
      const animation = original(keyframes, options)
      animation.pause()
      animation.currentTime = 192
      return animation
    }
  })
  host.ctx.emit('api-session/status', sessionIds.get('Writing')!, false)
  await expect.poll(() => activity.getAttribute('data-avatar-status')).toBe('done')
  await expect.poll(() => activity.evaluate(element => element.getAnimations()
    .some(animation => animation.id === 'katcat-avatar-complete'))).toBe(true)
  const completion = await activity.evaluate((element) => {
    const animation = element.getAnimations().find(candidate => candidate.id === 'katcat-avatar-complete')!
    const timing = animation.effect!.getComputedTiming()
    const transform = getComputedStyle(element).transform
    const result = { duration: Number(timing.duration), iterations: Number(timing.iterations),
      moves: transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)' }
    animation.finish()
    Reflect.deleteProperty(element, 'animate')
    return result
  })
  expect(completion).toEqual({ duration: 480, iterations: 1, moves: true })
  await expect.poll(() => activity.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0)
  const reloadWarningStart = tripwire.warnings.length
  await page.reload()
  acknowledgeReloadConnectionLoss(tripwire, reloadWarningStart)
  await row('Writing').waitFor()
  expect(await row('Writing').locator('[data-avatar-status]').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0)
  await compareOrRefreshGolden(fileURLToPath(new URL('motion.expected.md', expected)),
    JSON.stringify({ gestures, completion, reducedMotion: 'static', reloadedIdle: 'static' }, null, 2), webSnapshotMode())
  expect(tripwire.pageErrors).toEqual([])
  expect(tripwire.warnings).toEqual([])
})
