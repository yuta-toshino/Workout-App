import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { Header, Stat } from '../components/ui'
import { LineChart } from '../components/LineChart'
import { HsSheet, MetricSheet, RangeSheet } from '../components/LogSheets'
import { db, getProfile } from '../lib/store'
import { hsSorted, metricsSorted, prWeight, rangeSorted } from '../lib/actions'
import { DAYTYPE_LABEL, PROGRAMS } from '../data/program'
import { formatJpShort } from '../lib/date'

type View = 'body' | 'golf' | 'strength'
type SheetKind = 'metric' | 'hs' | 'range' | null

const MAIN_LIFTS = ['squat', 'bench', 'ohp', 'rdl', 'hex-deadlift', 'hip-thrust', 'barbell-row']

export function Progress() {
  useStore()
  const [view, setView] = useState<View>('body')
  const [sheet, setSheet] = useState<SheetKind>(null)
  const profile = getProfile()

  return (
    <div className="screen">
      <Header eyebrow="進捗" title="記録" />

      <div className="segmented" style={{ marginBottom: 16 }}>
        <button className={view === 'body' ? 'active' : ''} onClick={() => setView('body')}>
          体組成
        </button>
        <button className={view === 'golf' ? 'active' : ''} onClick={() => setView('golf')}>
          ゴルフ
        </button>
        <button className={view === 'strength' ? 'active' : ''} onClick={() => setView('strength')}>
          筋力
        </button>
      </div>

      {view === 'body' && <BodyView profile={profile} onLog={() => setSheet('metric')} />}
      {view === 'golf' && <GolfView profile={profile} onHs={() => setSheet('hs')} onRange={() => setSheet('range')} />}
      {view === 'strength' && <StrengthView />}

      {sheet === 'metric' && <MetricSheet onClose={() => setSheet(null)} />}
      {sheet === 'hs' && <HsSheet onClose={() => setSheet(null)} />}
      {sheet === 'range' && <RangeSheet onClose={() => setSheet(null)} />}
    </div>
  )
}

function BodyView({ profile, onLog }: { profile: ReturnType<typeof getProfile>; onLog: () => void }) {
  const metrics = metricsSorted()
  const weightPts = metrics.filter((m) => m.weightKg != null).map((m) => ({ label: formatJpShort(m.date), v: m.weightKg! }))
  const bfPts = metrics.filter((m) => m.bodyFatPct != null).map((m) => ({ label: formatJpShort(m.date), v: m.bodyFatPct! }))
  const waistPts = metrics.filter((m) => m.waistCm != null).map((m) => ({ label: formatJpShort(m.date), v: m.waistCm! }))

  const latestW = weightPts.at(-1)?.v ?? profile.startWeightKg
  const latestBf = bfPts.at(-1)?.v ?? profile.startBodyFatPct

  return (
    <>
      <div className="card">
        <div className="stat-grid">
          <Stat value={latestW.toFixed(1)} unit="kg" label="体重" />
          <Stat value={latestBf.toFixed(0)} unit="%" label="体脂肪" color="var(--amber)" />
          <Stat value={(latestW - profile.startWeightKg).toFixed(1)} unit="kg" label="開始から" />
        </div>
        <div className="divider" />
        <div className="between small muted">
          <span>開始 {profile.startWeightKg}kg / {profile.startBodyFatPct}%</span>
          <span>目標 体脂肪{profile.targetBodyFatPct}%</span>
        </div>
      </div>

      <h3 className="section-title">体重 (kg)</h3>
      <div className="card">
        <LineChart points={weightPts} start={profile.startWeightKg} unit="" color="#4f8cff" />
      </div>

      <h3 className="section-title">体脂肪率 (%)</h3>
      <div className="card">
        <LineChart points={bfPts} target={profile.targetBodyFatPct} unit="" color="#fbbf24" />
      </div>

      <h3 className="section-title">ウエスト (cm)</h3>
      <div className="card">
        <LineChart points={waistPts} unit="" color="#f472b6" />
      </div>

      <button className="btn primary" onClick={onLog}>
        体組成を記録
      </button>
      <p className="tiny faint center mt">減量ペースは週0.5kg(体重の0.5〜1%)が筋肉温存の黄金域。</p>
    </>
  )
}

