/** Parse "HH:MM" 24-hour string into { hours, minutes } */
export function parseTime24(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number)
  return { hours: h ?? 0, minutes: m ?? 0 }
}

/** Format { hours, minutes } into "h:MM AM/PM" */
export function formatTime12({ hours, minutes }: { hours: number; minutes: number }): string {
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  const m = minutes.toString().padStart(2, '0')
  return `${h}:${m} ${period}`
}
