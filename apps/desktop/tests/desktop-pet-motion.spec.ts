import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.useRealTimers() })

function fixture() {
  vi.useFakeTimers()
  const frames: string[] = []
  const element = () => ({
    src: '', textContent: '', className: '',
    classList: { add: vi.fn(), remove: vi.fn() },
    setAttribute: (_name: string, value: string) => { frames.push(value) },
    addEventListener: vi.fn(),
  })
  const elements: Record<string, ReturnType<typeof element>> = Object.fromEntries(
    ['companion', 'character', 'bubble', 'bubbleText', 'idleMotion'].map(id => [`#${id}`, element()]),
  )
  const view = (state = 'idle') => ({ scale: 0.5, applicationReady: true, snapshot: { state, activeTaskCount: 0, approvalCount: 0 } })
  let render = (_value: ReturnType<typeof view>) => {}
  let change = () => {}
  let unload = () => {}
  const media = { matches: false, addEventListener: (_type: string, callback: () => void) => { change = callback } }
  const unsubscribe = vi.fn()
  runInNewContext(readFileSync(new URL('../companion.js', import.meta.url), 'utf8'), {
    document: { querySelector: (selector: string) => elements[selector], documentElement: { style: { setProperty: vi.fn() } } },
    window: {
      matchMedia: () => media, location: { search: '' },
      addEventListener: (_type: string, callback: () => void) => { unload = callback },
      xiaojingDesktop: {
        subscribeCompanionState: (callback: typeof render) => { render = callback; return unsubscribe },
        getCompanionState: () => Promise.resolve(view()), showMainWindow: vi.fn(),
      },
    },
    setTimeout, clearTimeout, URLSearchParams, Math: Object.assign(Object.create(Math) as Math, { random: () => 0 }),
  })
  render(view())
  return { frames, elements, publish: (state: string) => { render(view(state)) },
    reduce: () => { media.matches = true; change() }, unload: () => { unload() }, unsubscribe }
}

describe('desktop pet idle motion', () => {
  it('blinks, wags its tail, and yawns without displaying task-status copy', async () => {
    const f = fixture()
    await vi.advanceTimersByTimeAsync(40_000)
    expect(f.frames).toContain('736 26 354 354')
    expect(f.frames).toContain('736 380 354 354')
    expect(f.frames).toContain('374 726 354 354')
    expect(f.elements['#bubbleText']!.textContent).toBe('')
    expect(f.elements['#companion']!.className).toBe('companion state-idle')
  })

  it('interrupts idle frames immediately when a task starts and resumes after it ends', async () => {
    const f = fixture()
    await vi.advanceTimersByTimeAsync(4_100)
    f.publish('executing')
    const count = f.frames.length
    await vi.advanceTimersByTimeAsync(60_000)
    expect(f.frames).toHaveLength(count)
    expect(f.elements['#character']!.src).toBe('assets/desktop-companion/runtime/executing.png')
    f.publish('idle')
    await vi.advanceTimersByTimeAsync(5_000)
    expect(f.frames.length).toBeGreaterThan(count)
  })

  it('stops frame timers for reduced motion and on window teardown', async () => {
    const f = fixture()
    await vi.advanceTimersByTimeAsync(4_100)
    f.reduce()
    const count = f.frames.length
    await vi.advanceTimersByTimeAsync(60_000)
    expect(f.frames).toHaveLength(count)
    f.unload()
    expect(f.unsubscribe).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
