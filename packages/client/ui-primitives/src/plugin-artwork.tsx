/**
 * Plugin artwork on a 36×36 canvas. Configuration glyphs use adaptive gray
 * Katcat silhouettes and transparent counters; the default retains its gradient.
 */
import { useId } from 'react'
import type { IconProps } from './icons/props.ts'

const ARTWORK_INK = 'light-dark(#62666f,#b9bdc6)'
const CAT_HEAD_PATH = 'M10 28C9 22 9 13 12 10C14 9 21 13 24 16C29 14 35 14 40 16C44 13 51 9 53 10C56 13 55 22 54 28C59 35 59 42 55 48C50 56 40 59 32 59C22 59 13 56 8 49C3 42 4 34 10 28Z'

/**
 * A per-instance SVG def id prefix: the artwork repeats across cards and rows,
 * and duplicate document ids would make every `url(#…)` resolve to the first instance.
 */
const useArtworkId = (): string => `dsh_plugin_art_${useId().replaceAll(':', '')}`

/** Terminal window with a transparent cat and prompt, also used in sidebar guide entries. */
export const PluginArtworkTerminal = ({ size = 36, className }: IconProps) => {
  const uid = useArtworkId()
  return (
    <svg width={size} height={size} className={className} color={ARTWORK_INK} aria-hidden="true" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id={`${uid}mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <g transform="translate(8.4 12.3) scale(0.21666666666666665) translate(-4 -10)">
            <path d={CAT_HEAD_PATH} fill="black" />
          </g>
          <path d="M23 13.8L26.1 17L23 20.2M26.8 22H28.2" stroke="black" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <rect x="4.8" y="8.2" width="26.4" height="20" rx="5.2" fill="currentColor" mask={`url(#${uid}mask)`} />
    </svg>
  )
}

/** Two dispatch arrows surround a standalone cat silhouette without a circular backing. */
export const PluginArtworkLoop = ({ size = 36, className }: IconProps) => (
  <svg width={size} height={size} className={className} color={ARTWORK_INK} aria-hidden="true" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
    <g stroke="currentColor" strokeWidth="2.4">
      <path d="M7.2 13.7A11.3 11.3 0 0 1 28 11.3M23.8 11.3H28V7.1" />
      <path d="M28.8 22.3A11.3 11.3 0 0 1 8 24.7M12.2 24.7H8V28.9" />
    </g>
    <g transform="translate(12.75 13.2) scale(0.19444444444444445) translate(-4 -10)">
      <path d={CAT_HEAD_PATH} fill="currentColor" />
    </g>
  </svg>
)

/** A cat parent delegates to two task nodes; also supplies missing bundle-row artwork. */
export const PluginArtworkSubagent = ({ size = 36, className }: IconProps) => {
  const uid = useArtworkId()
  return (
    <svg width={size} height={size} className={className} color={ARTWORK_INK} aria-hidden="true" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id={`${uid}mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <g transform="translate(14 6.9) scale(0.14814814814814814) translate(-4 -10)">
            <path d={CAT_HEAD_PATH} fill="black" />
          </g>
        </mask>
      </defs>
      <g mask={`url(#${uid}mask)`}>
        <path d="M18 16.1V20M10.4 24.1V20H25.6V24.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6.2" y="24" width="8.4" height="6.4" rx="2.1" fill="currentColor" />
        <rect x="21.4" y="24" width="8.4" height="6.4" rx="2.1" fill="currentColor" />
        <rect x="12" y="4.7" width="12" height="11.6" rx="3.6" fill="currentColor" />
      </g>
    </svg>
  )
}

/** A search lens with a transparent cat silhouette. */
export const PluginArtworkSearch = ({ size = 36, className }: IconProps) => {
  const uid = useArtworkId()
  return (
    <svg width={size} height={size} className={className} color={ARTWORK_INK} aria-hidden="true" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id={`${uid}mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect width="36" height="36" fill="white" />
          <g transform="translate(9.7 9.7) scale(0.21851851851851853) translate(-4 -10)">
            <path d={CAT_HEAD_PATH} fill="black" />
          </g>
        </mask>
      </defs>
      <circle cx="15.6" cy="15.4" r="9.4" fill="currentColor" mask={`url(#${uid}mask)`} />
      <path d="M22.8 22.6L29 28.8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

/** Default plugin artwork for plugins without one of their own (connector blocks and a node). */
export const PluginArtworkDefault = ({ size = 36, className }: IconProps) => {
  const uid = useArtworkId()
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24.6294 8.63696C26.2862 8.63705 27.6294 9.98016 27.6294 11.637V12.7825C27.6292 14.4391 26.2861 15.7824 24.6294 15.7825H23.4839C22.6519 15.7825 21.5454 16.3459 21.5454 17.1778V18.1573C21.5454 18.7757 22.216 19.1966 22.8345 19.1965H24.6294C26.2861 19.1965 27.6292 20.5398 27.6294 22.1965V23.9924C27.6292 25.6491 26.2861 26.9924 24.6294 26.9924H22.8345C21.1778 26.9924 19.8347 25.649 19.8345 23.9924V22.1965C19.8345 21.7148 19.4957 21.2327 19.014 21.2327H16.4792C15.7975 21.2327 15.3374 22.0061 15.3374 22.6877V23.8333C15.3373 25.49 13.9942 26.8333 12.3374 26.8333H11.1919C9.53509 26.8333 8.19198 25.49 8.19189 23.8333V22.6877C8.19189 21.0309 9.53504 19.6877 11.1919 19.6877H12.3374C13.1964 19.6877 14.3999 19.0959 14.3999 18.2369V16.0185C14.3999 14.9518 15.2646 14.0872 16.3312 14.0872H19.435C20.0596 14.0872 20.484 13.4071 20.4839 12.7825V11.637C20.4839 9.98011 21.827 8.63696 23.4839 8.63696H24.6294ZM13.4116 11.2468C13.4116 12.6882 12.2431 13.8567 10.8018 13.8567C9.36037 13.8567 8.19189 12.6882 8.19189 11.2468C8.19189 9.80544 9.36037 8.63696 10.8018 8.63696C12.2431 8.63696 13.4116 9.80544 13.4116 11.2468Z" fill={`url(#${uid}a)`} />
      <defs>
        <linearGradient id={`${uid}a`} x1="15.1481" y1="9.94188" x2="15.1481" y2="13.6375" gradientUnits="userSpaceOnUse">
          <stop stopColor="#54ECE7" />
          <stop offset="1" stopColor="#658EFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
