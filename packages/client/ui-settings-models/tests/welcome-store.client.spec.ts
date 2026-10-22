import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { SettingsSchemaService } from '@deepseek-ai/dsh-client-ui-settings/src/client/schema.ts'
import { SettingsDescribeMirror } from '@deepseek-ai/dsh-client-ui-settings/src/client/settings-mirror.ts'
import { ConfigFormController } from '@deepseek-ai/dsh-client-ui-settings/src/client/config-form.ts'
import { RemoteError, TestRemote } from '@deepseek-ai/dsh-client-test-runtime'
import { apply as applySettings, inject as settingsInject } from '@deepseek-ai/dsh-client-ui-settings/client'
import { decodeWelcomeSection, WelcomeNoticeStore, type WelcomeSection } from '../src/client/welcome-store.ts'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ModelsSettingsState, ModelsSettingsStore } from '../src/client/store.ts'
import {
  WELCOME_NOTICE_ACK_FIELD, WELCOME_NOTICE_SETTINGS_NAMESPACE, WELCOME_NOTICE_VERSION,
} from '../src/onboarding-copy.ts'

const schemaService = new SettingsSchemaService(new Context())

/** The settings namespace answers over the Remote carrier, which has no envelope. */
function ok<T>(value: T) {
  return { ok: true as const, value }
}

function rejected(message: string) {
  return {
    ok: false as const,
    error: new RemoteError('settings/rejected', message, { ns: WELCOME_NOTICE_SETTINGS_NAMESPACE }),
  }
}

function namespace(value: unknown = {}, revision = 0) {
  return {
    ns: WELCOME_NOTICE_SETTINGS_NAMESPACE,
    schema: { type: 'object', dict: { [WELCOME_NOTICE_ACK_FIELD]: { type: 'string', meta: {} } } },
    value,
    autoGenerate: true, applies: 'live' as const,
    secrets: [],
    revision,
  }
}

function acknowledgedNamespace(version: string, revision = 1) {
  return namespace({ [WELCOME_NOTICE_ACK_FIELD]: version }, revision)
}

/** The welcome store over a real mirror-derived scope and a fake wire. */
function buildWelcome(
  api: { describe?: ReturnType<typeof vi.fn>; mutate?: ReturnType<typeof vi.fn> },
  installationId?: string,
  models?: Pick<ModelsSettingsStore, 'store' | 'load'>,
) {
  const ctx = { remote: { settings: api } } as never
  const mirror = new SettingsDescribeMirror(ctx)
  const scope = new ConfigFormController(
    ctx,
    { namespace: WELCOME_NOTICE_SETTINGS_NAMESPACE, decode: decodeWelcomeSection },
    mirror,
    schemaService,
  )
  return { mirror, controller: new WelcomeNoticeStore(scope, installationId, models) }
}

function modelsJoin(configured: boolean, status: ModelsSettingsState['status'] = 'ready') {
  const store = createSnapshotStore<ModelsSettingsState>({
    status, error: null, credentialError: null, writable: true, namespaces: new Map(),
    rows: [{
      entry: { provider: 'deepseek-official', displayName: 'DeepSeek', settingsNs: 'llm-deepseek', settingsPath: [], active: true },
      configured: true, removable: false, apiKeyEnv: 'DEEPSEEK_API_KEY',
      credential: { configured, writable: true },
    }],
  })
  return { store, load: vi.fn(async () => { store.update((state) => { state.status = 'ready' }) }) }
}

