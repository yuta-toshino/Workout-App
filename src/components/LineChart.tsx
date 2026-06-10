interface Point {
  label: string // x軸ラベル(日付など)
  v: number
}

interface Props {
  points: Point[]
  target?: number
  start?: number
  color?: string
  height?: number
  unit?: string
  decimals?: number
}

export function LineChart({
  points,
  target,
  start,
  color = '#4f8cff',
  height = 150,
  unit = '',
  decimals = 1,
}: Props) {
  if (points.length === 0) {
    return <div className="empty">まだデータがありません</div>
  }

  const W = 320
  const H = height
  const padL = 8
  const padR = 40
  const padT = 16
  const padB = 22
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const vals = points.map((p) => p.v)
  const candidates = [...vals]
  if (target != null) candidates.push(target)
  if (start != null) candidates.push(start)
  let lo = Math.min(...candidates)
  let hi = Math.max(...candidates)
  if (lo === hi) {
    lo -= 1
    hi += 1
  }
  const span = hi - lo
  lo -= span * 0.12
  hi += span * 0.12

  const x = (i: number) => padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => padT + innerH - ((v - lo) / (hi - lo)) * innerH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${x(points.length - 1).toFixed(1)},${(padT + innerH).toFixed(
    1,
  )} L${x(0).toFixed(1)},${(padT + innerH).toFixed(1)} Z`

  const last = points[points.length - 1]
  const gid = `g-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 目標ライン */}
      {target != null && (
        <>
          <line
            x1={padL}
            x2={padL + innerW}
            y1={y(target)}
            y2={y(target)}
            stroke="#34d399"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text x={padL + innerW + 3} y={y(target) + 3} fontSize="9" fill="#34d399">
            目標 {target}
          </text>
        </>
      )}

      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

      {/* 点 */}
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.v)} r={i === points.length - 1 ? 4 : 2.4} fill={color} />
      ))}

      {/* 最新値ラベル */}
      <text x={x(points.length - 1)} y={y(last.v) - 9} fontSize="11" fontWeight="700" fill={color} textAnchor="middle">
        {last.v.toFixed(decimals)}
        {unit}
      </text>

      {/* x軸ラベル(最初・最後) */}
      <text x={padL} y={H - 6} fontSize="9" fill="#5d678a">
        {points[0].label}
      </text>
      {points.length > 1 && (
        <text x={padL + innerW} y={H - 6} fontSize="9" fill="#5d678a" textAnchor="end">
          {last.label}
        </text>
      )}
    </svg>
  )
}
