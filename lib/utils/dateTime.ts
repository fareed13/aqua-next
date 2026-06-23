const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function parseDate(d: string | Date | null | undefined): Date | null {
  if (!d) return null
  if (d instanceof Date) return d
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, mo, day] = d.split('-').map(Number)
    return new Date(y, mo - 1, day)
  }
  return new Date(d)
}

export function parseTime12(str: string): Date | null {
  if (!str) return null
  const [time, period] = str.trim().split(' ')
  let [h, m] = time.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  const d = new Date(); d.setHours(h, m, 0, 0); return d
}

export function parseTime24(str: string): Date | null {
  if (!str) return null
  const [h, m] = str.split(':').map(Number)
  const d = new Date(); d.setHours(h, m, 0, 0); return d
}

export function formatTime12(d: Date | null): string {
  if (!d) return ''
  let h = d.getHours(); const m = d.getMinutes()
  const period = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
}

export function formatTime24(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDate(d: string | Date | null | undefined, pattern = 'YYYY-MM-DD'): string {
  if (!d) return ''
  const x = parseDate(d)
  if (!x || isNaN(x.getTime())) return ''
  const Y = x.getFullYear()
  const Mo = x.getMonth()
  const D = x.getDate()
  const h24 = x.getHours()
  const h12 = h24 % 12 || 12
  const min = x.getMinutes()
  const sec = x.getSeconds()
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  const dow = x.getDay()
  const map: Record<string, string> = {
    'YYYY': String(Y), 'MMMM': MONTH_LONG[Mo], 'MMM': MONTH_SHORT[Mo],
    'MM': String(Mo + 1).padStart(2, '0'), 'dddd': DAY_LONG[dow], 'ddd': DAY_SHORT[dow],
    'DD': String(D).padStart(2, '0'), 'D': String(D),
    'HH': String(h24).padStart(2, '0'), 'hh': String(h12).padStart(2, '0'),
    'mm': String(min).padStart(2, '0'), 'ss': String(sec).padStart(2, '0'), 'A': ampm,
  }
  return pattern.replace(/YYYY|MMMM|MMM|MM|dddd|ddd|DD|D|HH|hh|mm|ss|A/g, token => map[token])
}

export function formatDateUTC(d: string | Date | null | undefined, pattern = 'YYYY-MM-DD'): string {
  if (!d) return ''
  const x = d instanceof Date ? d : new Date(d)
  if (isNaN(x.getTime())) return ''
  const Y = x.getUTCFullYear(); const Mo = x.getUTCMonth(); const D = x.getUTCDate()
  const h24 = x.getUTCHours(); const h12 = h24 % 12 || 12
  const min = x.getUTCMinutes(); const sec = x.getUTCSeconds()
  const ampm = h24 >= 12 ? 'PM' : 'AM'; const dow = x.getUTCDay()
  const map: Record<string, string> = {
    'YYYY': String(Y), 'MMMM': MONTH_LONG[Mo], 'MMM': MONTH_SHORT[Mo],
    'MM': String(Mo + 1).padStart(2, '0'), 'dddd': DAY_LONG[dow], 'ddd': DAY_SHORT[dow],
    'DD': String(D).padStart(2, '0'), 'D': String(D),
    'HH': String(h24).padStart(2, '0'), 'hh': String(h12).padStart(2, '0'),
    'mm': String(min).padStart(2, '0'), 'ss': String(sec).padStart(2, '0'), 'A': ampm,
  }
  return pattern.replace(/YYYY|MMMM|MMM|MM|dddd|ddd|DD|D|HH|hh|mm|ss|A/g, token => map[token])
}

export function todayDate(): string { return formatDate(new Date()) }

export function addMinutesToTime12(timeStr: string, minutes: number): string {
  const d = parseTime12(timeStr)
  if (!d) return ''
  d.setMinutes(d.getMinutes() + minutes)
  return formatTime12(d)
}

export function addDays(d: string | Date | null | undefined, n: number): Date {
  const x = parseDate(d) ?? new Date(); x.setDate(x.getDate() + n); return x
}

export function addMonths(d: string | Date | null | undefined, n: number): Date {
  const x = parseDate(d) ?? new Date(); x.setMonth(x.getMonth() + n); return x
}

export function addYears(d: string | Date | null | undefined, n: number): Date {
  const x = parseDate(d) ?? new Date(); x.setFullYear(x.getFullYear() + n); return x
}

export function startOfMonth(d: string | Date = new Date()): Date {
  const x = parseDate(d) ?? new Date(); x.setDate(1); x.setHours(0, 0, 0, 0); return x
}

export function endOfMonth(d: string | Date = new Date()): Date {
  const x = parseDate(d) ?? new Date(); x.setMonth(x.getMonth() + 1, 0); x.setHours(23, 59, 59, 999); return x
}

export function startOfYear(d: string | Date = new Date()): Date {
  const x = parseDate(d) ?? new Date(); x.setMonth(0, 1); x.setHours(0, 0, 0, 0); return x
}

export function endOfYear(d: string | Date = new Date()): Date {
  const x = parseDate(d) ?? new Date(); x.setMonth(11, 31); x.setHours(23, 59, 59, 999); return x
}

export function startOfIsoWeek(d: string | Date = new Date()): Date {
  const x = parseDate(d) ?? new Date()
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff); x.setHours(0, 0, 0, 0); return x
}

export function startOfWeek(d: string | Date = new Date()): Date {
  const x = parseDate(d) ?? new Date()
  x.setDate(x.getDate() - x.getDay()); x.setHours(0, 0, 0, 0); return x
}

export function isoWeekday(d: string | Date = new Date()): number {
  const day = (parseDate(d) ?? new Date()).getDay()
  return day === 0 ? 7 : day
}

export function weekday(d: string | Date = new Date()): number {
  return (parseDate(d) ?? new Date()).getDay()
}

export function setIsoWeekday(d: string | Date, n: number): Date {
  const x = parseDate(d) ?? new Date()
  const cur = x.getDay() === 0 ? 7 : x.getDay()
  x.setDate(x.getDate() + (n - cur))
  return x
}

export function isSameOrAfter(d1: string | Date, d2: string | Date): boolean {
  return (parseDate(d1)?.getTime() ?? 0) >= (parseDate(d2)?.getTime() ?? 0)
}

export function isSameDate(d1: string | Date, d2: string | Date): boolean {
  const a = parseDate(d1); const b = parseDate(d2)
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function diffInYears(laterDate: string | Date, earlierDate: string | Date): number {
  const a = parseDate(laterDate); const b = parseDate(earlierDate)
  if (!a || !b) return 0
  let years = a.getFullYear() - b.getFullYear()
  const m = a.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && a.getDate() < b.getDate())) years--
  return years
}

export function diffInMinutes(d1: string | Date, d2: string | Date): number {
  return Math.floor(((parseDate(d1)?.getTime() ?? 0) - (parseDate(d2)?.getTime() ?? 0)) / 60000)
}

export function diffInSeconds(d1: string | Date, d2: string | Date): number {
  return Math.floor(((parseDate(d1)?.getTime() ?? 0) - (parseDate(d2)?.getTime() ?? 0)) / 1000)
}
