/** Xiaojing empty-session hero occupants. */

import type { ReactNode } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { XiaojingProductKey } from './locales.ts'
import { useApplicationVersion } from './application-info.ts'
import css from './HeroBrand.module.css'

/** Product copy injected into the hero. */
export interface HeroBrandInjected {
  t: (key: XiaojingProductKey) => string
}

/** Product hero mark props. */
export type HeroBrandMarkProps =
  PropsRuntime<'conversation.hero.brand.mark'> & InjectFace<HeroBrandInjected>

/** Product hero copy props. */
export type HeroBrandContentProps =
  PropsRuntime<'conversation.hero.brand.content'> & InjectFace<HeroBrandInjected>

/** Render the supplied transparent Katcat character pair at the product hero size. */
export function HeroBrandMark({ className, t }: HeroBrandMarkProps): ReactNode {
  const artworkHeight = 1024
  const displayHeight = 'min(220px, 35vh, 55vw)'
  return (
    <svg
      className={[css.logo, className].filter(Boolean).join(' ')}
      style={{ width: `calc(${displayHeight} * 1536 / ${artworkHeight})`, height: displayHeight, overflow: 'hidden' }}
      viewBox={`0 0 1536 ${artworkHeight}`}
      role="img"
      aria-label={t('assistantAlt')}
    >
      <image href="./katcat-hero.png" width="1536" height="1024" />
    </svg>
  )
}

/** Render the Xiaojing product title and release version. */
export function HeroBrandContent({ t }: HeroBrandContentProps): ReactNode {
  const version = useApplicationVersion()
  return (
    <span className={css.titleGroup}>
      <span className={css.title}>{t('heroTitle')}</span>
      <span className={css.badge}>{t('betaBadgeFormat').replace('{version}', version)}</span>
    </span>
  )
}
