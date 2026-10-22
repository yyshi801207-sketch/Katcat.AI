import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  assertXiaojingDesktopClientBuild, initializeXiaojingApplication, xiaojingHostEnvironment,
} from '../src/xiaojing-product.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function fixture(record?: unknown): string {
  const root = mkdtempSync(join(tmpdir(), 'xiaojing-desktop-build-'))
  roots.push(root)
  if (record !== undefined) {
    const path = join(root, '.dsh-build', 'client-build-environment.json')
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, `${JSON.stringify(record)}\n`)
  }
  return root
}

describe('desktop Client build profile', () => {
  it('creates an isolated office preview without a Finance workspace', () => {
    const root = fixture()
    const applicationPaths = new Map<string, string>()
    const application = {
      isPackaged: false,
      getPath: (name: string): string => {
        const value = applicationPaths.get(name)
        if (value === undefined) throw new Error(`Missing preview path: ${name}`)
        return value
      },
      setPath: (name: string, value: string): void => { applicationPaths.set(name, value) },
      setName: (_name: string): void => {},
      setAppUserModelId: (_id: string): void => {},
    }
    const environment: NodeJS.ProcessEnv = { DSH_DESKTOP_PREVIEW_ROOT: root }
    const previousWorkspace = join(root, 'documents', '小兢办公工作区', '办公工作区')
    mkdirSync(previousWorkspace, { recursive: true })
    writeFileSync(join(previousWorkspace, 'keep.txt'), 'existing work')
    const previousData = join(root, 'app-data', '@sudotech', 'xiaojing-office-desktop', 'harness')
    mkdirSync(previousData, { recursive: true })
    writeFileSync(join(previousData, 'keep.txt'), 'previous sessions and usage')
    const paths = initializeXiaojingApplication(application, environment)
    expect(paths.userData).toBe(join(root, 'app-data', 'Katcat-desktop'))
    expect(readFileSync(join(previousData, 'keep.txt'), 'utf8')).toBe('previous sessions and usage')
    expect(existsSync(join(paths.dshHome, 'keep.txt'))).toBe(false)
    expect(paths.officeWorkspace).toBe(join(root, 'documents', 'Katcat_Home'))
    expect(existsSync(paths.officeWorkspace)).toBe(true)
    expect(paths.workspaceRoot).toBe(paths.officeWorkspace)
    expect(readFileSync(join(previousWorkspace, 'keep.txt'), 'utf8')).toBe('existing work')
    expect(existsSync(join(paths.workspaceRoot, 'Finance工作区'))).toBe(false)
    const host = xiaojingHostEnvironment(application, paths, environment)
    expect(host.DSH_HOME).toBe(paths.dshHome)
    expect(host.XIAOJING_OFFICE_WORKSPACE_ROOT).toBe(paths.officeWorkspace)
    expect(host.XIAOJING_FINANCE_WORKSPACE_ROOT).toBeUndefined()
  })

  it('accepts only Xiaojing artifacts for an unpackaged preview', () => {
    const root = fixture({ environment: { DSH_CLIENT_BUILD_PROFILE: 'xiaojing' } })
    expect(() => { assertXiaojingDesktopClientBuild(root, false) }).not.toThrow()
  })

  it('rejects missing and non-Xiaojing build records before opening a preview', () => {
    expect(() => { assertXiaojingDesktopClientBuild(fixture(), false) }).toThrow(/build:xiaojing/u)
    expect(() => {
      assertXiaojingDesktopClientBuild(
        fixture({ environment: { DSH_CLIENT_BUILD_PROFILE: 'official' } }),
        false,
      )
    }).toThrow(/build:xiaojing/u)
  })

  it('does not require the repository-only record in a packaged application', () => {
    expect(() => { assertXiaojingDesktopClientBuild(fixture(), true) }).not.toThrow()
  })
})
