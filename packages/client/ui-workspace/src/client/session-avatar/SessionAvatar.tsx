/** Session avatar row, menu command, and compact editor over one root-scoped store. */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { HostObservable, PropsHooks, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { IconCheckOutlineRegular, IconUserOutlineRegular, Menu, MenuItemButton, type StateDotState } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionMenuItemProps } from '../contract/slots.ts'
import { CAT_HEADS } from './presets.ts'
import { createSessionAvatarStore, DEFAULT_AVATAR, sessionAvatar, type SessionAvatar } from './store.ts'
import css from './SessionAvatar.module.css'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** Persistent appearance with transient motion derived from the row's primary status. */
    'sidebar.session.row.avatar': {
      kind: 'single'
      scope: 'root'
      owner: {
        sessionId: SessionId
        /** Archived rows remain still; other states match the independent status dot. */
        status: StateDotState | 'archived'
      }
    }
  }
}

/** Editor target and the row that anchors it after the actions menu closes. */
export interface AvatarRequest {
  sessionId: SessionId
  displayTitle: string
  anchor: HTMLElement | null
}

/** Menu contribution raises an editor request without opening the conversation. */
export interface AvatarMenuInjected {
  requestAvatar: (request: AvatarRequest) => void
}

/** Overlay-owned request source and dismissal callback. */
export interface AvatarEditorInjected {
  hooks: { avatarRequest: HostObservable<AvatarRequest | null> }
  dismissAvatar: () => void
}

type AvatarStoreProps = PropsStore<ReturnType<typeof createSessionAvatarStore>>
type RowProps = PropsRuntime<'sidebar.session.row.avatar'> & AvatarStoreProps
type EditorProps = PropsRuntime<'shell.overlay'> & PropsLocale<'workspace'> & AvatarStoreProps
  & PropsHooks<AvatarEditorInjected['hooks']> & Omit<AvatarEditorInjected, 'hooks'>

const COLORS = ['#202124', '#ff2849', '#ff6b0b', '#10c477', '#2288ff', '#9253ff', '#f52c93', '#10b8a6'] as const
const COLOR_KEYS = [
  'avatar.color.0', 'avatar.color.1', 'avatar.color.2', 'avatar.color.3',
  'avatar.color.4', 'avatar.color.5', 'avatar.color.6', 'avatar.color.7',
] as const

/**
 * Draw an approved silhouette without a raster background.
 * @param props - Appearance and optional display size.
 * @returns A decorative, theme-aware SVG.
 */
export function CatAvatar({ value, size = 24 }: { value: Readonly<SessionAvatar>; size?: number }) {
  const head = CAT_HEADS.find(candidate => candidate.id === value.shape) ?? CAT_HEADS[0]
  return <svg
    viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className={css.graphic}
    data-neutral={value.color.toLowerCase() === COLORS[0] ? '' : undefined}
    data-head={head.id}
    style={{ '--katcat-avatar-color': value.color } as CSSProperties}
  ><path d={head.path} transform={head.transform} /></svg>
}

/**
 * Read this row's saved appearance and animate observed activity transitions.
 * @param props - Row identity, primary status, and framework-bound store.
 * @returns A decorative head; existing completion reminders never replay on mount.
 */
export function SessionAvatarRow({ sessionId, status, useStore }: RowProps) {
  const value = useStore(state => sessionAvatar(state, sessionId))
  const element = useRef<HTMLSpanElement>(null)
  const previous = useRef(status)
  useEffect(() => {
    const stopped = previous.current === 'ongoing' && (status === 'idle' || status === 'done')
    previous.current = status
    const target = element.current
    if (!stopped || target === null) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return
    const animation = target.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-2px) scale(1.08)', offset: 0.4 },
      { transform: 'translateY(0.5px) scale(0.98)', offset: 0.75 },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
    animation.id = 'katcat-avatar-complete'
    const cancelOnReduce = () => { if (reduced.matches) animation.cancel() }
    const detach = () => { reduced.removeEventListener('change', cancelOnReduce) }
    reduced.addEventListener('change', cancelOnReduce)
    void animation.finished.then(detach, detach)
    return () => { detach(); animation.cancel() }
  }, [status])
  return <span ref={element} className={css.motion} data-avatar-status={status}><CatAvatar value={value} /></span>
}

/**
 * Open the editor from the existing session actions menu.
 * @param props - Row identity, menu state, and editor request callback.
 * @returns The localized menu command.
 */
export function SessionAvatarMenuItem({
  sessionId, displayTitle, menuAnchor, useMenuOpenState, requestAvatar, t,
}: SessionMenuItemProps<AvatarMenuInjected>) {
  const [, setOpen] = useMenuOpenState()
  return <MenuItemButton icon={<IconUserOutlineRegular />} onSelect={() => {
    setOpen(false)
    requestAvatar({ sessionId, displayTitle, anchor: menuAnchor ?? null })
  }}>{t('avatar.edit')}</MenuItemButton>
}

