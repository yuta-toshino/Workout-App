import { useState } from 'react'
import type { Tab, WorkoutTarget } from '../App'
import type { DailyCheck } from '../types'
import { useStore } from '../hooks/useStore'
import { Header, ProgressBar } from '../components/ui'
import { Icon } from '../components/Icon'
import { HsSheet, MetricSheet, RangeSheet } from '../components/LogSheets'
import { PROGRAMS, WEEKDAY_TO_DAYTYPE } from '../data/program'
import { phaseForDate } from '../data/phases'
import { findSession, getCheck, setCheck } from '../lib/actions'
import { getProfile, getSyncMeta, getTurso } from '../lib/store'
import { daysBetween, formatJp, todayYmd, toYmd, weekDates, weekdayJp } from '../lib/date'

type SheetKind = 'metric' | 'hs' | 'range' | null

const CHECK_ITEMS: { key: keyof DailyCheck; label: string; icon: string }[] = [
  { key: 'proteinBreakfast', label: '朝タンパク', icon: '🍳' },
  { key: 'proteinLunch', label: '昼タンパク', icon: '🍱' },
  { key: 'proteinDinner', label: '夜タンパク', icon: '🍗' },
  { key: 'shake', label: 'プロテイン', icon: '🥤' },
  { key: 'creatine', label: 'クレアチン', icon: '💊' },
  { key: 'vegFirst', label: '野菜先', icon: '🥗' },
  { key: 'sleep', label: '睡眠7.5h', icon: '😴' },
]

export function Today({
  onStartWorkout,
  goToTab,
}: {
  onStartWorkout: (t: WorkoutTarget) => void
  goToTab: (t: Tab) => void
}) {
  useStore()
  const [sheet, setSheet] = useState<SheetKind>(null)

  const today = new Date()
  const ymd = todayYmd()
  const dayType = WEEKDAY_TO_DAYTYPE[today.getDay()]
  const program = PROGRAMS[dayType]
  const phase = phaseForDate(today)
  const profile = getProfile()
  const check = getCheck(ymd)
  const completed = !!findSession(ymd, dayType)?.completedAt

  const phaseLen = Math.max(1, daysBetween(phase.start, phase.end))
  const phaseElapsed = Math.max(0, Math.min(phaseLen, daysBetween(phase.start, ymd)))
  const phasePct = (phaseElapsed / phaseLen) * 100

  const isGym = ['lower_a', 'upper_a', 'power', 'lower_b', 'upper_b'].includes(dayType)
  const proteinCount =
    (check.proteinBreakfast ? 1 : 0) +
    (check.proteinLunch ? 1 : 0) +
    (check.proteinDinner ? 1 : 0) +
    (check.shake ? 1 : 0)

  return (
    <div className="screen">
      <Header
        eyebrow={profile.name ? `${profile.name}さん ・ ${formatJp(today)}` : formatJp(today)}
        title="今日"
        sub={`${phase.name} ・ ${phase.period.replace(/\(.*\)/, '')}`}
        right={<SyncDot onClick={() => goToTab('settings')} />}
      />

      <WeekStrip ymd={ymd} onPick={onStartWorkout} />

      {/* 今日のメインカード */}
      <div className="hero">
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="flex" style={{ gap: 8 }}>
              <span className="big-emoji">{program.emoji}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{program.title}</div>
                <div className="muted small">{program.subtitle}</div>
              </div>
            </div>
          </div>
          {isGym && (
            <span className={`chip ${completed ? 'green' : 'blue'}`}>
              {completed ? '完了' : `約${program.durationMin}分`}
            </span>
          )}
        </div>

        {program.note && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            {program.note}
          </p>
        )}

        {isGym && (
          <button className={`btn ${completed ? 'ghost' : 'primary'} mt`} onClick={() => onStartWorkout({ date: ymd, dayType })}>
            <Icon name={completed ? 'check' : 'play'} size={18} />
            {completed ? 'ワークアウトを見直す' : 'ワークアウト開始'}
          </button>
        )}

        {dayType === 'range' && (
          <div className="mt" style={{ display: 'grid', gap: 8 }}>
            <button className="btn green" onClick={() => setSheet('hs')}>
              <Icon name="golf" size={18} /> ヘッドスピードを計測・記録
            </button>
            <button className="btn ghost" onClick={() => setSheet('range')}>
              打ちっぱなしを記録
            </button>
          </div>
        )}

        {dayType === 'rest' && (
          <button className="btn ghost mt" onClick={() => setSheet('range')}>
            <Icon name="golf" size={18} /> ラウンド / 打ちっぱなしを記録
          </button>
        )}
      </div>

      {/* 今日のチェック */}
      <div className="card">
        <div className="between mb">
          <h3 className="card-title" style={{ margin: 0 }}>
            今日のチェック
          </h3>
          <span className="chip">
            タンパク {proteinCount}/4
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CHECK_ITEMS.map((it) => {
            const on = !!check[it.key]
            return (
              <button
                key={it.key}
                className={`chip ${on ? 'green' : ''}`}
                style={{ padding: '8px 12px', fontSize: 13 }}
                onClick={() => setCheck(ymd, { [it.key]: !on } as Partial<DailyCheck>)}
              >
                <span>{it.icon}</span>
                {it.label}
                {on && <Icon name="check" size={13} />}
              </button>
            )
          })}
        </div>
        <div className="divider" />
        <div className="between small">
          <span className="muted">タンパク質目標</span>
          <span className="bold">体重×2g ≒ {profile.proteinTargetG}g/日</span>
        </div>
      </div>

      {/* クイック記録 */}
      <div className="card">
        <h3 className="card-title">クイック記録</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn sm" style={{ width: '100%' }} onClick={() => setSheet('metric')}>
            ⚖️ 体組成
          </button>
          <button className="btn sm" style={{ width: '100%' }} onClick={() => setSheet('hs')}>
            ⛳ HS
          </button>
          <button className="btn sm" style={{ width: '100%' }} onClick={() => setSheet('range')}>
            🏌️ ゴルフ
          </button>
          <button className="btn sm" style={{ width: '100%' }} onClick={() => goToTab('progress')}>
            📈 推移を見る
          </button>
        </div>
      </div>

      {/* フェーズ進捗 */}
      <div className="card">
        <div className="between mb">
          <h3 className="card-title" style={{ margin: 0 }}>
            フェーズ
          </h3>
          <span className="chip blue">Phase {phase.id} / 4</span>
        </div>
        <div className="bold" style={{ marginBottom: 4 }}>
          {phase.name.replace(/Phase \d /, '')}
        </div>
        <ProgressBar pct={phasePct} />
        <div className="between small muted" style={{ marginTop: 6 }}>
          <span>{phase.period}</span>
          <span>{Math.round(phasePct)}%</span>
        </div>
        <p className="small muted" style={{ marginBottom: 4 }}>
          🎯 {phase.milestone}
        </p>
        <p className="small faint" style={{ margin: 0 }}>
          {phase.focus}
        </p>
      </div>

      {/* 文脈リマインダー */}
      <Reminders dayType={dayType} />

      {sheet === 'metric' && <MetricSheet onClose={() => setSheet(null)} />}
      {sheet === 'hs' && <HsSheet onClose={() => setSheet(null)} />}
      {sheet === 'range' && <RangeSheet onClose={() => setSheet(null)} />}
    </div>
  )
}

