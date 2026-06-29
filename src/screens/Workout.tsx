import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { DayType, ExerciseDef, SetLog, WorkoutSession } from '../types'
import { PROGRAMS, resolveSets } from '../data/program'
import {
  completeSession,
  findSession,
  lastTopWeight,
  prWeight,
  scheduleSync,
  setsForExerciseInSession,
  setsForSession,
  toggleCheck,
  upsertSet,
} from '../lib/actions'
import { db } from '../lib/store'
import { useStore } from '../hooks/useStore'
import { now, uuid } from '../lib/id'
import { fmtDuration, formatJpShort } from '../lib/date'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/ui'

function parseReps(s: string): number | null {
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : null
}

export function Workout({ date, dayType, onClose }: { date: string; dayType: DayType; onClose: () => void }) {
  useStore()
  const program = PROGRAMS[dayType]

  // 既存セッションがあれば再開、なければ provisional を生成(レンダー中は永続化しない)
  const [provisional] = useState<WorkoutSession>(
    () =>
      findSession(date, dayType) ?? {
        id: uuid(),
        date,
        dayType,
        startedAt: now(),
        completedAt: null,
        doneChecks: [],
        note: '',
        updatedAt: now(),
      },
  )
  const sessionId = provisional.id

  // 永続化は副作用(マウント後)で行う → レンダー中の通知を避ける
  useEffect(() => {
    if (!db.sessions.get(sessionId)) {
      db.sessions.upsert(provisional)
      scheduleSync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const session = db.sessions.get(sessionId) ?? provisional

  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const startRest = (sec?: number) => {
    if (!sec) return
    setRestEndsAt(Date.now() + sec * 1000)
  }

  const finish = () => {
    completeSession(sessionId)
    setDone(true)
  }

  // サマリー
  const doneSets = setsForSession(sessionId).filter((s) => s.done)
  const volume = doneSets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0)

  return (
    <div className="workout">
      <div className="workout-top">
        <button className="icon-btn" onClick={onClose} aria-label="閉じる">
          <Icon name="chevron-left" size={22} />
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="bold">{program.title}</div>
          <div className="tiny faint">{program.subtitle}</div>
        </div>
        <div style={{ textAlign: 'right', minWidth: 56 }}>
          <div className="bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <ElapsedClock startedAt={session.startedAt} />
          </div>
          <div className="tiny faint">経過</div>
        </div>
      </div>

      <div className="workout-body">
        {program.note && (
          <div className="card" style={{ background: 'var(--amber-soft)', borderColor: 'transparent', marginBottom: 14 }}>
            <div className="small" style={{ color: 'var(--amber)' }}>
              ⚡ {program.note}
            </div>
          </div>
        )}

        {program.exercises.map((ex) =>
          ex.trackWeight ? (
            <WeightExercise key={ex.id} ex={ex} date={date} sessionId={sessionId} startRest={startRest} />
          ) : (
            <CheckExercise
              key={ex.id}
              ex={ex}
              checked={session.doneChecks.includes(ex.id)}
              onToggle={() => {
                const willCheck = !session.doneChecks.includes(ex.id)
                toggleCheck(sessionId, ex.id)
                if (willCheck) startRest(ex.restSec)
              }}
            />
          ),
        )}

        <div style={{ height: 8 }} />
      </div>

      {restEndsAt && <RestBar endsAt={restEndsAt} setEndsAt={setRestEndsAt} />}

      <div className="workout-foot">
        <button className="btn green" onClick={finish}>
          <Icon name="check" size={18} /> ワークアウト完了
        </button>
      </div>

      {done && (
        <Sheet title="お疲れさまでした 💪" onClose={onClose}>
          <div className="stat-grid" style={{ marginBottom: 16 }}>
            <div className="stat">
              <div className="value">{fmtDuration(Date.now() - session.startedAt)}</div>
              <div className="label">所要時間</div>
            </div>
            <div className="stat">
              <div className="value">{doneSets.length}</div>
              <div className="label">完了セット</div>
            </div>
            <div className="stat">
              <div className="value">{Math.round(volume).toLocaleString()}</div>
              <div className="label">総挙上量kg</div>
            </div>
          </div>
          <p className="small muted">
            次回は主種目を +2.5kg(上半身は +1.25kg)で。停滞したら同重量反復 → 3回失敗で10%減して再構築。
          </p>
          <button className="btn primary" onClick={onClose}>
            閉じる
          </button>
        </Sheet>
      )}
    </div>
  )
}

/** 経過時間だけを毎秒更新する(親ツリーは再描画しない) */
function ElapsedClock({ startedAt }: { startedAt: number }) {
  const [, force] = useState(0)
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <>{fmtDuration(Date.now() - startedAt)}</>
}

/** レストの残り時間を自己更新で表示。0 になったら自動で閉じる。 */
function RestBar({ endsAt, setEndsAt }: { endsAt: number; setEndsAt: Dispatch<SetStateAction<number | null>> }) {
  const [, force] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() >= endsAt) setEndsAt(null)
      else force((x) => x + 1)
    }, 250)
    return () => clearInterval(id)
  }, [endsAt, setEndsAt])
  const remaining = Math.max(0, endsAt - Date.now())
  return (
    <div className="rest-bar">
      <span>レスト</span>
      <span className="t">{fmtDuration(remaining)}</span>
      <div className="flex" style={{ gap: 6 }}>
        <button
          className="chip"
          style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}
          onClick={() => setEndsAt((e) => (e ?? Date.now()) + 15000)}
        >
          +15
        </button>
        <button
          className="chip"
          style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}
          onClick={() => setEndsAt(null)}
        >
          スキップ
        </button>
      </div>
    </div>
  )
}

