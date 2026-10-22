/** Public page-bootstrap options shared by the Host and Client halves. */

import z from '@deepseek-ai/schemastery'

/** Onboarding options after schema defaults are applied. */
export interface Config {
  /** Allow automatic API-key setup in browser and product-owned Desktop onboarding. */
  credentialOnboarding: boolean
  /** Public identifier for the current product Desktop installation. */
  installationId?: string
}

/** Validate Host configuration and its public page-bootstrap payload. */
export const Config: z<Partial<Config>, Config> = z.object({
  credentialOnboarding: z.boolean().default(true),
  installationId: z.string().min(1).required(false),
})

/** Page-global key carrying only the public onboarding options. */
export const ONBOARDING_CONFIG_GLOBAL = '__DSH_MODELS_ONBOARDING__'
