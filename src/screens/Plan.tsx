import { useState, type ReactNode } from 'react'
import type { DayType } from '../types'
import type { WorkoutTarget } from '../App'
import { Header } from '../components/ui'
import { Icon } from '../components/Icon'
import { PHASE_TARGET_KG, PROGRAMS, resolveSets } from '../data/program'
import { PHASES, phaseForDate } from '../data/phases'
import {
  DIET_RULES,
  EQUIPMENT_MAP,
  GYM_CHECKLIST,
  GYM_RULES,
  MOBILITY,
  PRIORITY_WHEN_BUSY,
  SUPPLEMENTS,
  WEEKDAY_TIMELINE,
  WEEK_SCHEDULE,
} from '../data/reference'
import { todayYmd } from '../lib/date'

const GYM_DAYS: { dt: DayType; label: string }[] = [
  { dt: 'lower_a', label: '月' },
  { dt: 'upper_a', label: '火' },
  { dt: 'power', label: '水' },
  { dt: 'lower_b', label: '木' },
  { dt: 'upper_b', label: '金' },
]

export function Plan({ onStartWorkout }: { onStartWorkout: (t: WorkoutTarget) => void }) {
  const currentPhase = phaseForDate(new Date())

  return (
    <div className="screen">
      <Header eyebrow="リファレンス" title="計画" sub="3資料の要点をいつでも確認" />

      <Accordion title="週間スケジュール" icon="today" defaultOpen>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {WEEK_SCHEDULE.map((r) => (
              <tr key={r.day} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '8px 6px', fontWeight: 700, width: 22, color: r.highlight ? 'var(--accent)' : undefined }}>
                  {r.day}
                </td>
                <td style={{ padding: '8px 6px' }}>
                  <div>{r.morning}</div>
                  {r.evening !== '—' && r.evening !== '自由' && <div className="tiny muted">夜: {r.evening}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tiny faint mt">
          朝ジム型を推奨(7時のほぼ貸切が最大の武器)。打ちっぱなしは水夜+土朝を固定枠。睡眠23:00-6:30を死守。
        </p>
      </Accordion>

      <Accordion title="平日タイムライン(朝ジム日)" icon="timer">
        <div className="list" style={{ margin: '-6px 0' }}>
          {WEEKDAY_TIMELINE.map((t) => (
            <div className="row" key={t.time} style={{ padding: '8px 0' }}>
              <span className="bold small" style={{ width: 78, color: 'var(--accent)', flexShrink: 0 }}>
                {t.time}
              </span>
              <span className="small grow">{t.text}</span>
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion title="フェーズ・ロードマップ" icon="progress" defaultOpen>
        <div className="list" style={{ margin: '-6px 0' }}>
          {PHASES.map((p) => {
            const isCurrent = p.id === currentPhase.id
            return (
              <div
                key={p.id}
                style={{
                  padding: '12px',
                  borderRadius: 14,
                  marginBottom: 8,
                  background: isCurrent ? 'var(--accent-soft)' : 'var(--bg-elev2)',
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid transparent',
                }}
              >
                <div className="between">
                  <span className="bold small">{p.name}</span>
                  {isCurrent && <span className="chip blue tiny">現在</span>}
                </div>
                <div className="tiny faint">{p.period}</div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  🎯 {p.milestone}
                </div>
                <div className="tiny faint" style={{ marginTop: 2 }}>
                  {p.focus} ／ 食事: {p.diet}
                </div>
              </div>
            )
          })}
        </div>
      </Accordion>

      <DayMenu onStartWorkout={onStartWorkout} />

      <Accordion title="食事ルール(ざっくり)" icon="flame">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {DIET_RULES.map((r, i) => (
            <li key={i} className="small" style={{ marginBottom: 8, color: 'var(--text-dim)' }}>
              {r}
            </li>
          ))}
        </ol>
        <div className="divider" />
        <div className="card-title">サプリ</div>
        {SUPPLEMENTS.map((s) => (
          <div key={s.name} className="small" style={{ marginBottom: 6 }}>
            <b>{s.name}</b> <span className="muted">— {s.detail}</span>
          </div>
        ))}
      </Accordion>

      <Accordion title="モビリティ(週3・トレ前)" icon="bolt">
        {MOBILITY.map((m) => (
          <div key={m.area} className="small" style={{ marginBottom: 8 }}>
            <span className="chip" style={{ fontSize: 11, marginRight: 6 }}>
              {m.area}
            </span>
            <span className="muted">{m.moves}</span>
          </div>
        ))}
        <p className="tiny faint">適切なウォームアップ継続で傷害リスク半減・HS約1.5mph向上の報告(TPI)。</p>
      </Accordion>

      <Accordion title="ジムの3つの鉄則" icon="dumbbell">
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {GYM_RULES.map((r, i) => (
            <li key={i} className="small" style={{ marginBottom: 8, color: 'var(--text-dim)' }}>
              {r}
            </li>
          ))}
        </ol>
      </Accordion>

      <Accordion title="設備マッピング(JOYFIT小台)" icon="settings">
        {EQUIPMENT_MAP.map((e) => (
          <div key={e.from} className="small" style={{ marginBottom: 8 }}>
            <div className="muted">{e.from}</div>
            <div className="bold tiny" style={{ color: 'var(--green)' }}>
              → {e.to}
            </div>
          </div>
        ))}
      </Accordion>

      <Accordion title="崩れたときの優先順位" icon="check">
        <div className="card-title" style={{ color: 'var(--danger)' }}>削ってよい順</div>
        <ol style={{ margin: '0 0 12px', paddingLeft: 20 }}>
          {PRIORITY_WHEN_BUSY.cut.map((x, i) => (
            <li key={i} className="small muted" style={{ marginBottom: 4 }}>
              {x}
            </li>
          ))}
        </ol>
        <div className="card-title" style={{ color: 'var(--green)' }}>絶対に削らない</div>
        <ul className="clean">
          {PRIORITY_WHEN_BUSY.keep.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </Accordion>

      <Accordion title="持ち物チェックリスト" icon="plan">
        <ul className="clean">
          {GYM_CHECKLIST.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </Accordion>

      <p className="tiny faint center mt">
        出典:統合プラン / 理想の週間スケジュール / ジム動線ガイドv2(JOYFIT小台)
      </p>
    </div>
  )
}

function DayMenu({ onStartWorkout }: { onStartWorkout: (t: WorkoutTarget) => void }) {
  const [dt, setDt] = useState<DayType>('lower_a')
  const program = PROGRAMS[dt]
  const main = program.exercises.filter((e) => e.kind === 'main' || e.kind === 'accessory' || e.kind === 'power')
  const currentPhase = phaseForDate(new Date())

  return (
    <Accordion title="曜日別メニュー" icon="dumbbell" defaultOpen>
      <div className="segmented" style={{ marginBottom: 12 }}>
        {GYM_DAYS.map((d) => (
          <button key={d.dt} className={dt === d.dt ? 'active' : ''} onClick={() => setDt(d.dt)}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="between mb">
        <div>
          <div className="bold">
            {program.emoji} {program.title}
          </div>
          <div className="tiny faint">
            {program.subtitle} ・ 約{program.durationMin}分
          </div>
        </div>
      </div>
      <div className="list" style={{ margin: '0 -4px' }}>
        {main.map((e) => (
          <div className="row" key={e.id} style={{ padding: '9px 4px' }}>
            <div className="grow">
              <div className="small bold">
                {e.name}
                {e.target && <span className="chip tiny" style={{ marginLeft: 6 }}>🎯 {e.target}</span>}
              </div>
              {e.equipment && <div className="tiny faint">{e.equipment}</div>}
              {PHASE_TARGET_KG[e.id] && (
                <div className="tiny faint" style={{ marginTop: 3 }}>
                  {PHASE_TARGET_KG[e.id].map((kg, i) => (
                    <span
                      key={i}
                      style={{
                        marginRight: 8,
                        fontWeight: currentPhase.id === i + 1 ? 700 : 400,
                        color: currentPhase.id === i + 1 ? 'var(--accent)' : undefined,
                      }}
                    >
                      P{i + 1} {kg}kg
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="chip tiny">
              {resolveSets(e, new Date())}×{e.reps}
            </span>
          </div>
        ))}
      </div>
      <button className="btn primary mt" onClick={() => onStartWorkout({ date: todayYmd(), dayType: dt })}>
        <Icon name="plan" size={16} /> このメニューを確認する
      </button>
    </Accordion>
  )
}

function Accordion({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string
  icon: Parameters<typeof Icon>[0]['name']
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="card">
      <button
        className="between"
        style={{ width: '100%', textAlign: 'left' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex" style={{ gap: 10 }}>
          <span style={{ color: 'var(--accent)' }}>
            <Icon name={icon} size={20} />
          </span>
          <span className="bold">{title}</span>
        </span>
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s', color: 'var(--text-faint)' }}>
          <Icon name="chevron" size={18} />
        </span>
      </button>
      {open && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  )
}
