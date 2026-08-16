export function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date)
}

export function formatWeekday(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: timezone,
  }).format(date)
}

export function formatFullDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(date)
}

export function formatHour(isoTime: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: timezone,
  }).format(new Date(isoTime))
}

export function formatDayShort(isoDate: string, timezone: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: timezone,
  }).format(date)
}

export function round(n: number): number {
  return Math.round(n)
}
