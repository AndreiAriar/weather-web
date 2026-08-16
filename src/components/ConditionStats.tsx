import { Drop, Wind, ThermometerSimple, Eye } from '@phosphor-icons/react'
import type { CurrentWeather } from '../types/weather'

interface StatProps {
  icon: React.ReactNode
  label: string
  value: string
}

function Stat({ icon, label, value }: StatProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 text-white/60">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-xl font-semibold text-white">{value}</span>
    </div>
  )
}

function uvBand(uv: number): string {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very high'
  return 'Extreme'
}

export function ConditionStats({ current }: { current: CurrentWeather }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat
        icon={<ThermometerSimple size={15} weight="bold" />}
        label="Feels like"
        value={`${Math.round(current.apparentTemperature)}°`}
      />
      <Stat
        icon={<Drop size={15} weight="bold" />}
        label="Humidity"
        value={`${Math.round(current.humidity)}%`}
      />
      <Stat
        icon={<Wind size={15} weight="bold" />}
        label="Wind"
        value={`${Math.round(current.windSpeed)} km/h`}
      />
      <Stat
        icon={<Eye size={15} weight="bold" />}
        label="UV index"
        value={uvBand(current.uvIndex)}
      />
    </div>
  )
}
