import { getWeatherTheme } from '../lib/weatherCodes'

interface WeatherIconProps {
  code: number
  isDay: boolean
  size?: number
  className?: string
}

export function WeatherIcon({ code, isDay, size = 28, className = '' }: WeatherIconProps) {
  const { Icon, accent } = getWeatherTheme(code, isDay)
  return <Icon size={size} weight="duotone" className={`${accent} ${className}`} />
}