describe('WelcomeNoticeStore', () => {
  it('requires acknowledgement for a new installation while retaining acknowledgement for that installation', async () => {
    const versions = [WELCOME_NOTICE_VERSION, `${WELCOME_NOTICE_VERSION}:previous-install`, `${WELCOME_NOTICE_VERSION}:current-install`]
    for (const version of versions) {
      const describe = vi.fn(async () => ok({ writable: true, hasDocument: true, namespaces: [acknowledgedNamespace(version)] }))
      const { mirror, controller } = buildWelcome({ describe }, 'current-install', modelsJoin(false))
      await mirror.load()
      await controller.load()
      expect(controller.store.getSnapshot()).toMatchObject({
        status: 'ready', acknowledged: version === `${WELCOME_NOTICE_VERSION}:current-install`,
      })
      controller.dispose()
    }
  })

  it('persists the current installation acknowledgement through the existing settings scope', async () => {
    const current = `${WELCOME_NOTICE_VERSION}:current-install`
    const describe = vi.fn(async () => ok({
      writable: true, hasDocument: true, namespaces: [acknowledgedNamespace(WELCOME_NOTICE_VERSION, 3)],
    }))
    const mutate = vi.fn(async () => ok(acknowledgedNamespace(current, 4)))
    const { mirror, controller } = buildWelcome({ describe, mutate }, 'current-install', modelsJoin(false))
    await mirror.load()
    await controller.load()
    await expect(controller.acknowledge()).resolves.toBe(true)
    expect(mutate).toHaveBeenCalledWith(
      WELCOME_NOTICE_SETTINGS_NAMESPACE,
      [{ op: 'set', path: [WELCOME_NOTICE_ACK_FIELD], value: current }], 3,
    )
    controller.dispose()
  })

  it('waits for the shared Models join and skips the guide for a usable provider without writing acknowledgement', async () => {
    const describe = vi.fn(async () => ok({ writable: true, hasDocument: true, namespaces: [namespace()] }))
    const mutate = vi.fn()
    const models = modelsJoin(true, 'loading')
    const { mirror, controller } = buildWelcome({ describe, mutate }, 'current-install', models)
    await mirror.load()
    await controller.load()
    expect(controller.store.getSnapshot()).toMatchObject({ status: 'loading', acknowledged: false })
    models.store.update((state) => { state.status = 'ready' })
    expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged: true })
    expect(models.load).not.toHaveBeenCalled()
    expect(mutate).not.toHaveBeenCalled()
    controller.dispose()
  })

  it('loads the shared Models join once while the welcome step is mounted', async () => {
    const describe = vi.fn(async () => ok({ writable: true, hasDocument: true, namespaces: [namespace()] }))
    const models = modelsJoin(false, 'idle')
    const { mirror, controller } = buildWelcome({ describe }, 'current-install', models)
    await mirror.load()
    await controller.load()
    await controller.load()
    expect(models.load).toHaveBeenCalledOnce()
    expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged: false })
    controller.dispose()
  })

  it('acknowledges only the exact current copy version', async () => {
    for (const [version, acknowledged] of [
      [undefined, false],
      ['older-copy', false],
      [WELCOME_NOTICE_VERSION, true],
    ] as const) {
      const describeCall = vi.fn(() => Promise.resolve(ok({
        writable: true,
        hasDocument: false,
        namespaces: [version === undefined ? namespace() : acknowledgedNamespace(version)],
      })))
      const { mirror, controller } = buildWelcome({ describe: describeCall })
      await mirror.load()
      await controller.load()
      expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged })
    }
  })

  it('persists the owner version through one revision-fenced mutation', async () => {
    const describeCall = vi.fn(() => Promise.resolve(ok({
      writable: true, hasDocument: false, namespaces: [namespace({}, 3)],
    })))
    const mutate = vi.fn(() => Promise.resolve(ok(acknowledgedNamespace(WELCOME_NOTICE_VERSION, 4))))
    const { mirror, controller } = buildWelcome({ describe: describeCall, mutate })
    await mirror.load()
    await controller.load()
    await expect(controller.acknowledge()).resolves.toBe(true)
    expect(mutate).toHaveBeenCalledWith(
      WELCOME_NOTICE_SETTINGS_NAMESPACE,
      [{ op: 'set', path: [WELCOME_NOTICE_ACK_FIELD], value: WELCOME_NOTICE_VERSION }],
      3,
    )
    expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged: true })
    // The write answer folded into the mirror; no re-read followed.
    expect(describeCall).toHaveBeenCalledTimes(1)
  })

  it('retains acknowledgement when the settings plugin is recreated', async () => {
    let stored = namespace({}, 3)
    const ctx = new Context()
    new TestRemote(ctx, {
      settings: {
        describe: vi.fn(async () => ok({ writable: true, hasDocument: false, namespaces: [stored] })),
        mutate: vi.fn(async () => {
          stored = acknowledgedNamespace(WELCOME_NOTICE_VERSION, 4)
          return ok(stored)
        }),
      },
    })
    const plugin = { inject: [...settingsInject], apply: applySettings }
    let controller: WelcomeNoticeStore | undefined
    try {
      const first = ctx.plugin(plugin)
      await first.await()
      await ctx.configForms.describe().ensure()
      controller = new WelcomeNoticeStore(
        ctx.configForms.get<WelcomeSection>(WELCOME_NOTICE_SETTINGS_NAMESPACE))
      await controller.load()
      await expect(controller.acknowledge()).resolves.toBe(true)
      controller.dispose()
      await first.dispose()
      await ctx.plugin(plugin).await()
      await ctx.configForms.describe().ensure()
      controller = new WelcomeNoticeStore(
        ctx.configForms.get<WelcomeSection>(WELCOME_NOTICE_SETTINGS_NAMESPACE))
      await controller.load()
      expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged: true })
    } finally {
      controller?.dispose()
      await ctx.fiber.dispose()
    }
  })

  it('keeps the notice pending while the settings read has not answered', async () => {
    const describeCall = vi.fn(() => Promise.reject(new Error('offline')))
    const { mirror, controller } = buildWelcome({ describe: describeCall })
    await mirror.load()
    await controller.load()
    // No answer stands, so the step renders nothing and never acknowledges.
    expect(controller.store.getSnapshot()).toEqual({ status: 'loading', acknowledged: false, error: null })
  })

  it('reports a refused persistence attempt after its recovery read', async () => {
    const describeCall = vi.fn(() => Promise.resolve(ok({
      writable: true, hasDocument: false, namespaces: [namespace()],
    })))
    const mutate = vi.fn(() => Promise.resolve(rejected('the settings document is read-only')))
    const { mirror, controller } = buildWelcome({ describe: describeCall, mutate })
    await mirror.load()
    await controller.load()
    await expect(controller.acknowledge()).resolves.toBe(false)
    expect(controller.store.getSnapshot()).toMatchObject({
      status: 'error',
      acknowledged: false,
      error: 'the acknowledgement did not persist',
    })
    // The failed latest write triggered one mirror recovery read.
    expect(describeCall).toHaveBeenCalledTimes(2)
  })

  it('reports a missing namespace as an error instead of a silent skip', async () => {
    const describeCall = vi.fn(() => Promise.resolve(ok({
      writable: true, hasDocument: false, namespaces: [],
    })))
    const { mirror, controller } = buildWelcome({ describe: describeCall })
    await mirror.load()
    await controller.load()
    expect(controller.store.getSnapshot()).toMatchObject({
      status: 'error',
      error: 'welcome acknowledgement settings are unavailable',
    })
  })

  it('reads malformed durable values as unacknowledged', async () => {
    for (const value of [null, 42, { [WELCOME_NOTICE_ACK_FIELD]: 42 }]) {
      const describeCall = vi.fn(() => Promise.resolve(ok({
        writable: true, hasDocument: false, namespaces: [namespace(value)],
      })))
      const { mirror, controller } = buildWelcome({ describe: describeCall })
      await mirror.load()
      await controller.load()
      expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged: false })
    }
  })

  it('follows a later document change without an own read', async () => {
    const describeCall = vi.fn()
      .mockResolvedValueOnce(ok({ writable: true, hasDocument: false, namespaces: [namespace()] }))
      .mockResolvedValueOnce(ok({
        writable: true, hasDocument: false,
        namespaces: [acknowledgedNamespace(WELCOME_NOTICE_VERSION)],
      }))
    const { mirror, controller } = buildWelcome({ describe: describeCall })
    await mirror.load()
    await controller.load()
    expect(controller.store.getSnapshot()).toMatchObject({ acknowledged: false })
    await mirror.load()
    expect(controller.store.getSnapshot()).toMatchObject({ status: 'ready', acknowledged: true })
  })
})
