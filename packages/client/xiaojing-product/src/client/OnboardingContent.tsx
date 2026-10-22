/** Katcat first-use API key guide. */

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { XiaojingProductKey } from './locales.ts'
import css from './OnboardingContent.module.css'

const DEEPSEEK_PLATFORM_URL = 'https://platform.deepseek.com/'
const ignoreImplicitDismiss = (): void => {}

/** Product copy injected into the first-use guide. */
export interface OnboardingContentInjected {
  t: (key: XiaojingProductKey) => string
}

/** Product onboarding content props. */
export type OnboardingContentProps = PropsRuntime<'onboarding.content'> & InjectFace<OnboardingContentInjected>

/**
 * Render the first-use guide; Escape and mask clicks cannot acknowledge it.
 * @param props - shared acknowledgement state and localized product copy.
 * @returns the blocking setup guide with its explicit start action.
 */
export function OnboardingContent({ acknowledge, saving, failed, t }: OnboardingContentProps): ReactNode {
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  useEffect(() => {
    const root = document.getElementById('root')
    if (root === null) return
    const previous = root.inert
    root.inert = true
    return () => { root.inert = previous }
  }, [])

  useEffect(() => { titleRef.current?.focus() }, [])

  return (
    <Modal open title={t('onboardingTitle')} onClose={ignoreImplicitDismiss} headless className={css.dialog as string}>
      <div className={css.content}>
        <div className={css.welcome}>
          <div className={css.brand}>
            <svg className={css.wordmark} viewBox="45 135 2082 425" role="img" aria-label={t('brandAlt')}>
              <image href="./katcat-wordmark.png" width="2172" height="724" />
            </svg>
            <p className={css.tagline}>{t('aboutDescription')}</p>
          </div>
          <div className={css.paperLayers} aria-hidden="true" />
          <img className={css.artwork} src="./katcat-hero.png" alt="" width="1536" height="1024" />
        </div>
        <div className={css.body}>
          <h2 ref={titleRef} className={css.title} tabIndex={-1}>{t('onboardingTitle')}</h2>
          <ol className={css.steps}>
            <li className={css.step}>
              <div>
                <h3 className={css.stepTitle}>{t('onboardingGetKeyTitle')}</h3>
                <p className={css.copy}>{t('onboardingGetKeyBody')}</p>
                <a className={css.platform} href={DEEPSEEK_PLATFORM_URL} target="_blank" rel="noreferrer">{t('platform')}</a>
              </div>
            </li>
            <li className={css.step}>
              <div>
                <h3 className={css.stepTitle}>{t('onboardingConnectTitle')}</h3>
                <p className={css.copy}>{t('onboardingConnectBody')}</p>
                <p className={css.manage}>{t('onboardingManageKey')}</p>
              </div>
            </li>
          </ol>
          <p className={css.security}>{t('onboardingSecurity')}</p>
          <div className={css.footer}>
            <p className={css.later}>{t('onboardingLaterHint')}</p>
            <div className={css.actions}>
              {failed && <p className={css.error} role="alert">{t('saveError')}</p>}
              <Button variant="primary" className={css.primary} disabled={saving} onClick={() => { void acknowledge() }}>
                {t('start')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