function WeekStrip({ ymd, onPick }: { ymd: string; onPick: (t: WorkoutTarget) => void }) {
  const today = new Date()
  const days = weekDates(today)
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {days.map((d) => {
        const dts = toYmd(d)
        const dt = WEEKDAY_TO_DAYTYPE[d.getDay()]
        const prog = PROGRAMS[dt]
        const isToday = dts === ymd
        const done = !!findSession(dts, dt)?.completedAt
        const isGym = ['lower_a', 'upper_a', 'power', 'lower_b', 'upper_b'].includes(dt)
        return (
          <button
            key={dts}
            onClick={() => isGym && onPick({ date: dts, dayType: dt })}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: '8px 2px',
              background: isToday ? 'var(--accent-soft)' : 'var(--bg-elev)',
              border: isToday ? '1px solid var(--accent)' : '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span className="tiny" style={{ color: isToday ? 'var(--accent)' : 'var(--text-faint)', fontWeight: 700 }}>
              {weekdayJp(d)}
            </span>
            <span style={{ fontSize: 17, opacity: done ? 1 : 0.85 }}>{done ? '✅' : prog.emoji}</span>
          </button>
        )
      })}
    </div>
  )
}

function Reminders({ dayType }: { dayType: string }) {
  const tips: string[] = []
  if (dayType === 'power')
    tips.push('夜は打ちっぱなしへ直行が理想。前半15分はオーバースピード素振り(計測しながら)→実打へ転写。')
  if (dayType === 'upper_a' || dayType === 'upper_b') tips.push('Zone2有酸素20分はバイク/早歩きで(走らない=干渉を抑える)。')
  if (dayType === 'lower_b') tips.push('ヘックスバーデッドは背中フラットを撮影で確認。最初の2ヶ月は1×5で十分。')
  if (dayType === 'range') tips.push('HS計測は毎週土曜・同条件で固定。前夜は飲酒を避け睡眠を確保。')
  if (dayType === 'rest') tips.push('完全休養日。素振りもなしでOK。適応は休んでいる間に進む。')
  tips.push('就寝23:00 / 起床6:30(7.5時間)。これが削れると筋力・減量・HS全部が止まる。')

  return (
    <div className="card" style={{ background: 'var(--bg-elev2)' }}>
      <h3 className="card-title">リマインダー</h3>
      <ul className="clean">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

function SyncDot({ onClick }: { onClick: () => void }) {
  useStore()
  const turso = getTurso()
  const meta = getSyncMeta()
  let color = 'var(--text-faint)'
  let title = '未接続'
  if (turso) {
    if (meta.lastError) {
      color = 'var(--danger)'
      title = '同期エラー'
    } else if (meta.lastSync) {
      color = 'var(--green)'
      title = '同期済み'
    } else {
      color = 'var(--amber)'
      title = '接続済み'
    }
  }
  return (
    <button className="icon-btn" onClick={onClick} aria-label={`同期: ${title}`} title={title}>
      <Icon name="cloud" size={20} className="" />
      <span
        style={{
          position: 'absolute',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: color,
          transform: 'translate(12px, -12px)',
          border: '2px solid var(--bg-elev)',
        }}
      />
    </button>
  )
}
