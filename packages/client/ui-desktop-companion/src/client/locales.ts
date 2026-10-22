/** Desktop-companion settings copy. */

export const zh = {
  nav: '桌面宠物',
  title: '桌面宠物',
  description: '让 Katcat 小猫陪伴在桌面，通过动作和表情提示任务状态。',
  awake: '已唤醒',
  tucked: '已收起',
  idle: '待机中',
  thinking: '正在思考',
  executing: '正在执行',
  approval: '等待确认',
  success: '任务完成',
  failure: '任务未完成',
  taskCount: '项任务',
  wake: '唤醒桌面宠物',
  tuck: '收起桌面宠物',
  reset: '重置桌面位置',
  size: '桌面宠物大小',
  smaller: '较小',
  larger: '较大',
  unavailable: '桌面宠物仅在 Windows 桌面版中可用。',
  activityHint: '桌面宠物会通过动作和表情提示任务执行状态。',
  backgroundHint: '收起桌面宠物不会退出应用或中断任务。',
}

/** English desktop-companion settings copy. */
export const en: typeof zh = {
  nav: 'Desktop Pet',
  title: 'Desktop Pet',
  description: 'Keep the Katcat kitten on your desktop and see task progress through motion and expression.',
  awake: 'Awake',
  tucked: 'Tucked away',
  idle: 'Idle',
  thinking: 'Thinking',
  executing: 'Working',
  approval: 'Waiting for approval',
  success: 'Task completed',
  failure: 'Task not completed',
  taskCount: 'active tasks',
  wake: 'Wake Desktop Pet',
  tuck: 'Tuck away Desktop Pet',
  reset: 'Reset desktop position',
  size: 'Desktop Pet size',
  smaller: 'Smaller',
  larger: 'Larger',
  unavailable: 'Desktop Pet is available only in the Windows desktop application.',
  activityHint: 'Desktop Pet uses motion and expressions to show task progress.',
  backgroundHint: 'Tucking away Desktop Pet does not exit the application or interrupt tasks.',
}

/** Locale keys used by the desktop-companion page. */
export type DesktopCompanionKey = keyof typeof zh
