import { AnimatePresence, motion } from 'motion/react'
import { getWeatherTheme, getWeatherEffect } from '../lib/weatherCodes'
import { WeatherEffects } from './WeatherEffects'

interface WeatherBackgroundProps {
  code: number | null
  isDay: boolean
}

export function WeatherBackground({ code, isDay }: WeatherBackgroundProps) {
  const gradient =
    code === null
      ? isDay
        ? 'from-sky-400 via-sky-300 to-slate-200'
        : 'from-slate-950 via-indigo-950 to-slate-900'
      : getWeatherTheme(code, isDay).gradient[isDay ? 'day' : 'night']

  const effect = code === null ? null : getWeatherEffect(code, isDay)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      <AnimatePresence mode="sync">
        <motion.div
          key={gradient}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        />
      </AnimatePresence>

      {/* Ambient rays/stars/rain/snow/etc, crossfades independently of the gradient */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`${effect ?? 'none'}-${isDay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <WeatherEffects effect={effect} isDay={isDay} />
        </motion.div>
      </AnimatePresence>

      {/* Soft vignette so glass cards keep contrast at the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.25)_100%)]" />
    </div>
  )
}