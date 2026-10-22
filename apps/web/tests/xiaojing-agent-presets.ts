/** Xiaojing declarative preset fixtures shared by Web product tests. */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadOverlayPatches } from '@deepseek-ai/dsh-app-boot'
import type { LaunchOptions } from './scaffold.ts'

type PresetDefinition = NonNullable<NonNullable<LaunchOptions['agentPresets']>['definitions']>[number]

/** Load retained Finance source explicitly for its isolated capability tests. */
export function financePresetDefinition(): PresetDefinition {
  const file = fileURLToPath(new URL('../../cli/config/xiaojing-agent-presets/finance/agent.cordis.yml', import.meta.url))
  for (const patch of loadOverlayPatches('finance-test', file)) {
    if (!Array.isArray(patch.insert)) continue
    for (const candidate of patch.insert) {
      if (typeof candidate !== 'object' || candidate === null) continue
      const row = candidate as { name?: unknown; config?: unknown }
      if (row.name !== '@deepseek-ai/dsh-agent-preset') continue
      const config = row.config as Partial<PresetDefinition> | undefined
      if (config?.id === 'finance' && Array.isArray(config.plugins)) {
        const plugins = config.plugins as { id?: string; config?: Record<string, unknown> }[]
        const skills = plugins.find(entry => entry.id === 'skill-filesystem')
        if (skills === undefined) throw new Error('Finance test preset is missing skill-filesystem')
        skills.config = { ...skills.config, customSkillDirs: [join(dirname(file), 'skills')] }
        return config as PresetDefinition
      }
    }
  }
  throw new Error('xiaojing Web test: Finance preset declaration is missing')
}
