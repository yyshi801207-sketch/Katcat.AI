/** Browser-local avatar preferences shared by session rows and their editor. */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { CAT_HEADS, type CatHead } from './presets.ts'

/** One session's silhouette and opaque sRGB color. */
export interface SessionAvatar {
  shape: CatHead
  color: string
}

/** Default classic cat head in the red preset color. */
export const DEFAULT_AVATAR: Readonly<SessionAvatar> = { shape: 'classic', color: '#ff2849' }

/**
 * Read preferences loaded by the shared persistence engine, rejecting malformed entries.
 * @param state - Persisted preference map.
 * @param id - Session whose avatar is requested.
 * @returns The valid saved appearance or the default red cat head.
 */
export function sessionAvatar(state: unknown, id: SessionId): Readonly<SessionAvatar> {
  if (typeof state !== 'object' || state === null || !Object.hasOwn(state, id)) return DEFAULT_AVATAR
  const value: unknown = Reflect.get(state, id)
  if (typeof value !== 'object' || value === null) return DEFAULT_AVATAR
  const shape: unknown = Reflect.get(value, 'shape')
  const color: unknown = Reflect.get(value, 'color')
  if (!CAT_HEADS.some(head => head.id === shape) || typeof color !== 'string' || !/^#[\da-f]{6}$/iu.test(color)) return DEFAULT_AVATAR
  return value as SessionAvatar
}

/**
 * Declare one root-scoped map, persisted on this browser/desktop installation.
 * @returns Handle shared by all row avatars and the settings overlay.
 */
export function createSessionAvatarStore(): EngineStoreHandle<Record<string, SessionAvatar>, {
  setAvatar: (draft: Record<string, SessionAvatar>, id: SessionId, value: SessionAvatar) => void
}> {
  return defineStore({
    init: (): Record<string, SessionAvatar> => ({}),
    persist: 'katcat.session-avatars.v1',
    actions: {
      setAvatar: (draft: Record<string, SessionAvatar>, id: SessionId, value: SessionAvatar) => {
        draft[id] = { shape: value.shape, color: value.color.toLowerCase() }
      },
    },
  })
}