function GolfView({
  profile,
  onHs,
  onRange,
}: {
  profile: ReturnType<typeof getProfile>
  onHs: () => void
  onRange: () => void
}) {
  const hs = hsSorted()
  const hsPts = hs.filter((h) => h.headSpeedMs != null).map((h) => ({ label: formatJpShort(h.date), v: h.headSpeedMs! }))
  const latestHs = hsPts.at(-1)?.v ?? profile.startHsMs
  const ranges = rangeSorted()

  return (
    <>
      <div className="card">
        <div className="stat-grid">
          <Stat value={latestHs.toFixed(1)} unit="m/s" label="ヘッドスピード" color="var(--green)" />
          <Stat value={`+${(latestHs - profile.startHsMs).toFixed(1)}`} label="開始から" color="var(--green)" />
          <Stat value={profile.targetHsMs} unit="m/s" label="目標(ストレッチ)" />
        </div>
        <div className="divider" />
        <p className="tiny muted" style={{ margin: 0 }}>
          現実的射程は <b>51〜53m/s</b>(+6〜10%)。55はボーナス目標。飛距離はミート率・打ち出し・スピン最適化でも底上げ。
        </p>
      </div>

      <h3 className="section-title">ヘッドスピード (m/s)</h3>
      <div className="card">
        <LineChart points={hsPts} target={profile.targetHsMs} start={profile.startHsMs} unit="" color="#34d399" decimals={1} />
        <div className="between small" style={{ marginTop: 8 }}>
          <span className="chip" style={{ fontSize: 11 }}>射程 51-53</span>
          <button className="btn green sm" onClick={onHs}>
            計測を記録
          </button>
        </div>
      </div>

      <h3 className="section-title">ゴルフ履歴</h3>
      <div className="card flush">
        {ranges.length === 0 ? (
          <div className="empty">打ちっぱなし・ラウンドの記録がここに出ます</div>
        ) : (
          <div className="list">
            {ranges.slice(0, 20).map((r) => (
              <div className="row" key={r.id}>
                <span style={{ fontSize: 18 }}>{r.kind === 'round' ? '⛳' : '🏌️'}</span>
                <div className="grow">
                  <div className="bold small">{r.kind === 'round' ? 'ラウンド' : '打ちっぱなし'}</div>
                  <div className="tiny faint">
                    {formatJpShort(r.date)}
                    {r.balls ? ` ・ ${r.balls}球` : ''}
                    {r.overspeedMin ? ` ・ OS${r.overspeedMin}分` : ''}
                  </div>
                  {r.note && <div className="tiny muted">{r.note}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="btn ghost" onClick={onRange}>
        打ちっぱなし / ラウンドを記録
      </button>
    </>
  )
}

function StrengthView() {
  const completed = db.sessions
    .all()
    .filter((s) => s.completedAt)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const liftSeries = (exId: string) => {
    const sessions = db.sessions
      .all()
      .filter((s) => s.completedAt)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
    const pts: { label: string; v: number }[] = []
    for (const s of sessions) {
      const top = db.sets
        .all()
        .filter((x) => x.sessionId === s.id && x.exerciseId === exId && x.done && x.weightKg != null)
      if (top.length) pts.push({ label: formatJpShort(s.date), v: Math.max(...top.map((x) => x.weightKg!)) })
    }
    return pts
  }

  // 種目名の逆引き
  const exName = (id: string) => {
    for (const day of Object.values(PROGRAMS)) {
      const e = day.exercises.find((x) => x.id === id)
      if (e) return e.name
    }
    return id
  }

  const liftsWithData = MAIN_LIFTS.map((id) => ({ id, pts: liftSeries(id), pr: prWeight(id) })).filter((l) => l.pts.length > 0)

  return (
    <>
      <h3 className="section-title">主要種目の伸び</h3>
      {liftsWithData.length === 0 ? (
        <div className="card">
          <div className="empty">
            ワークアウトを記録すると、主種目(スクワット・ベンチ等)の重量推移とPRがここに表示されます。
          </div>
        </div>
      ) : (
        liftsWithData.map((l) => (
          <div className="card" key={l.id}>
            <div className="between mb">
              <span className="bold">{exName(l.id)}</span>
              <span className="chip blue" style={{ fontSize: 11 }}>
                PR {l.pr}kg
              </span>
            </div>
            <LineChart points={l.pts} unit="kg" color="#4f8cff" height={110} decimals={1} />
          </div>
        ))
      )}

      <h3 className="section-title">トレーニング履歴</h3>
      <div className="card flush">
        {completed.length === 0 ? (
          <div className="empty">完了したワークアウトがここに出ます</div>
        ) : (
          <div className="list">
            {completed.slice(0, 25).map((s) => {
              const sets = db.sets.all().filter((x) => x.sessionId === s.id && x.done)
              const vol = sets.reduce((a, x) => a + (x.weightKg ?? 0) * (x.reps ?? 0), 0)
              return (
                <div className="row" key={s.id}>
                  <span style={{ fontSize: 18 }}>{PROGRAMS[s.dayType].emoji}</span>
                  <div className="grow">
                    <div className="bold small">{DAYTYPE_LABEL[s.dayType]}</div>
                    <div className="tiny faint">
                      {formatJpShort(s.date)} ・ {sets.length}セット
                      {vol > 0 ? ` ・ ${Math.round(vol).toLocaleString()}kg` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
