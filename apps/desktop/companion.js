const companion = document.querySelector('#companion')
const character = document.querySelector('#character')
const bubble = document.querySelector('#bubble')
const bubbleText = document.querySelector('#bubbleText')
const STARTUP_GREETING = '我是 Katcat，\n您的超级个人助理！'
const STARTUP_GREETING_DELAY_MS = 3_000
const STARTUP_GREETING_MS = 5_000
const idleMotion = document.querySelector('#idleMotion')
const IDLE_MOTIONS = ['blink', 'tail', 'blink', 'blink', 'tail', 'blink', 'yawn']
const IDLE_FRAMES = {
  blink: [[0, 80], [1, 85], [2, 120], [3, 85], [0, 80]],
  tail: [[4, 180], [5, 180], [6, 220], [7, 180], [6, 180], [5, 180], [4, 180]],
  yawn: [[8, 400], [9, 850], [10, 400], [11, 200]],
}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const copy = {
  thinking: '正在思考',
  executing: '正在执行',
  approval: '等待确认',
  success: '任务完成',
  failure: '任务未完成',
}

let state = 'idle'
let transientTimer
let startupGreetingDelayTimer
let idleMotionTimer
let idleFrameTimer
let startupGreetingPending = new URLSearchParams(window.location.search).get('startupGreeting') === '1'
let startupGreetingActive = false
let idleMotionIndex = 0
let applicationReady = false

function scheduleStartupGreeting() {
  if (!startupGreetingPending || startupGreetingDelayTimer || !applicationReady || state !== 'idle') return
  startupGreetingDelayTimer = setTimeout(() => {
    startupGreetingDelayTimer = undefined
    if (!startupGreetingPending || state !== 'idle') return
    startupGreetingPending = false
    startupGreetingActive = true
    bubbleText.textContent = STARTUP_GREETING
    bubble.classList.add('transient')
    transientTimer = setTimeout(() => {
      startupGreetingActive = false
      bubble.classList.remove('transient')
      scheduleIdleMotion()
    }, STARTUP_GREETING_MS)
  }, STARTUP_GREETING_DELAY_MS)
}

function applyScale(scale) {
  const pixels = (base, minimum = 0) => `${Math.max(minimum, base * scale)}px`
  const root = document.documentElement.style
  root.setProperty('--companion-size', pixels(280))
  root.setProperty('--companion-stage-height', pixels(320))
  root.setProperty('--companion-bubble-bottom', pixels(280, 1))
  root.setProperty('--companion-ring-size', pixels(230))
  root.setProperty('--companion-ring-right', pixels(25))
  root.setProperty('--companion-ring-bottom', pixels(12))
  root.setProperty('--companion-ring-border', pixels(5, 2))
  root.setProperty('--companion-stars-top', pixels(45))
  root.setProperty('--companion-stars-side', pixels(15))
  root.setProperty('--companion-stars-size', pixels(28, 16))
  root.setProperty('--companion-motion-breathe', `${-3 * scale}px`)
  root.setProperty('--companion-motion-think', `${-2 * scale}px`)
  root.setProperty('--companion-motion-execute', `${-5 * scale}px`)
  root.setProperty('--companion-motion-alert', `${-7 * scale}px`)
  root.setProperty('--companion-motion-celebrate', `${-16 * scale}px`)
}

function imageFor(next) {
  return `assets/desktop-companion/runtime/${next === 'failure' ? 'idle' : next}.png`
}

function setIdleFrame(frame) {
  // Measured transparent gutters keep neighboring ears and tails outside each viewport.
  const x = [12, 374, 736, 1098][frame % 4]
  const y = [26, 380, 726][Math.floor(frame / 4)]
  idleMotion.setAttribute('viewBox', `${x} ${y} 354 354`)
}

function cancelIdleMotion() {
  clearTimeout(idleMotionTimer)
  clearTimeout(idleFrameTimer)
  idleMotionTimer = undefined
  idleFrameTimer = undefined
  setIdleFrame(0)
}

function scheduleIdleMotion() {
  if (idleMotionTimer || idleFrameTimer || reducedMotion.matches || state !== 'idle') return
  idleMotionTimer = setTimeout(() => {
    idleMotionTimer = undefined
    const frames = IDLE_FRAMES[IDLE_MOTIONS[idleMotionIndex % IDLE_MOTIONS.length]]
    idleMotionIndex += 1
    let index = 0
    function advance() {
      idleFrameTimer = undefined
      if (state !== 'idle' || reducedMotion.matches) return cancelIdleMotion()
      if (index === frames.length) {
        setIdleFrame(0)
        scheduleIdleMotion()
        return
      }
      const [frame, duration] = frames[index++]
      setIdleFrame(frame)
      idleFrameTimer = setTimeout(advance, duration)
    }
    advance()
  }, 4_000 + Math.floor(Math.random() * 3_000))
}

function render(view) {
  applyScale(view.scale)
  const previous = state
  applicationReady = view.applicationReady === true
  state = view.snapshot.state
  if (state !== 'idle') cancelIdleMotion()
  companion.className = `companion state-${state}`
  character.src = imageFor(state)
  scheduleIdleMotion()
  if (startupGreetingActive && state === 'idle') {
    return
  }
  if (startupGreetingPending && state === 'idle') {
    scheduleStartupGreeting()
    return
  }
  clearTimeout(startupGreetingDelayTimer)
  startupGreetingDelayTimer = undefined
  startupGreetingPending = false
  clearTimeout(transientTimer)
  startupGreetingActive = false
  bubble.classList.remove('transient')
  if (state === 'idle') {
    bubbleText.textContent = ''
    if (previous === 'thinking' || previous === 'executing' || previous === 'approval') {
      bubbleText.textContent = '任务已停止'
      bubble.classList.add('transient')
      transientTimer = setTimeout(() => { bubble.classList.remove('transient') }, 1_800)
    }
  } else if (state === 'executing' && view.snapshot.activeTaskCount > 1) {
    bubbleText.textContent = `${copy.executing} · ${view.snapshot.activeTaskCount} 项`
  } else if (state === 'approval' && view.snapshot.approvalCount > 1) {
    bubbleText.textContent = `${copy.approval} · ${view.snapshot.approvalCount} 项`
  } else {
    bubbleText.textContent = copy[state] ?? ''
  }
}

reducedMotion.addEventListener('change', () => {
  cancelIdleMotion()
  scheduleIdleMotion()
})

companion.addEventListener('dblclick', () => { void window.xiaojingDesktop.showMainWindow() })
const unsubscribe = window.xiaojingDesktop.subscribeCompanionState(render)
window.addEventListener('beforeunload', () => { cancelIdleMotion(); unsubscribe() }, { once: true })
void window.xiaojingDesktop.getCompanionState().then(render)
