import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MapPin } from '@phosphor-icons/react'
import { useLocalClock } from '../hooks/useLocalClock'
import { formatFullDate, formatTime, formatWeekday } from '../lib/format'
import { WeatherIcon } from './WeatherIcon'
import { weatherLabel } from '../lib/weatherCodes'
import type { Place, WeatherResponse } from '../types/weather'

interface LocationHeroProps {
  place: Place
  weather: WeatherResponse | null
  photo: string | null
  isCurrentLocation: boolean
}

export function LocationHero({ place, weather, photo, isCurrentLocation }: LocationHeroProps) {
  const now = useLocalClock()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setImageLoaded(false)
  }, [photo])

  const timezone = weather?.timezone ?? place.timezone

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-white/15 shadow-2xl md:h-80">
      {/* Fallback / loading backdrop, also doubles as a subtle base under the photo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />

      {/* Perspective wrapper — gives the flip below real 3D depth instead of a flat rotation */}
      <div className="absolute inset-0" style={{ perspective: 1400 }}>
        <AnimatePresence mode="sync">
          {photo && (
            <motion.div
              key={photo}
              initial={{ rotateY: -32, opacity: 0, scale: 1.18 }}
              animate={
                imageLoaded
                  ? { rotateY: 0, opacity: 1, scale: 1 }
                  : { rotateY: -32, opacity: 0, scale: 1.18 }
              }
              exit={{ rotateY: 24, opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left center' }}
              className="absolute inset-0"
            >
              {/* The photo itself — flip handled by the wrapper above, this layer
                  only handles the slow continuous zoom once settled in. */}
              <motion.img
                src={photo}
                alt={`View of ${place.name}`}
                onLoad={() => setImageLoaded(true)}
                animate={imageLoaded ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-full object-cover"
              />

              {/* Diagonal light sweep — plays once on entrance, like a premium product reveal */}
              <motion.div
                aria-hidden
                initial={{ x: '-130%' }}
                animate={imageLoaded ? { x: '160%' } : { x: '-130%' }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 0.25 }}
                className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

      {isCurrentLocation && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          <MapPin size={13} weight="fill" />
          Current location
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {place.name}
            </h1>
            <p className="text-sm font-medium text-white/70">
              {place.region ? `${place.region}, ` : ''}
              {place.country}
            </p>
          </div>

          {weather && (
            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
              <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} size={26} />
              <div className="text-right leading-tight">
                <div className="text-xl font-semibold text-white">
                  {Math.round(weather.current.temperature)}°
                </div>
                <div className="text-[11px] font-medium text-white/70">
                  {weatherLabel(weather.current.weatherCode)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-white/85">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatTime(now, timezone)}
          </span>
          <span className="text-sm text-white/60">
            {formatWeekday(now, timezone)}, {formatFullDate(now, timezone)}
          </span>
        </div>
      </div>
    </div>
  )
}