import type { TursoConfig } from '../types'
import {
  db,
  getProfile,
  getProfileUpdatedAt,
  setProfile,
  setSyncMeta,
  type CollectionName,
} from './store'
import { DEFAULT_PROFILE } from '../data/phases'
import { now } from './id'

// ===== libSQL HTTP API(Hrana over HTTP v2 / /v2/pipeline)最小クライアント =====
// Turso のエッジ DB は CORS を許可しているためブラウザから直接叩ける。

type LibsqlValue =
  | { type: 'null' }
  | { type: 'integer'; value: string }
  | { type: 'float'; value: number }
  | { type: 'text'; value: string }

interface ExecuteResult {
  cols: string[]
  rows: Record<string, unknown>[]
}

export function normalizeUrl(input: string): string {
  let u = input.trim()
  u = u.replace(/^libsql:\/\//, 'https://')
  u = u.replace(/\/+$/, '')
  if (!/^https?:\/\//.test(u)) u = 'https://' + u
  return u
}

function encodeArg(v: unknown, type: ColType): LibsqlValue {
  if (v === null || v === undefined) return { type: 'null' }
  if (type === 'REAL') return { type: 'float', value: Number(v) }
  if (type === 'INTEGER') return { type: 'integer', value: String(Math.trunc(Number(v))) }
  return { type: 'text', value: String(v) }
}

function decodeCell(cell: { type: string; value?: unknown } | null): unknown {
  if (!cell || cell.type === 'null' || cell.value === undefined) return null
  if (cell.type === 'integer') return Number(cell.value)
  if (cell.type === 'float') return Number(cell.value)
  return cell.value
}

async function pipeline(
  cfg: TursoConfig,
  statements: { sql: string; args?: LibsqlValue[] }[],
): Promise<ExecuteResult[]> {
  const url = normalizeUrl(cfg.url) + '/v2/pipeline'
  const requests = [
    ...statements.map((s) => ({
      type: 'execute' as const,
      stmt: { sql: s.sql, args: s.args ?? [] },
    })),
    { type: 'close' as const },
  ]
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.token}`,
    },
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Turso HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as {
    results: {
      type: string
      response?: {
        type?: string
        result?: { cols: { name: string }[]; rows: { type: string; value?: unknown }[][] }
      }
      error?: { message: string }
    }[]
  }
  const out: ExecuteResult[] = []
  for (const r of json.results) {
    if (r.type === 'error') throw new Error('Turso: ' + (r.error?.message ?? 'unknown error'))
    if (r.response?.type === undefined && !r.response?.result) {
      // close 応答など
      continue
    }
    const result = r.response?.result
    if (!result) continue
    const cols = result.cols.map((c) => c.name)
    const rows = result.rows.map((row) => {
      const obj: Record<string, unknown> = {}
      row.forEach((cell, i) => {
        obj[cols[i]] = decodeCell(cell)
      })
      return obj
    })
    out.push({ cols, rows })
  }
  return out
}

// ===== スキーマ定義(コレクション ↔ テーブル)=====
type ColType = 'TEXT' | 'INTEGER' | 'REAL'
type ColKind = 'plain' | 'bool' | 'json'

interface ColDef {
  name: string
  type: ColType
  kind?: ColKind
}

interface TableDef {
  table: string
  cols: ColDef[]
}

const SCHEMAS: Record<CollectionName, TableDef> = {
  sessions: {
    table: 'sessions',
    cols: [
      { name: 'id', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'dayType', type: 'TEXT' },
      { name: 'startedAt', type: 'INTEGER' },
      { name: 'completedAt', type: 'INTEGER' },
      { name: 'doneChecks', type: 'TEXT', kind: 'json' },
      { name: 'note', type: 'TEXT' },
      { name: 'updatedAt', type: 'INTEGER' },
      { name: 'deleted', type: 'INTEGER', kind: 'bool' },
    ],
  },
  sets: {
    table: 'sets',
    cols: [
      { name: 'id', type: 'TEXT' },
      { name: 'sessionId', type: 'TEXT' },
      { name: 'exerciseId', type: 'TEXT' },
      { name: 'setIndex', type: 'INTEGER' },
      { name: 'weightKg', type: 'REAL' },
      { name: 'reps', type: 'INTEGER' },
      { name: 'done', type: 'INTEGER', kind: 'bool' },
      { name: 'updatedAt', type: 'INTEGER' },
      { name: 'deleted', type: 'INTEGER', kind: 'bool' },
    ],
  },
  metrics: {
    table: 'metrics',
    cols: [
      { name: 'id', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'weightKg', type: 'REAL' },
      { name: 'bodyFatPct', type: 'REAL' },
      { name: 'waistCm', type: 'REAL' },
      { name: 'updatedAt', type: 'INTEGER' },
      { name: 'deleted', type: 'INTEGER', kind: 'bool' },
    ],
  },
  hs: {
    table: 'hs',
    cols: [
      { name: 'id', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'headSpeedMs', type: 'REAL' },
      { name: 'ballSpeedMs', type: 'REAL' },
      { name: 'carryYd', type: 'REAL' },
      { name: 'note', type: 'TEXT' },
      { name: 'updatedAt', type: 'INTEGER' },
      { name: 'deleted', type: 'INTEGER', kind: 'bool' },
    ],
  },
  range: {
    table: 'ranges',
    cols: [
      { name: 'id', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'kind', type: 'TEXT' },
      { name: 'balls', type: 'INTEGER' },
      { name: 'overspeedMin', type: 'INTEGER' },
      { name: 'note', type: 'TEXT' },
      { name: 'updatedAt', type: 'INTEGER' },
      { name: 'deleted', type: 'INTEGER', kind: 'bool' },
    ],
  },
  checks: {
    table: 'checks',
    cols: [
      { name: 'id', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'proteinBreakfast', type: 'INTEGER', kind: 'bool' },
      { name: 'proteinLunch', type: 'INTEGER', kind: 'bool' },
      { name: 'proteinDinner', type: 'INTEGER', kind: 'bool' },
      { name: 'shake', type: 'INTEGER', kind: 'bool' },
      { name: 'creatine', type: 'INTEGER', kind: 'bool' },
      { name: 'vegFirst', type: 'INTEGER', kind: 'bool' },
      { name: 'sleep', type: 'INTEGER', kind: 'bool' },
      { name: 'alcohol', type: 'INTEGER', kind: 'bool' },
      { name: 'updatedAt', type: 'INTEGER' },
      { name: 'deleted', type: 'INTEGER', kind: 'bool' },
    ],
  },
}

function createTableSql(def: TableDef): string {
  const colsSql = def.cols
    .map((c) => `${c.name} ${c.type}${c.name === 'id' ? ' PRIMARY KEY' : ''}`)
    .join(', ')
  return `CREATE TABLE IF NOT EXISTS ${def.table} (${colsSql})`
}

function recordToArgs(def: TableDef, rec: Record<string, unknown>): LibsqlValue[] {
  return def.cols.map((c) => {
    let v = rec[c.name]
    if (c.kind === 'json') v = v == null ? null : JSON.stringify(v)
    if (c.kind === 'bool') v = v ? 1 : 0
    return encodeArg(v, c.type)
  })
}

function rowToRecord(def: TableDef, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const c of def.cols) {
    const v = row[c.name]
    if (c.kind === 'json') out[c.name] = v == null ? [] : JSON.parse(String(v))
    else if (c.kind === 'bool') out[c.name] = !!v
    else out[c.name] = v
  }
  return out
}

function upsertSql(def: TableDef): string {
  const names = def.cols.map((c) => c.name)
  const placeholders = names.map(() => '?').join(', ')
  const updates = names
    .filter((n) => n !== 'id')
    .map((n) => `${n}=excluded.${n}`)
    .join(', ')
  return `INSERT INTO ${def.table} (${names.join(', ')}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates} WHERE excluded.updatedAt > ${def.table}.updatedAt`
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** 接続テスト(SELECT 1) */
export async function testConnection(cfg: TursoConfig): Promise<void> {
  await pipeline(cfg, [{ sql: 'SELECT 1 AS ok' }])
}

/** 双方向同期(last-write-wins by updatedAt) */
export async function sync(cfg: TursoConfig): Promise<{ pushed: number; pulled: number }> {
  // 1) スキーマ作成
  await pipeline(
    cfg,
    (Object.keys(SCHEMAS) as CollectionName[]).map((name) => ({ sql: createTableSql(SCHEMAS[name]) })),
  )

  let pushed = 0
  let pulled = 0

  // 2) push(ローカル → リモート)
  for (const name of Object.keys(SCHEMAS) as CollectionName[]) {
    const def = SCHEMAS[name]
    const rows = db[name].raw() as unknown as Record<string, unknown>[]
    if (rows.length === 0) continue
    const sql = upsertSql(def)
    for (const batch of chunk(rows, 50)) {
      await pipeline(
        cfg,
        batch.map((rec) => ({ sql, args: recordToArgs(def, rec) })),
      )
      pushed += batch.length
    }
  }

  // 3) pull(リモート → ローカル、updatedAt が新しければ取り込み)
  for (const name of Object.keys(SCHEMAS) as CollectionName[]) {
    const def = SCHEMAS[name]
    const [res] = await pipeline(cfg, [{ sql: `SELECT * FROM ${def.table}` }])
    if (!res) continue
    let changed = false
    for (const row of res.rows) {
      const rec = rowToRecord(def, row)
      if (db[name].mergeRemote(rec as never)) {
        changed = true
        pulled++
      }
    }
    if (changed) db[name].persistAfterMerge()
  }

  // 4) シングルトン(プロフィール / 目標)を kv テーブルで last-write-wins 同期
  await pipeline(cfg, [
    { sql: 'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT, updatedAt INTEGER)' },
  ])
  // push
  await pipeline(cfg, [
    {
      sql: 'INSERT INTO kv (key, value, updatedAt) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updatedAt=excluded.updatedAt WHERE excluded.updatedAt > kv.updatedAt',
      args: [
        { type: 'text', value: 'profile' },
        { type: 'text', value: JSON.stringify(getProfile()) },
        { type: 'integer', value: String(getProfileUpdatedAt()) },
      ],
    },
  ])
  // pull
  const [kvRes] = await pipeline(cfg, [{ sql: "SELECT value, updatedAt FROM kv WHERE key = 'profile'" }])
  if (kvRes && kvRes.rows.length) {
    const remoteTs = Number(kvRes.rows[0].updatedAt)
    if (remoteTs > getProfileUpdatedAt()) {
      try {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(String(kvRes.rows[0].value)) }, remoteTs)
        pulled++
      } catch {
        /* ignore malformed */
      }
    }
  }

  setSyncMeta({ lastSync: now(), lastError: null })
  return { pushed, pulled }
}
