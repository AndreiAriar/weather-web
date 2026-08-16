import { useEffect, useState } from 'react'

/**
 * Returns a live Date object, re-rendering once per minute. Formatting into
 * a specific place's timezone happens at the display layer via
 * Intl.DateTimeFormat(locale, { timeZone }), so this hook stays timezone-agnostic.
 */
export function useLocalClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const msUntilNextMinute = 60000 - (Date.now() % 60000)
    const timeout = setTimeout(() => {
      setNow(new Date())
      const interval = setInterval(() => setNow(new Date()), 60000)
      return () => clearInterval(interval)
    }, msUntilNextMinute)
    return () => clearTimeout(timeout)
  }, [])

  return now
}
