/** Katcat product identity and installed application versions. */

import type { ReactNode } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { useApplicationVersion } from './application-info.ts'
import type { XiaojingProductKey } from './locales.ts'
import css from './AboutSection.module.css'

/** Product copy injected into the About settings section. */
export interface AboutSectionInjected {
  t: (key: XiaojingProductKey) => string
}

/** Complete About settings-section props. */
export type AboutSectionProps = PropsRuntime<'settings.section'> & InjectFace<AboutSectionInjected>

/**
 * Render the product name, application version, and compiled DSH version.
 * @param props - settings callbacks and localized product copy.
 * @returns the compact About page.
 */
export function AboutSection({ t }: AboutSectionProps): ReactNode {
  const version = useApplicationVersion()
  const kernelVersion = process.env.DSH_CLIENT_VERSION
  return (
    <section className={css.root} data-xiaojing-about>
      <header className={css.hero}>
        <img className={css.appIcon} src="./xiaojing-character-logo.png" alt={t('assistantAlt')} />
        <h2>{t('aboutTitle')}</h2>
        <span className={css.version}>{t('version')} {t('versionPrefix')}{version}</span>
        {kernelVersion !== undefined && <span className={css.version}>{t('kernelVersion')} {kernelVersion}</span>}
      </header>
    </section>
  )
}
