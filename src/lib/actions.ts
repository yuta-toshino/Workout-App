import type {
  BodyMetric,
  DailyCheck,
  DayType,
  HsLog,
  Profile,
  RangeSession,
  SetLog,
  WorkoutSession,
} from '../types'
import { db, getTurso, setProfile, setSyncMeta } from './store'
import { now, uuid } from './id'
import { sync } from './turso'

// ===== セッション =====
export function findSession(date: string, dayType: DayType): WorkoutSession | undefined {
  return db.sessions.all().find((s) => s.date === date && s.dayType === dayType)
}

export function getOrCreateSession(date: string, dayType: DayType): WorkoutSession {
  const existing = findSession(date, dayType)
  if (existing) return existing
  const s: WorkoutSession = {
    id: uuid(),
    date,
    dayType,
    startedAt: now(),
    completedAt: null,
    doneChecks: [],
    note: '',
    updatedAt: now(),
  }
  // silent=true: 生成はレンダー中の遅延初期化から呼ばれ得るため通知しない
  const saved = db.sessions.upsert(s, true)
  scheduleSync()
  return saved
}

export function completeSession(sessionId: string) {
  const s = db.sessions.get(sessionId)
  if (!s) return
  db.sessions.upsert({ ...s, completedAt: now() })
  scheduleSync()
}

export function updateSession(s: WorkoutSession) {
  db.sessions.upsert(s)
  scheduleSync()
}

export function toggleCheck(sessionId: string, exerciseId: string) {
  const s = db.sessions.get(sessionId)
  if (!s) return
  const has = s.doneChecks.includes(exerciseId)
  const doneChecks = has ? s.doneChecks.filter((x) => x !== exerciseId) : [...s.doneChecks, exerciseId]
  db.sessions.upsert({ ...s, doneChecks })
  scheduleSync()
}

// ===== セット =====
export function setsForSession(sessionId: string): SetLog[] {
  return db.sets.all().filter((x) => x.sessionId === sessionId)
}

export function setsForExerciseInSession(sessionId: string, exerciseId: string): SetLog[] {
  return setsForSession(sessionId)
    .filter((x) => x.exerciseId === exerciseId)
    .sort((a, b) => a.setIndex - b.setIndex)
}

export function upsertSet(s: SetLog) {
  db.sets.upsert(s)
  scheduleSync()
}

export function newSet(sessionId: string, exerciseId: string, setIndex: number): SetLog {
  return {
    id: uuid(),
    sessionId,
    exerciseId,
    setIndex,
    weightKg: null,
    reps: null,
    done: false,
    updatedAt: now(),
  }
}

/** 直近の同種目のトップセット重量(漸進性過負荷の推奨用)。今回のセッションは除外。 */
export function lastTopWeight(
  exerciseId: string,
  excludeSessionId?: string,
): { weightKg: number; reps: number | null; date: string } | null {
  const sessions = db.sessions
    .all()
    .filter((s) => s.id !== excludeSessionId && s.completedAt)
    .sort((a, b) => (a.date < b.date ? 1 : -1)) // 新しい順
  for (const s of sessions) {
    const sets = db.sets
      .all()
      .filter((x) => x.sessionId === s.id && x.exerciseId === exerciseId && x.done && x.weightKg != null)
    if (sets.length) {
      const top = sets.reduce((m, x) => (x.weightKg! > m.weightKg! ? x : m))
      return { weightKg: top.weightKg!, reps: top.reps, date: s.date }
    }
  }
  return null
}

/** 全期間でのその種目の自己ベスト重量(PR) */
export function prWeight(exerciseId: string): number | null {
  const sets = db.sets.all().filter((x) => x.exerciseId === exerciseId && x.done && x.weightKg != null)
  if (!sets.length) return null
  return Math.max(...sets.map((x) => x.weightKg!))
}

// ===== 身体指標 =====
export function addMetric(m: Omit<BodyMetric, 'id' | 'updatedAt'>): BodyMetric {
  // 同日があれば上書き
  const existing = db.metrics.all().find((x) => x.date === m.date)
  const rec: BodyMetric = { id: existing?.id ?? uuid(), updatedAt: now(), ...m }
  const saved = db.metrics.upsert(rec)
  scheduleSync()
  return saved
}

export function metricsSorted(): BodyMetric[] {
  return [...db.metrics.all()].sort((a, b) => (a.date < b.date ? -1 : 1))
}

// ===== ヘッドスピード =====
export function addHs(h: Omit<HsLog, 'id' | 'updatedAt'>): HsLog {
  const existing = db.hs.all().find((x) => x.date === h.date)
  const rec: HsLog = { id: existing?.id ?? uuid(), updatedAt: now(), ...h }
  const saved = db.hs.upsert(rec)
  scheduleSync()
  return saved
}

export function hsSorted(): HsLog[] {
  return [...db.hs.all()].sort((a, b) => (a.date < b.date ? -1 : 1))
}

// ===== 打ちっぱなし / ラウンド =====
export function addRange(r: Omit<RangeSession, 'id' | 'updatedAt'>): RangeSession {
  const rec: RangeSession = { id: uuid(), updatedAt: now(), ...r }
  const saved = db.range.upsert(rec)
  scheduleSync()
  return saved
}

export function rangeSorted(): RangeSession[] {
  return [...db.range.all()].sort((a, b) => (a.date < b.date ? 1 : -1))
}

// ===== プロフィール / 目標 =====
export function saveProfile(p: Profile) {
  setProfile(p)
  scheduleSync()
}

// ===== 1日の栄養チェック =====
export function getCheck(date: string): DailyCheck {
  const existing = db.checks.all().find((x) => x.date === date)
  if (existing) return existing
  return {
    id: date,
    date,
    proteinBreakfast: false,
    proteinLunch: false,
    proteinDinner: false,
    shake: false,
    creatine: false,
    vegFirst: false,
    sleep: false,
    alcohol: false,
    updatedAt: now(),
  }
}

export function setCheck(date: string, patch: Partial<DailyCheck>) {
  const cur = getCheck(date)
  db.checks.upsert({ ...cur, ...patch, id: date, date })
  scheduleSync()
}

// ===== 自動同期(デバウンス)=====
let syncTimer: ReturnType<typeof setTimeout> | null = null
let syncing = false

export async function runSyncNow(): Promise<{ pushed: number; pulled: number } | null> {
  const cfg = getTurso()
  if (!cfg) return null
  if (syncing) return null
  syncing = true
  try {
    const r = await sync(cfg)
    return r
  } catch (e) {
    setSyncMeta({ lastError: e instanceof Error ? e.message : String(e) })
    throw e
  } finally {
    syncing = false
  }
}

/** 書き込み後に呼ぶ。Turso 設定時のみ、数秒後にまとめて同期。 */
export function scheduleSync() {
  if (!getTurso()) return
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    runSyncNow().catch(() => {
      /* エラーは syncMeta に記録済み */
    })
  }, 4000)
}

/**
 * アプリが前面に復帰した時に呼ぶ(タブ復帰 / フォーカス / ネット再接続)。
 * 起動時とローカル書き込み後しか同期しないと、開いたままの画面は別端末の更新を
 * リロードするまで取り込めない。復帰時に pull すれば emit 経由で画面が最新化される。
 */
let lastForegroundSync = 0
export function syncOnForeground() {
  if (!getTurso()) return
  const t = now()
  // focus と visibilitychange はほぼ同時に発火するため間引く
  if (t - lastForegroundSync < 3000) return
  lastForegroundSync = t
  runSyncNow().catch(() => {
    /* エラーは syncMeta に記録済み */
  })
}
