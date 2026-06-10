import { useState } from 'react'
import { Sheet, NumberField } from './ui'
import { addHs, addMetric, addRange } from '../lib/actions'
import { todayYmd } from '../lib/date'

export function MetricSheet({ onClose, initialDate }: { onClose: () => void; initialDate?: string }) {
  const [date, setDate] = useState(initialDate ?? todayYmd())
  const [weight, setWeight] = useState<number | null>(null)
  const [bf, setBf] = useState<number | null>(null)
  const [waist, setWaist] = useState<number | null>(null)

  const save = () => {
    addMetric({ date, weightKg: weight, bodyFatPct: bf, waistCm: waist })
    onClose()
  }

  return (
    <Sheet title="体組成を記録" onClose={onClose}>
      <p className="muted small" style={{ marginTop: 0 }}>
        週1回・同条件(起床直後など)で測ると比較しやすい。
      </p>
      <div className="field">
        <label>日付</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <NumberField label="体重" value={weight} onChange={setWeight} step={0.1} suffix="kg" placeholder="78.0" />
      <NumberField label="体脂肪率" value={bf} onChange={setBf} step={0.1} suffix="%" placeholder="25.0" />
      <NumberField label="ウエスト" value={waist} onChange={setWaist} step={0.5} suffix="cm" placeholder="85" />
      <button className="btn primary" onClick={save} disabled={weight == null && bf == null && waist == null}>
        保存
      </button>
    </Sheet>
  )
}

export function HsSheet({ onClose, initialDate }: { onClose: () => void; initialDate?: string }) {
  const [date, setDate] = useState(initialDate ?? todayYmd())
  const [hs, setHs] = useState<number | null>(null)
  const [ball, setBall] = useState<number | null>(null)
  const [carry, setCarry] = useState<number | null>(null)
  const [note, setNote] = useState('')

  const save = () => {
    addHs({ date, headSpeedMs: hs, ballSpeedMs: ball, carryYd: carry, note })
    onClose()
  }

  return (
    <Sheet title="ヘッドスピードを記録" onClose={onClose}>
      <p className="muted small" style={{ marginTop: 0 }}>
        毎週土曜・同条件で固定。オーバースピード後の計測が転写の指標になる。
      </p>
      <div className="field">
        <label>日付</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <NumberField label="ヘッドスピード" value={hs} onChange={setHs} step={0.1} suffix="m/s" placeholder="48.0" />
      <NumberField label="ボール初速" value={ball} onChange={setBall} step={0.1} suffix="m/s" placeholder="—" />
      <NumberField label="キャリー" value={carry} onChange={setCarry} step={1} suffix="yd" placeholder="—" />
      <div className="field">
        <label>メモ</label>
        <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="使用クラブ・感触など" />
      </div>
      <button className="btn primary" onClick={save} disabled={hs == null}>
        保存
      </button>
    </Sheet>
  )
}

export function RangeSheet({ onClose, initialDate }: { onClose: () => void; initialDate?: string }) {
  const [date, setDate] = useState(initialDate ?? todayYmd())
  const [kind, setKind] = useState<'range' | 'round'>('range')
  const [balls, setBalls] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(15)
  const [note, setNote] = useState('')

  const save = () => {
    addRange({ date, kind, balls, overspeedMin: over, note })
    onClose()
  }

  return (
    <Sheet title="ゴルフを記録" onClose={onClose}>
      <div className="field">
        <label>種別</label>
        <div className="segmented">
          <button className={kind === 'range' ? 'active' : ''} onClick={() => setKind('range')}>
            打ちっぱなし
          </button>
          <button className={kind === 'round' ? 'active' : ''} onClick={() => setKind('round')}>
            ラウンド
          </button>
        </div>
      </div>
      <div className="field">
        <label>日付</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <NumberField label="球数" value={balls} onChange={setBalls} step={10} suffix="球" placeholder="100" />
      <NumberField label="オーバースピード素振り" value={over} onChange={setOver} step={5} suffix="分" />
      <div className="field">
        <label>メモ</label>
        <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ドライバーの感触・課題など" />
      </div>
      <button className="btn primary" onClick={save}>
        保存
      </button>
    </Sheet>
  )
}
