/** Xiaojing sidebar brand occupants. */

import type { ReactNode } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { XiaojingProductKey } from './locales.ts'
import css from './SidebarBrand.module.css'

/** Product copy injected into the sidebar name. */
export interface SidebarBrandInjected {
  t: (key: XiaojingProductKey) => string
}

/** Render the wordmark's K in the collapsed navigation rail. */
export function SidebarBrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>): ReactNode {
  return (
    <svg className={css.avatar} width={size} height={size} viewBox="45 135 425 425" aria-hidden="true">
      <image href="./katcat-wordmark.png" width="2172" height="724" />
    </svg>
  )
}

/** Render the supplied Katcat.AI wordmark without its outer canvas margin. */
export function SidebarBrandName(
  { t }: PropsRuntime<'sidebar.brand.name'> & InjectFace<SidebarBrandInjected>,
): ReactNode {
  return (
    <span className={css.name}>
      <svg className={css.wordmark} viewBox="45 135 2082 425" role="img" aria-label={t('brandAlt')}>
        <image href="./katcat-wordmark.png" width="2172" height="724" />
        <svg x="1780" width="392" height="724" viewBox="1780 0 392 724" className={css.suffix}>
          <image href="./katcat-wordmark.png" width="2172" height="724" />
        </svg>
      </svg>
    </span>
  )
}
