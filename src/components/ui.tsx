import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Icon } from './Icon'

export function Header({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: string
  title: string
  sub?: string
  right?: ReactNode
}) {
  return (
    <div className="header">
      <div className="header-row">
        <div style={{ minWidth: 0 }}>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {sub && <div className="sub">{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  )
}

export function Sheet({
  title,
  onClose,
  children,
}: {
  title?: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        {title && (
          <div className="between" style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="閉じる">
              <Icon name="close" size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Stat({
  value,
  unit,
  label,
  color,
}: {
  value: ReactNode
  unit?: string
  label: string
  color?: string
}) {
  return (
    <div className="stat">
      <div className="value" style={color ? { color } : undefined}>
        {value}
        {unit && <span className="unit"> {unit}</span>}
      </div>
      <div className="label">{label}</div>
    </div>
  )
}

export function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="progress">
      <span style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  step = 0.5,
  placeholder,
  suffix,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  step?: number
  placeholder?: string
  suffix?: string
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          step={step}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? null : Number(v))
          }}
        />
        {suffix && (
          <span
            className="muted small"
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