function ExerciseHead({ ex, nSets }: { ex: ExerciseDef; nSets: number }) {
  const kindChip: Record<string, { label: string; cls: string }> = {
    main: { label: 'メイン', cls: 'blue' },
    accessory: { label: '補助', cls: '' },
    power: { label: 'パワー', cls: 'amber' },
    core: { label: '体幹', cls: '' },
    cardio: { label: '有酸素', cls: 'green' },
    mobility: { label: 'モビリティ', cls: '' },
  }
  const c = kindChip[ex.kind]
  return (
    <div className="between" style={{ alignItems: 'flex-start', marginBottom: 4 }}>
      <div style={{ minWidth: 0 }}>
        <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="bold" style={{ fontSize: 17 }}>
            {ex.name}
          </span>
          <span className={`chip ${c.cls}`} style={{ fontSize: 10, padding: '2px 8px' }}>
            {c.label}
          </span>
        </div>
        <div className="tiny faint" style={{ marginTop: 2 }}>
          {ex.atMin != null && `0:${String(ex.atMin).padStart(2, '0')} ・ `}
          {nSets}×{ex.reps}
          {ex.restSec ? ` ・ レスト${ex.restSec >= 60 ? `${ex.restSec / 60}分` : `${ex.restSec}秒`}` : ''}
        </div>
      </div>
    </div>
  )
}

function ExerciseMeta({ ex }: { ex: ExerciseDef }) {
  return (
    <>
      {ex.equipment && <div className="tiny muted" style={{ marginTop: 2 }}>🛠 {ex.equipment}</div>}
      {ex.tip && <div className="tiny faint" style={{ marginTop: 2 }}>💡 {ex.tip}</div>}
      {ex.alt && <div className="tiny faint" style={{ marginTop: 2 }}>⇄ 混雑時: {ex.alt}</div>}
      {ex.kind === 'main' && <div className="tiny" style={{ marginTop: 4, color: 'var(--amber)' }}>📹 1セット目を撮影</div>}
    </>
  )
}