/**
 * Mount one draft for the requested conversation; dismissal discards it.
 * @param props - Framework store, request hook and localized text.
 * @returns The anchored editor, or null when no editor is requested.
 */
export function SessionAvatarEditor(props: EditorProps) {
  const request = props.useAvatarRequest(value => value)
  const saved = props.useStore(state => request === null ? DEFAULT_AVATAR : sessionAvatar(state, request.sessionId))
  if (request === null) return null
  return <AvatarForm key={request.sessionId} request={request} saved={saved}
    actions={props.actions} close={props.dismissAvatar} t={props.t} />
}

/** One isolated draft; existing menu infrastructure owns portal placement and dismissal. */
function AvatarForm({ request, saved, actions, close, t }: {
  request: AvatarRequest
  saved: Readonly<SessionAvatar>
  actions: AvatarStoreProps['actions']
  close: () => void
  t: EditorProps['t']
}) {
  const [draft, setDraft] = useState<Readonly<SessionAvatar>>(saved)
  const [hex, setHex] = useState(saved.color.toUpperCase())
  const [failed, setFailed] = useState(false)
  const first = useRef<HTMLButtonElement>(null)
  const valid = /^#[\da-f]{6}$/iu.test(hex)
  useEffect(() => { first.current?.focus() }, [])
  const dismiss = () => {
    close()
    request.anchor?.querySelector<HTMLButtonElement>('button')?.focus()
  }
  const chooseColor = (color: string) => {
    setHex(color.toUpperCase())
    setDraft(value => ({ ...value, color }))
    setFailed(false)
  }
  return <Menu open portal side="right" anchor={null} onClose={dismiss}
    getAnchorRect={() => request.anchor?.getBoundingClientRect() ?? new DOMRect(24, 80, 0, 0)}
    listClassName={css.panel}
  >
    <section role="dialog" aria-label={t('avatar.edit')} className={css.editor} onKeyDownCapture={(event) => {
      // The form keeps normal text editing and focus traversal; Escape still belongs to Menu.
      if (['Tab', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) event.stopPropagation()
    }}>
      <header className={css.header}><h2>{t('avatar.edit')}</h2><button type="button" className={css.textButton} onClick={() => {
        setDraft(DEFAULT_AVATAR)
        setHex(DEFAULT_AVATAR.color.toUpperCase())
        setFailed(false)
      }}>{t('avatar.reset')}</button></header>
      <div className={css.preview}><CatAvatar value={draft} size={44} /><span>{request.displayTitle || t('session.untitled')}</span></div>
      <div className={css.section}>
        <div className={css.label}>{t('avatar.shape')}</div>
        <div className={css.shapes} role="group" aria-label={t('avatar.shape')}>
          {CAT_HEADS.map((head, index) => <button key={head.id} type="button" ref={index === 0 ? first : undefined}
            aria-pressed={draft.shape === head.id} className={css.shape} onClick={() => {
              setDraft(value => ({ ...value, shape: head.id }))
              setFailed(false)
            }}>
            <CatAvatar value={{ ...draft, shape: head.id }} size={34} /><span>{t(`avatar.shape.${head.id}`)}</span>
          </button>)}
        </div>
      </div>
      <div className={css.section}>
        <div className={css.label}>{t('avatar.color')}</div>
        <div className={css.colors} role="group" aria-label={t('avatar.color')}>
          {COLORS.map((color, index) => <button key={color} type="button" className={css.swatch}
            style={{ '--katcat-avatar-color': color } as CSSProperties} data-neutral={index === 0 ? '' : undefined}
            aria-label={t(COLOR_KEYS[index] ?? 'avatar.custom')} aria-pressed={draft.color.toLowerCase() === color}
            onClick={() => { chooseColor(color) }}
          ><IconCheckOutlineRegular size={11} /></button>)}
        </div>
        <div className={css.custom}><label htmlFor="katcat-avatar-hex">{t('avatar.custom')}</label>
          <input id="katcat-avatar-hex" className={css.hex} value={hex} maxLength={7} spellCheck={false} aria-invalid={!valid}
            onChange={(event) => {
              const value = event.target.value
              setHex(value)
              if (/^#[\da-f]{6}$/iu.test(value)) setDraft(previous => ({ ...previous, color: value.toLowerCase() }))
            }} />
          <input type="color" className={css.colorInput} aria-label={t('avatar.pickColor')} value={draft.color}
            onChange={(event) => { chooseColor(event.target.value) }} />
        </div>
        {!valid && <div className={css.error} role="alert">{t('avatar.invalidColor')}</div>}
        {failed && <div className={css.error} role="alert">{t('avatar.saveFailed')}</div>}
      </div>
      <footer className={css.footer}><button type="button" className={css.textButton} onClick={dismiss}>{t('cancel')}</button>
        <button type="button" className={css.save} disabled={!valid} onClick={() => {
          try { actions.setAvatar(request.sessionId, { ...draft, color: hex }) }
          catch (error) {
            console.error('Session avatar update failed:', error)
            setFailed(true)
            return
          }
          dismiss()
        }}>{t('avatar.done')}</button></footer>
    </section>
  </Menu>
}
