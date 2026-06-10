// ローカル日付ユーティリティ(端末のタイムゾーン基準)

export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayYmd(): string {
  return toYmd(new Date())
}

const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土']

export function weekdayJp(d: Date): string {
  return WEEKDAY_JP[d.getDay()]
}

export function formatJp(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日(${weekdayJp(d)})`
}

export function formatJpShort(ymd: string): string {
  const d = fromYmd(ymd)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** 月曜始まりの週の日付配列(その日を含む週) */
export function weekDates(base: Date): Date[] {
  const dow = base.getDay() // 0=日
  const offsetToMon = dow === 0 ? -6 : 1 - dow
  const mon = addDays(base, offsetToMon)
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i))
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromYmd(b).getTime() - fromYmd(a).getTime()) / 86400000)
}

export function fmtDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
