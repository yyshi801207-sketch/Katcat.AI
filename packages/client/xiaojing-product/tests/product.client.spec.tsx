// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { Context } from '@deepseek-ai/cordis'
import { allowAllAccess } from '@deepseek-ai/dsh-client-test-runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { AgentPresetDisplayRegistry } from '@deepseek-ai/dsh-client-ui-agent-preset/client'
import { AboutSection } from '../src/client/AboutSection.tsx'
import { XIAOJING_PRODUCT_VERSION } from '../src/client/application-info.ts'
import { HeroBrandContent, HeroBrandMark } from '../src/client/HeroBrand.tsx'
import { SidebarBrandMark, SidebarBrandName } from '../src/client/SidebarBrand.tsx'
import { OnboardingContent } from '../src/client/OnboardingContent.tsx'
import { apply, inject } from '../src/client/index.ts'
import { en, zh } from '../src/client/locales.ts'
import { XIAOJING_RELEASE_HISTORY } from '../src/client/release-history.ts'

const t = (key: keyof typeof zh): string => zh[key]
const unusedHook = (() => { throw new Error('unused by Xiaojing product components') }) as never
const kit = {
  ...allowAllAccess,
  useSessions: unusedHook, useWorkspaces: unusedHook, usePanelInfo: unusedHook,
  useSessionStatus: unusedHook, useSessionRetainInfo: unusedHook, useResource: unusedHook,
  useSession: unusedHook, useProjection: unusedHook, useConversation: unusedHook,
  useInput: unusedHook, inputActions: undefined, sessionId: undefined,
}

function sessionHook(agentPreset?: string) {
  const summary = { projectionValues: agentPreset === undefined ? {} : { agentPreset } }
  return ((selector: (state: { byId: Record<string, typeof summary> }) => unknown) =>
    selector({ byId: { current: summary } })) as never
}

afterEach(() => {
  cleanup()
  document.getElementById('root')?.remove()
  document.querySelectorAll('meta[name="theme-color"]').forEach((node) => { node.remove() })
  document.body.style.removeProperty('background-color')
  delete document.body.dataset.xiaojingProduct
  delete document.documentElement.dataset.dshClientBuildProfile
  Reflect.deleteProperty(window, 'xiaojingDesktop')
  vi.unstubAllEnvs()
})

const HOLES = [
  'sidebar.brand.mark',
  'sidebar.brand.name',
  'conversation.hero.brand.mark',
  'conversation.hero.brand.content',
  'conversation.chat.node',
  'onboarding.content',
  'settings.section',
] as const

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  ctx.provide('agentPresetDisplay', new AgentPresetDisplayRegistry())
  const disposeHoles = slots.register({
    name: 'root',
    children: Object.fromEntries(HOLES.map(name => [name, {
      kind: name === 'settings.section' ? 'list' : name === 'conversation.chat.node' ? 'keyed' : 'single',
      scope: name === 'conversation.chat.node' ? 'session' : 'root',
    }])),
  } as never, () => null)
  return { ctx, slots, disposeHoles }
}

