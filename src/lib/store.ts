import type {
  BodyMetric,
  DailyCheck,
  HsLog,
  Profile,
  RangeSession,
  SetLog,
  TursoConfig,
  WorkoutSession,
} from '../types'
import { DEFAULT_PROFILE } from '../data/phases'
import { now } from './id'

const PREFIX = 'rgc:'

// ---- 簡易 pub/sub(useSyncExternalStore 用) ----
type Listener = () => void
const listeners = new Set<Listener>()
let version = 0
export function subscribe(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function getVersion(): number {
  return version
}
function emit() {
  version++
  for (const l of listeners) l()
}

interface Row {
  id: string
  updatedAt: number
  deleted?: boolean
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage write failed', key, e)
  }
}

/**
 * id をキーにしたコレクション。配列で保持し、丸ごと永続化する。
 * (個人利用の規模では十分軽量)
 */
export class Collection<T extends Row> {
  private items: Map<string, T>
  constructor(public readonly key: string) {
    const arr = read<T[]>(key, [])
    this.items = new Map(arr.map((x) => [x.id, x]))
  }

  private persist() {
    write(this.key, Array.from(this.items.values()))
  }

  /** 削除済みを除いた全件(新しい順ではなく挿入順) */
  all(): T[] {
    return Array.from(this.items.values()).filter((x) => !x.deleted)
  }

  /** 削除済み含む生データ(同期用) */
  raw(): T[] {
    return Array.from(this.items.values())
  }

  get(id: string): T | undefined {
    const v = this.items.get(id)
    return v && !v.deleted ? v : undefined
  }

  upsert(record: T, silent = false): T {
    const withMeta = { ...record, updatedAt: now() }
    this.items.set(withMeta.id, withMeta)
    this.persist()
    if (!silent) emit()
    return withMeta
  }

  /** 同期からの取り込み(updatedAt をそのまま保持) */
  mergeRemote(record: T): boolean {
    const existing = this.items.get(record.id)
    if (!existing || record.updatedAt > existing.updatedAt) {
      this.items.set(record.id, record)
      return true
    }
    return false
  }

  remove(id: string) {
    const existing = this.items.get(id)
    if (!existing) return
    this.items.set(id, { ...existing, deleted: true, updatedAt: now() })
    this.persist()
    emit()
  }

  persistAfterMerge() {
    this.persist()
    emit()
  }
}

export const db = {
  sessions: new Collection<WorkoutSession>('sessions'),
  sets: new Collection<SetLog>('sets'),
  metrics: new Collection<BodyMetric>('metrics'),
  hs: new Collection<HsLog>('hs'),
  range: new Collection<RangeSession>('range'),
  checks: new Collection<DailyCheck>('checks'),
}

export type CollectionName = keyof typeof db

// ---- シングルトン設定 ----
let profile: Profile = { ...DEFAULT_PROFILE, ...read<Partial<Profile>>('profile', {}) }
let profileUpdatedAt = read<number>('profileUpdatedAt', 0)
export function getProfile(): Profile {
  return profile
}
export function getProfileUpdatedAt(): number {
  return profileUpdatedAt
}
/** ts 省略時は now()。同期からの取り込み時はリモートの ts を渡す。 */
export function setProfile(p: Profile, ts?: number) {
  profile = p
  write('profile', p)
  profileUpdatedAt = ts ?? now()
  write('profileUpdatedAt', profileUpdatedAt)
  emit()
}

let turso: TursoConfig | null = read<TursoConfig | null>('turso', null)
export function getTurso(): TursoConfig | null {
  return turso
}
export function setTurso(cfg: TursoConfig | null) {
  turso = cfg
  write('turso', cfg)
  emit()
}

interface SyncMeta {
  lastSync: number | null
  lastError: string | null
}
let syncMeta: SyncMeta = read<SyncMeta>('syncMeta', { lastSync: null, lastError: null })
export function getSyncMeta(): SyncMeta {
  return syncMeta
}
export function setSyncMeta(m: Partial<SyncMeta>) {
  syncMeta = { ...syncMeta, ...m }
  write('syncMeta', syncMeta)
  emit()
}

// ---- バックアップ(エクスポート/インポート) ----
export function exportAll(): string {
  const payload: Record<string, unknown> = { profile, version: 1 }
  for (const name of Object.keys(db) as CollectionName[]) {
    payload[name] = db[name].raw()
  }
  return JSON.stringify(payload, null, 2)
}

export function importAll(json: string) {
  const data = JSON.parse(json) as Record<string, unknown>
  if (data.profile) setProfile({ ...DEFAULT_PROFILE, ...(data.profile as Profile) })
  for (const name of Object.keys(db) as CollectionName[]) {
    const rows = data[name] as Row[] | undefined
    if (Array.isArray(rows)) {
      for (const r of rows) db[name].mergeRemote(r as never)
      db[name].persistAfterMerge()
    }
  }
  emit()
}