function WeightExercise({
  ex,
  date,
  sessionId,
  startRest,
}: {
  ex: ExerciseDef
  date: string
  sessionId: string
  startRest: (sec?: number) => void
}) {
  const nSets = resolveSets(ex, new Date(date))
  const last = lastTopWeight(ex.id, sessionId)
  const pr = prWeight(ex.id)
  // 履歴があれば前回+刻みを推奨。初回(履歴なし)は startKg を目標値として使う。
  const suggestion = last ? last.weightKg + (ex.stepKg ?? 0) : (ex.startKg ?? null)
  const targetReps = parseReps(ex.reps)

  const existing = setsForExerciseInSession(sessionId, ex.id)
  const dbByIdx = new Map(existing.map((s) => [s.setIndex, s]))

  // 入力中は文字列でローカル保持(小数 "2.5" 等を快適に入力できる)
  const [inputs, setInputs] = useState<{ w: string; r: string }[]>(() =>
    Array.from({ length: nSets }, (_, i) => {
      const s = dbByIdx.get(i)
      return {
        w: s?.weightKg != null ? String(s.weightKg) : '',
        r: s?.reps != null ? String(s.reps) : '',
      }
    }),
  )
  const idsRef = useRef<Record<number, string>>({})
  const idFor = (i: number) => dbByIdx.get(i)?.id ?? (idsRef.current[i] ??= uuid())

  const persist = (i: number, w: string, r: string, doneVal: boolean) => {
    const rec: SetLog = {
      id: idFor(i),
      sessionId,
      exerciseId: ex.id,
      setIndex: i,
      weightKg: w === '' ? null : Number(w),
      reps: r === '' ? null : Number(r),
      done: doneVal,
      updatedAt: 0,
    }
    upsertSet(rec)
  }

  const onField = (i: number, field: 'w' | 'r', val: string) => {
    const next = inputs[i] ? { ...inputs[i] } : { w: '', r: '' }
    next[field] = val
    setInputs((prev) => {
      const arr = [...prev]
      arr[i] = next
      return arr
    })
    persist(i, next.w, next.r, dbByIdx.get(i)?.done ?? false)
  }

  const toggleDone = (i: number) => {
    const turningOn = !(dbByIdx.get(i)?.done ?? false)
    let w = inputs[i]?.w ?? ''
    let r = inputs[i]?.r ?? ''
    if (turningOn) {
      if (w === '' && suggestion != null) w = String(suggestion)
      if (r === '' && targetReps != null) r = String(targetReps)
      setInputs((prev) => {
        const arr = [...prev]
        arr[i] = { w, r }
        return arr
      })
    }
    persist(i, w, r, turningOn)
    if (turningOn) startRest(ex.restSec)
  }

  return (
    <div className="card">
      <ExerciseHead ex={ex} nSets={nSets} />
      <ExerciseMeta ex={ex} />

      <div className="small" style={{ margin: '10px 0 8px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {last ? (
          <span className="muted">
            前回 <b style={{ color: 'var(--text)' }}>{last.weightKg}kg</b>
            {last.reps ? `×${last.reps}` : ''} ({formatJpShort(last.date)})
          </span>
        ) : ex.startKg != null ? (
          <span className="muted">
            初回目標 <b style={{ color: 'var(--text)' }}>{ex.startKg}kg</b>(フォーム優先)
          </span>
        ) : (
          <span className="faint">初回 — 空バー/軽めでフォーム習得</span>
        )}
        {suggestion != null && (
          <span className="chip blue" style={{ fontSize: 11 }}>
            {last ? '推奨' : '目標'} {suggestion}kg
          </span>
        )}
        {pr != null && <span className="chip" style={{ fontSize: 11 }}>PR {pr}kg</span>}
      </div>

      <div className="set-head">
        <span>#</span>
        <span>kg</span>
        <span>{ex.unilateral ? 'reps/側' : 'reps'}</span>
        <span>✓</span>
      </div>
      {Array.from({ length: nSets }, (_, i) => {
        const inp = inputs[i] ?? { w: '', r: '' }
        const isDone = dbByIdx.get(i)?.done ?? false
        return (
          <div className="set-row" key={i}>
            <span className="set-no">{i + 1}</span>
            <input
              className={`set-input ${inp.w !== '' ? 'filled' : ''}`}
              type="number"
              inputMode="decimal"
              step={ex.stepKg ?? 2.5}
              placeholder={suggestion != null ? String(suggestion) : '—'}
              value={inp.w}
              onChange={(e) => onField(i, 'w', e.target.value)}
            />
            <input
              className={`set-input ${inp.r !== '' ? 'filled' : ''}`}
              type="number"
              inputMode="numeric"
              placeholder={targetReps != null ? String(targetReps) : ex.reps}
              value={inp.r}
              onChange={(e) => onField(i, 'r', e.target.value)}
            />
            <button
              className={`check ${isDone ? 'on' : ''}`}
              style={{ justifySelf: 'center' }}
              onClick={() => toggleDone(i)}
              aria-label="完了"
            >
              <Icon name="check" size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function CheckExercise({ ex, checked, onToggle }: { ex: ExerciseDef; checked: boolean; onToggle: () => void }) {
  return (
    <div className="card" style={{ opacity: checked ? 0.72 : 1 }}>
      <div className="row" style={{ padding: 0, borderBottom: 'none' }}>
        <div className="grow">
          <ExerciseHead ex={ex} nSets={ex.sets} />
          <ExerciseMeta ex={ex} />
        </div>
        <button className={`check ${checked ? 'on' : ''}`} onClick={onToggle} aria-label="完了">
          <Icon name="check" size={16} />
        </button>
      </div>
    </div>
  )
}