describe('Xiaojing product UI', () => {
  it('restores the first-use guide and platform link without the Harness developer introduction', () => {
    const root = document.createElement('div')
    root.id = 'root'
    root.inert = false
    document.body.append(root)
    const acknowledge = vi.fn(async () => {})
    const view = render(<OnboardingContent {...kit} acknowledge={acknowledge} saving={false} failed={false} t={t} />)
    const dialog = screen.getByRole('dialog', { name: '初次使用说明' })
    expect(dialog.querySelectorAll('li')).toHaveLength(2)
    expect(dialog.textContent).not.toContain('Harness')
    for (const key of ['onboardingGetKeyBody', 'onboardingConnectBody', 'onboardingManageKey', 'onboardingSecurity', 'onboardingLaterHint'] as const) {
      expect(screen.getByText(zh[key], { exact: true })).toBeTruthy()
    }
    expect(screen.getByRole('link', { name: zh.platform }).getAttribute('href')).toBe('https://platform.deepseek.com/')
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: zh.onboardingTitle }))
    expect(root.inert).toBe(true)
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(document.querySelector('[class*="mask"]')!)
    expect(acknowledge).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: zh.start }))
    expect(acknowledge).toHaveBeenCalledOnce()
    view.unmount()
    expect(root.inert).toBe(false)
  })

  it('keeps the guide action disabled during save and reports acknowledgement failure', () => {
    const acknowledge = vi.fn(async () => {})
    const view = render(<OnboardingContent {...kit} acknowledge={acknowledge} saving failed={false} t={t} />)
    const action = screen.getByRole<HTMLButtonElement>('button', { name: zh.start })
    expect(action.disabled).toBe(true)
    fireEvent.click(action)
    expect(acknowledge).not.toHaveBeenCalled()
    view.rerender(<OnboardingContent {...kit} acknowledge={acknowledge} saving={false} failed t={t} />)
    expect(screen.getByRole('alert').textContent).toBe(zh.saveError)
    expect(action.disabled).toBe(false)
  })

  it('uses the English product guide in the English locale', () => {
    render(<OnboardingContent {...kit} acknowledge={async () => {}} saving={false} failed={false} t={key => en[key]} />)
    expect(screen.getByRole('dialog', { name: en.onboardingTitle })).toBeTruthy()
    expect(screen.getByRole('button', { name: en.start })).toBeTruthy()
    for (const key of ['onboardingGetKeyBody', 'onboardingConnectBody', 'onboardingManageKey', 'onboardingSecurity', 'onboardingLaterHint'] as const) {
      expect(screen.getByText(en[key], { exact: true })).toBeTruthy()
    }
  })

  it('renders the product hero copy and beta badge', () => {
    render(<HeroBrandMark {...kit} useSessions={sessionHook()} size={34} className="hero-mark" t={t} />)
    expect(screen.getByRole('img', { name: 'Katcat' }).querySelector('image')?.getAttribute('href')).toBe('./katcat-hero.png')
    expect(screen.getByRole('img', { name: 'Katcat' }).style.width.replaceAll(' ', ''))
      .toBe('calc(min(220px,35vh,55vw)*1536/1024)')
    render(<HeroBrandContent {...kit} useSessions={sessionHook('standard')} t={t} />)
    expect(screen.getByText('Katcat, 您的超级个人助理')).toBeTruthy()
    expect(screen.getByText(`V${XIAOJING_PRODUCT_VERSION}`)).toBeTruthy()
    cleanup()
    render(<HeroBrandContent {...kit} sessionId={'current' as never} useSessions={sessionHook('finance')} t={t} />)
    expect(screen.getByText('Katcat, 您的超级个人助理')).toBeTruthy()
    expect(screen.queryByText('小兢办公，您的AI财务助手')).toBeNull()
  })

  it('keeps office artwork when an older session has Finance metadata', () => {
    const props = { ...kit, sessionId: 'current' as never, size: 34, t }
    const view = render(<HeroBrandMark {...props} useSessions={sessionHook('standard')} />)
    const artwork = () => screen.getByRole('img', { name: 'Katcat' }).querySelector('image')?.getAttribute('href')
    expect(artwork()).toBe('./katcat-hero.png')
    view.rerender(<HeroBrandMark {...props} useSessions={sessionHook('finance')} />)
    expect(artwork()).toBe('./katcat-hero.png')
    expect(screen.getByRole('img', { name: 'Katcat' }).getAttribute('viewBox')).toBe('0 0 1536 1024')
    expect(screen.getByRole('img', { name: 'Katcat' }).style.width.replaceAll(' ', ''))
      .toBe('calc(min(220px,35vh,55vw)*1536/1024)')
    expect(readFileSync('apps/web/public/xiaojing-office-robot-logo.png')
      .equals(readFileSync('apps/web/public/xiaojing-finance-robot-logo.png'))).toBe(true)
    view.rerender(<HeroBrandMark {...props} useSessions={sessionHook('standard')} />)
    expect(artwork()).toBe('./katcat-hero.png')
    expect(screen.getByRole('img', { name: 'Katcat' }).getAttribute('viewBox')).toBe('0 0 1536 1024')
  })

  it('renders independent sidebar mark and name occupants', () => {
    const view = render(<SidebarBrandMark {...kit} size={24} />)
    expect(view.container.querySelector('image[href="./katcat-wordmark.png"]')).toBeTruthy()
    expect(view.container.querySelector('svg')?.getAttribute('width')).toBe('24')
    expect(view.container.querySelector('svg')?.getAttribute('height')).toBe('24')
    expect(view.container.querySelector('svg')?.getAttribute('viewBox')).toBe('45 135 425 425')
    render(<SidebarBrandName {...kit} t={t} />)
    expect(screen.getByRole('img', { name: 'Katcat.AI' }).querySelector('image')?.getAttribute('href')).toBe('./katcat-wordmark.png')
    expect(screen.queryByText('您的AI办公搭子')).toBeNull()
    const css = readFileSync('packages/client/xiaojing-product/src/client/SidebarBrand.module.css', 'utf8')
    expect(css).toContain('padding-right: 4px')
  })

  it.each([['zh', zh], ['en', en]] as const)('shows only product and base versions in About (%s)', (_language, dictionary) => {
    vi.stubEnv('DSH_CLIENT_VERSION', '0.2.1-rc.2')
    const view = render(<AboutSection {...kit} close={vi.fn()} t={key => dictionary[key]} />)
    expect(screen.getByRole('heading', { name: 'Katcat.AI' })).toBeTruthy()
    expect(screen.getByText(dictionary.version + ' v' + XIAOJING_PRODUCT_VERSION)).toBeTruthy()
    expect(screen.getByText(dictionary.kernelVersion + ' 0.2.1-rc.2')).toBeTruthy()
    expect(screen.queryByText(dictionary.aboutDescription)).toBeNull()
    expect(screen.queryByText(dictionary.historyTitle)).toBeNull()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(view.container.querySelectorAll('header > *')).toHaveLength(4)
  })

  it('does not invent a DSH version when build metadata is absent', () => {
    vi.stubEnv('DSH_CLIENT_VERSION', undefined)
    render(<AboutSection {...kit} close={vi.fn()} t={t} />)
    expect(screen.queryByText(/DSH 底座版本/u)).toBeNull()
  })

  it('keeps the current version first and preserves distinct historical versions', () => {
    const versions = XIAOJING_RELEASE_HISTORY.map(release => release.version)
    expect(versions[0]).toBe(XIAOJING_PRODUCT_VERSION)
    expect(new Set(versions).size).toBe(versions.length)
    expect(versions).toEqual(['1.0.0', '0.3.3', '0.3.2', '0.3.1', '0.2.4', '0.2.3', '0.2.2'])
  })

  it('hides system prompts in Xiaojing transcripts without removing the generic renderer', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'xiaojing')
    const product = await bench()
    const GenericSystemPrompt = () => <div>System prompt</div>
    const disposeGeneric = product.slots.register({
      name: 'conversation.chat.node', key: 'system-prompt',
    }, GenericSystemPrompt as never)
    const fiber = product.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    const winner = product.slots.entriesOfSlot('conversation.chat.node')
      .find(entry => entry.options.key === 'system-prompt')
    expect(winner?.options.priority).toBe(-1)
    expect(winner?.component).not.toBe(GenericSystemPrompt)
    expect((winner?.component as () => unknown)()).toBeNull()

    await fiber.dispose()
    expect(product.slots.entriesOfSlot('conversation.chat.node')[0]?.component).toBe(GenericSystemPrompt)
    disposeGeneric()
    await product.ctx.fiber.dispose()
  })

  it('activates every product occupant and theme only for the Xiaojing build profile', async () => {
    expect(inject).toEqual(['slots', 'locale'])
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'official')
    const official = await bench()
    await official.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(official.slots.entries(hole)).toHaveLength(0)
    expect(document.body.dataset.xiaojingProduct).toBeUndefined()
    expect(document.documentElement.dataset.dshClientBuildProfile).toBeUndefined()
    await official.ctx.fiber.dispose()

    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'xiaojing')
    const themeColor = document.createElement('meta')
    themeColor.name = 'theme-color'
    themeColor.content = 'rgb(255, 255, 255)'
    document.head.append(themeColor)
    document.body.style.backgroundColor = 'rgb(251, 253, 253)'
    const product = await bench()
    const fiber = product.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(product.slots.entries(hole)).toHaveLength(1)
    expect(document.body.dataset.xiaojingProduct).toBe('')
    expect(document.documentElement.dataset.dshClientBuildProfile).toBe('xiaojing')
    expect(themeColor.content).toBe('rgb(251, 253, 253)')
    expect(product.ctx.agentPresetDisplay.resolve({ id: 'finance' }, key => key))
      .toEqual({ name: 'finance' })
    document.body.style.backgroundColor = 'rgb(255, 255, 255)'
    await fiber.dispose()
    for (const hole of HOLES) expect(product.slots.entries(hole)).toHaveLength(0)
    expect(document.body.dataset.xiaojingProduct).toBeUndefined()
    expect(document.documentElement.dataset.dshClientBuildProfile).toBeUndefined()
    expect(themeColor.content).toBe('rgb(255, 255, 255)')
    await product.ctx.fiber.dispose()
  })

})
