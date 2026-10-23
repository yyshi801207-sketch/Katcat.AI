// @vitest-environment jsdom
/** Per-session avatar editing, dismissal, and browser-local persistence. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { allowAllAccess, bindSnapshotSelector, makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import type { GlobalStandardProps, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { en as commonEn } from '@deepseek-ai/dsh-client-locale/src/locales/en.ts'
import {
  SessionAvatarEditor, SessionAvatarMenuItem, SessionAvatarRow, type AvatarRequest,
} from '../src/client/session-avatar/SessionAvatar.tsx'
import { createSessionAvatarStore, DEFAULT_AVATAR, sessionAvatar } from '../src/client/session-avatar/store.ts'
import { en, zh } from '../src/client/locales.ts'

const sid = (id: string) => id as SessionId
const t: PropsLocale<'workspace'>['t'] = makeTranslate(zh, commonZh)
const tEn: PropsLocale<'workspace'>['t'] = makeTranslate(en, commonEn)
const standard: GlobalStandardProps = {
  ...allowAllAccess,
  useSessions: select => select({ ids: [], byId: {}, phase: 'ready', projectionsBySession: {} }),
  useSessionStatus: select => select(new Map()),
  useSessionRetainInfo: () => undefined,
  usePanelInfo: select => select({ activePanelId: null }),
  useResource: () => ({ status: 'none', value: undefined, failure: undefined, reload: () => {} }),
  useWorkspaces: select => select({ items: [], archivedSessionIds: [], pinnedSessionIds: [], state: 'idle', phase: 'ready', error: null }),
}

beforeEach(() => { localStorage.clear() })
afterEach(cleanup)

function editor(translate = t) {
  const store = createSessionAvatarStore().create()
  const request = createSnapshotStore<AvatarRequest | null>({ sessionId: sid('one'), displayTitle: 'Research', anchor: null })
  const close = vi.fn(() => { request.set(null) })
  const props: Parameters<typeof SessionAvatarEditor>[0] = {
    ...standard, t: translate, useStore: bindSnapshotSelector(store), actions: store.actions,
    useAvatarRequest: bindSnapshotSelector(request), dismissAvatar: close,
  }
  const view = render(<SessionAvatarEditor {...props} />)
  const reopen = (id: string) => {
    act(() => { request.set({ sessionId: sid(id), displayTitle: id, anchor: null }) })
  }
  return { store, request, close, view, reopen }
}

describe('session avatar editor', () => {
  it('keeps an unnamed historical session distinct from a new session', () => {
    const b = editor(tEn)
    act(() => { b.request.set({ sessionId: sid('one'), displayTitle: '', anchor: null }) })
    expect(screen.getByText('Untitled')).toBeTruthy()
  })

  it.each([t, tEn])('closes the session menu before requesting the anchored editor', (translate) => {
    const setOpen = vi.fn()
    const requestAvatar = vi.fn()
    const menuAnchor = document.createElement('div')
    render(<SessionAvatarMenuItem {...standard} t={translate} sessionId={sid('one')} displayTitle="Research"
      menuAnchor={menuAnchor} useShortcuts={select => select([])} useMenuOpenState={() => [true, setOpen]} requestAvatar={requestAvatar} />)
    fireEvent.click(screen.getByRole('menuitem', { name: translate('avatar.edit') }))
    expect(setOpen).toHaveBeenCalledExactlyOnceWith(false)
    expect(requestAvatar).toHaveBeenCalledExactlyOnceWith({ sessionId: sid('one'), displayTitle: 'Research', anchor: menuAnchor })
    expect(setOpen.mock.invocationCallOrder[0]).toBeLessThan(requestAvatar.mock.invocationCallOrder[0]!)
  })

  it('offers seven approved heads, saves only the chosen session, and restores it after reload', () => {
    const b = editor()
    const shapes = within(screen.getByRole('group', { name: '猫咪形态' })).getAllByRole('button')
    expect(shapes.map(button => button.textContent)).toEqual(['经典', '圆脸', '尖耳', '折耳', '歪头', '毛绒', '长脸'])
    expect(document.activeElement).toBe(shapes[0])
    fireEvent.click(screen.getByRole('button', { name: '毛绒' }))
    fireEvent.change(screen.getByLabelText('自定义颜色', { exact: true }), { target: { value: '#785AC8' } })
    expect(sessionAvatar(b.store.getSnapshot(), sid('one'))).toEqual(DEFAULT_AVATAR)
    fireEvent.click(screen.getByRole('button', { name: '完成' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const restored = createSessionAvatarStore().create()
    expect(sessionAvatar(restored.getSnapshot(), sid('one'))).toEqual({ shape: 'fluffy', color: '#785ac8' })
    expect(sessionAvatar(restored.getSnapshot(), sid('two'))).toEqual(DEFAULT_AVATAR)
    b.reopen('two')
    expect(screen.getByRole('button', { name: '经典' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: '亮蓝' }))
    fireEvent.click(screen.getByRole('button', { name: '完成' }))
    expect(sessionAvatar(b.store.getSnapshot(), sid('one'))).toEqual({ shape: 'fluffy', color: '#785ac8' })
    expect(sessionAvatar(b.store.getSnapshot(), sid('two'))).toEqual({ shape: 'classic', color: '#2288ff' })
  })

  it.each(['cancel', 'escape', 'outside'] as const)('discards drafts on %s and reopens the saved selection', (method) => {
    const b = editor()
    fireEvent.click(screen.getByRole('button', { name: '折耳' }))
    fireEvent.click(screen.getByRole('button', { name: '品牌红' }))
    if (method === 'cancel') fireEvent.click(screen.getByRole('button', { name: '取消' }))
    else if (method === 'escape') fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    else fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(b.store.getSnapshot()).toEqual({})
    b.reopen('one')
    expect(screen.getByRole('button', { name: '经典' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByLabelText<HTMLInputElement>('自定义颜色', { exact: true }).value).toBe('#FF2849')
  })

  it('validates custom HEX and keeps reset as a draft until Done', () => {
    const b = editor(tEn)
    const input = screen.getByLabelText('Custom color', { exact: true })
    fireEvent.change(input, { target: { value: '#bad' } })
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Done' }).disabled).toBe(true)
    expect(screen.getByRole('alert').textContent).toContain('six hexadecimal')
    fireEvent.change(input, { target: { value: '#12ABCD' } })
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    b.reopen('one')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(sessionAvatar(b.store.getSnapshot(), sid('one')).color).toBe('#12abcd')
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(sessionAvatar(b.store.getSnapshot(), sid('one'))).toEqual(DEFAULT_AVATAR)
  })

  it('updates row rendering through the same store without replacing its session identity', () => {
    const store = createSessionAvatarStore().create()
    const view = render(<SessionAvatarRow {...standard} sessionId={sid('one')} status="idle" useStore={bindSnapshotSelector(store)} actions={store.actions} />)
    expect(view.container.querySelector('svg')?.hasAttribute('data-neutral')).toBe(false)
    act(() => { store.actions.setAvatar(sid('one'), { shape: 'round', color: '#202124' }) })
    const svg = view.container.querySelector('svg')!
    expect(svg.hasAttribute('data-neutral')).toBe(true)
    expect(svg.style.getPropertyValue('--katcat-avatar-color')).toBe('#202124')
  })

  it.each([null, [], { one: null }, { one: { shape: 'side', color: '#202124' } }, { one: { shape: 'classic', color: 'url(test)' } }])(
    'uses the default for malformed persisted preferences: %j', (state) => {
      localStorage.setItem('katcat.session-avatars.v1', JSON.stringify(state))
      expect(sessionAvatar(createSessionAvatarStore().create().getSnapshot(), sid('one'))).toEqual(DEFAULT_AVATAR)
    },
  )
})

describe('session avatar activity motion', () => {
  const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate')
  let media: EventTarget & { matches: boolean }
  let animations: { animation: Animation; cancel: () => void; finish: () => void }[]

  beforeEach(() => {
    media = Object.assign(new EventTarget(), { matches: false })
    animations = []
    vi.stubGlobal('matchMedia', () => media)
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value() {
        let resolve!: (animation: Animation) => void
        let reject!: (reason: Error) => void
        const finished = new Promise<Animation>((yes, no) => { resolve = yes; reject = no })
        const cancel: Animation['cancel'] = vi.fn(() => { reject(new DOMException('Cancelled', 'AbortError')) })
        const animation = { id: '', finished, cancel } as Animation
        animations.push({ animation, cancel, finish: () => { resolve(animation) } })
        return animation
      },
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    if (originalAnimate === undefined) Reflect.deleteProperty(HTMLElement.prototype, 'animate')
    else Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate)
  })

  function row(status: Parameters<typeof SessionAvatarRow>[0]['status']) {
    const store = createSessionAvatarStore().create()
    const draw = (state: typeof status) => <SessionAvatarRow {...standard} sessionId={sid('motion')}
      status={state} useStore={bindSnapshotSelector(store)} actions={store.actions} />
    const view = render(draw(status))
    return { ...view, setStatus: (state: typeof status) => { view.rerender(draw(state)) } }
  }

  it('bounces only after observed work stops, and cancels on restart and unmount', () => {
    const view = row('ongoing')
    expect(animations).toHaveLength(0)
    view.setStatus('done')
    expect(animations).toHaveLength(1)
    view.setStatus('idle')
    view.setStatus('done')
    expect(animations).toHaveLength(1)
    view.setStatus('ongoing')
    expect(animations[0]!.cancel).toHaveBeenCalled()
    view.setStatus('idle')
    expect(animations).toHaveLength(2)
    view.unmount()
    expect(animations[1]!.cancel).toHaveBeenCalledOnce()
  })

  it('does not replay an existing completion reminder on mount', () => {
    const view = row('done')
    view.setStatus('idle')
    view.setStatus('done')
    expect(animations).toHaveLength(0)
  })

  it.each(['warning', 'archived', 'error'] as const)('does not celebrate work entering %s', (status) => {
    const view = row('ongoing')
    view.setStatus(status)
    view.setStatus('idle')
    expect(animations).toHaveLength(0)
  })

  it('keeps completion still when reduced motion is enabled', () => {
    media.matches = true
    const view = row('ongoing')
    view.setStatus('done')
    expect(animations).toHaveLength(0)
  })

  it('cancels an in-flight bounce when reduced motion is enabled and releases its listener', async () => {
    const remove = vi.spyOn(media, 'removeEventListener')
    const view = row('ongoing')
    view.setStatus('done')
    await act(async () => {
      media.matches = true
      media.dispatchEvent(new Event('change'))
      await Promise.resolve()
    })
    expect(animations[0]!.cancel).toHaveBeenCalledOnce()
    expect(remove).toHaveBeenCalledOnce()
  })

  it('releases the preference listener after a bounce finishes', async () => {
    const remove = vi.spyOn(media, 'removeEventListener')
    const view = row('ongoing')
    view.setStatus('idle')
    await act(async () => { animations[0]!.finish(); await Promise.resolve() })
    expect(remove).toHaveBeenCalledOnce()
    media.matches = true
    media.dispatchEvent(new Event('change'))
    expect(animations[0]!.cancel).not.toHaveBeenCalled()
  })
})
