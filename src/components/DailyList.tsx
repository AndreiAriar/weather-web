import { formatDayShort } from '../lib/format'
import { WeatherIcon } from './WeatherIcon'
import { weatherLabel } from '../lib/weatherCodes'
import type { DailyPoint } from '../types/weather'

export function DailyList({ days, timezone }: { days: DailyPoint[]; timezone: string }) {
  const weekMax = Math.max(...days.map((d) => d.tempMax))
  const weekMin = Math.min(...days.map((d) => d.tempMin))
  const span = Math.max(weekMax - weekMin, 1)

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">
        7-day forecast
      </h2>
      <div className="divide-y divide-white/10">
        {days.map((day, i) => {
          const leftPct = ((day.tempMin - weekMin) / span) * 100
          const widthPct = ((day.tempMax - day.tempMin) / span) * 100
          return (
            <div key={day.date} className="grid grid-cols-[3.5rem_1.5rem_1fr_auto_auto] items-center gap-3 py-3">
              <span className="text-sm font-medium text-white/85">
                {i === 0 ? 'Today' : formatDayShort(day.date, timezone)}
              </span>
              <WeatherIcon code={day.weatherCode} isDay size={19} />
              <div className="relative h-1.5 rounded-full bg-white/15">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-300"
                  style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 6)}%` }}
                />
              </div>
              <span className="text-sm text-white/50 tabular-nums">{Math.round(day.tempMin)}°</span>
              <span className="w-8 text-right text-sm font-semibold tabular-nums text-white">
                {Math.round(day.tempMax)}°
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-1 text-[11px] text-white/40">
        {weatherLabel(days[0]?.weatherCode ?? 0)} conditions expected today
      </p>
    </div>
  )
}
