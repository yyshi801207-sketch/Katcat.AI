import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import { afterEach, expect, it, onTestFinished, vi } from 'vitest'
import Documents from '../src/index.ts'

afterEach(() => { vi.unstubAllEnvs() })

it.each(['default', 'environment', 'config'] as const)(
  'reads ordinary uploads without a Finance service using the %s directory',
  async (selection) => {
    const root = await mkdtemp(join(tmpdir(), 'xiaojing-ordinary-documents-'))
    const ctx = new Context()
    onTestFinished(async () => {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    })
    vi.stubEnv('DSH_UPLOAD_DIR', selection === 'environment' ? join(root, 'custom-uploads') : '')
    const uploadRoot = join(root, selection === 'default' ? 'uploads' : 'custom-uploads')
    await mkdir(uploadRoot)
    const file = join(uploadRoot, 'notes.txt')
    await writeFile(file, 'PERSONAL_DOCUMENT_READY\n')
    await ctx.plugin(SessionStore).await()
    // Text parsing does not use binary attachments; the real parser runs in its Worker.
    ctx.provide('attachments', {} as AttachmentStore)
    await ctx.plugin(Documents, {
      dshHome: root,
      ...selection === 'config' ? { uploadRoot } : {},
    }).await()
    const session = ctx.sessions.create(SessionId('personal-documents'), { meta: { cwd: root } })
    session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: `上传文件：\`${file}\`` }],
      source: { kind: 'user' },
    }), { surfaceOp: 'append' })
    const agent = { session } as Agent
    const documents = await ctx.xiaojingFinanceDocuments.listGeneralDocuments(agent)
    expect(ctx.get('xiaojingFinanceDomain')).toBeUndefined()
    expect(documents).toMatchObject([{ name: 'notes.txt', status: 'parsed' }])
    const document = documents[0]
    if (document === undefined) throw new Error('Missing ordinary document')
    const result = await ctx.xiaojingFinanceDocuments.readGeneralDocument(agent, document.documentId)
    expect(result.units.map(unit => unit.text).join('\n')).toContain('PERSONAL_DOCUMENT_READY')
    await expect(ctx.xiaojingFinanceDocuments.readGeneralDocumentVisuals(agent, document.documentId))
      .resolves.toMatchObject({ visuals: [] })
  },
)
