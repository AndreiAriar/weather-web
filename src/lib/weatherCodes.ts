import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type IconWeight,
} from '@phosphor-icons/react'
import type { ComponentType } from 'react'

export type ConditionGroup =
  | 'clear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm'

/** Ambient background animation to pair with a condition group. */
export type EffectType = 'rays' | 'stars' | 'clouds' | 'fog' | 'rain' | 'snow' | 'storm'

export interface WeatherTheme {
  label: string
  group: ConditionGroup
  Icon: ComponentType<{ size?: number; weight?: IconWeight; className?: string }>
  /** Tailwind gradient stops, day and night variants */
  gradient: { day: string; night: string }
  /** Ambient animation layer, day and night variants */
  effect: { day: EffectType; night: EffectType }
  /** Accent used for glass borders / highlights over this backdrop */
  accent: string
}

const THEMES: Record<ConditionGroup, Omit<WeatherTheme, 'group'>> = {
  clear: {
    label: 'Clear sky',
    Icon: Sun,
    gradient: {
      day: 'from-sky-400 via-sky-300 to-amber-200',
      night: 'from-indigo-950 via-indigo-900 to-slate-900',
    },
    effect: { day: 'rays', night: 'stars' },
    accent: 'text-amber-500',
  },
  partlyCloudy: {
    label: 'Partly cloudy',
    Icon: CloudSun,
    gradient: {
      day: 'from-sky-400 via-sky-300 to-slate-200',
      night: 'from-slate-950 via-indigo-950 to-slate-900',
    },
    effect: { day: 'clouds', night: 'stars' },
    accent: 'text-sky-500',
  },
  overcast: {
    label: 'Overcast',
    Icon: Cloud,
    gradient: {
      day: 'from-slate-400 via-slate-300 to-slate-200',
      night: 'from-slate-900 via-slate-800 to-slate-900',
    },
    effect: { day: 'clouds', night: 'clouds' },
    accent: 'text-slate-500',
  },
  fog: {
    label: 'Foggy',
    Icon: CloudFog,
    gradient: {
      day: 'from-slate-300 via-slate-200 to-zinc-200',
      night: 'from-slate-800 via-slate-700 to-slate-800',
    },
    effect: { day: 'fog', night: 'fog' },
    accent: 'text-slate-400',
  },
  drizzle: {
    label: 'Drizzle',
    Icon: CloudRain,
    gradient: {
      day: 'from-slate-500 via-sky-400 to-slate-300',
      night: 'from-slate-950 via-slate-900 to-indigo-950',
    },
    effect: { day: 'rain', night: 'rain' },
    accent: 'text-sky-400',
  },
  rain: {
    label: 'Rain',
    Icon: CloudRain,
    gradient: {
      day: 'from-slate-600 via-slate-500 to-sky-400',
      night: 'from-slate-950 via-slate-900 to-blue-950',
    },
    effect: { day: 'rain', night: 'rain' },
    accent: 'text-sky-400',
  },
  snow: {
    label: 'Snow',
    Icon: CloudSnow,
    gradient: {
      day: 'from-slate-300 via-sky-100 to-slate-200',
      night: 'from-slate-800 via-indigo-950 to-slate-900',
    },
    effect: { day: 'snow', night: 'snow' },
    accent: 'text-sky-300',
  },
  storm: {
    label: 'Thunderstorm',
    Icon: CloudLightning,
    gradient: {
      day: 'from-slate-700 via-slate-600 to-amber-300',
      night: 'from-slate-950 via-violet-950 to-slate-900',
    },
    effect: { day: 'storm', night: 'storm' },
    accent: 'text-amber-400',
  },
}

/** WMO weather interpretation codes -> condition group */
function groupForCode(code: number): ConditionGroup {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partlyCloudy'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([95, 96, 99].includes(code)) return 'storm'
  return 'partlyCloudy'
}

export function getWeatherTheme(code: number, isDay: boolean): WeatherTheme {
  const group = groupForCode(code)
  const theme = THEMES[group]

  // Swap to moon-faced icons at night for the two conditions where it matters visually
  if (!isDay && group === 'clear') {
    return { ...theme, group, Icon: Moon }
  }
  if (!isDay && group === 'partlyCloudy') {
    return { ...theme, group, Icon: CloudMoon }
  }
  return { ...theme, group }
}

export function weatherLabel(code: number): string {
  return THEMES[groupForCode(code)].label
}

/** Resolves the ambient background animation for a given code + day/night state. */
export function getWeatherEffect(code: number, isDay: boolean): EffectType {
  const group = groupForCode(code)
  return isDay ? THEMES[group].effect.day : THEMES[group].effect.night
}