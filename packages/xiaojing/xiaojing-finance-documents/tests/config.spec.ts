import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Documents, { Config } from '../src/index.ts'

describe('xiaojing finance document configuration', () => {
  it('accepts documents up to the bundled upload limit by default', () => {
    expect(Config({}).maxFileBytes).toBe(100 * 1024 * 1024)
  })

  it('rejects a relative ordinary-upload directory before opening storage', async () => {
    const ctx = new Context()
    try {
      expect(() => new Documents(ctx, Config({ uploadRoot: 'relative-uploads' })))
        .toThrow('uploadRoot must be absolute')
    } finally {
      await ctx.fiber.dispose()
    }
  })
})
