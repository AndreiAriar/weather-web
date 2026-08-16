import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { SearchBar } from './components/SearchBar'
import { LocationHero } from './components/LocationHero'
import { ConditionStats } from './components/ConditionStats'
import { HourlyStrip } from './components/HourlyStrip'
import { DailyList } from './components/DailyList'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { StatusMessage } from './components/StatusMessage'
import { WeatherBackground } from './components/WeatherBackground'
import { WeatherChat } from './components/WeatherChat'
import { useWeatherData } from './hooks/useWeatherData'
import { useCurrentLocation } from './hooks/useCurrentLocation'
import { containerVariants, itemVariants, heroVariants } from './lib/motionVariants'
import type { Place } from './types/weather'

// Fallback place shown if geolocation is unavailable or denied on first load.
const FALLBACK_PLACE: Place = {
  name: 'London',
  region: 'England',
  country: 'United Kingdom',
  countryCode: 'gb',
  latitude: 51.5072,
  longitude: -0.1276,
  timezone: 'Europe/London',
}

export default function App() {
  const [place, setPlace] = useState<Place | null>(null)
  const [isCurrentLocation, setIsCurrentLocation] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const reduceMotion = useReducedMotion()

  const handleResolvedLocation = useCallback((resolved: Place) => {
    setPlace(resolved)
    setIsCurrentLocation(true)
    setInitializing(false)
  }, [])

  const { locating, permissionDenied, locate } = useCurrentLocation(handleResolvedLocation)
  const { weather, photo, loading, error } = useWeatherData(place)

  // On first mount, try to default to the user's current location.
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPlace(FALLBACK_PLACE)
      setInitializing(false)
      return
    }
    locate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If geolocation is denied/unavailable, fall back once initialization settles with no place.
  useEffect(() => {
    if (!initializing) return
    if (permissionDenied) {
      setPlace(FALLBACK_PLACE)
      setInitializing(false)
    }
  }, [permissionDenied, initializing])

  function handleSelectPlace(selected: Place) {
    setPlace(selected)
    setIsCurrentLocation(false)
  }

  const showSkeleton = (loading || initializing) && !weather
  // Re-key the animated content block per place so switching cities replays the entrance.
  const contentKey = place ? `${place.latitude}-${place.longitude}` : 'empty'

  return (
    <div className="relative min-h-[100dvh] w-full text-white">
      <WeatherBackground
        code={weather?.current.weatherCode ?? null}
        isDay={weather?.current.isDay ?? true}
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <motion.header
          initial={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">Weather</p>
              <h2 className="text-lg font-semibold tracking-tight">Skylight</h2>
            </div>
          </div>
          <SearchBar
            onSelect={handleSelectPlace}
            onUseCurrentLocation={locate}
            locating={locating}
          />
          {permissionDenied && !place?.latitude && (
            <p className="text-xs text-white/50">
              Location access was denied — showing {FALLBACK_PLACE.name} instead. Search for your city above.
            </p>
          )}
        </motion.header>

        <main className="flex flex-1 flex-col gap-4">
          {showSkeleton && <LoadingSkeleton />}

          {!showSkeleton && error && (
            <StatusMessage title="Something went wrong" detail={error} />
          )}

          <AnimatePresence mode="wait">
            {!showSkeleton && !error && place && (
              <motion.div
                key={contentKey}
                variants={reduceMotion ? undefined : containerVariants}
                initial="hidden"
                animate="visible"
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="flex flex-col gap-4"
              >
                <motion.div variants={reduceMotion ? undefined : heroVariants}>
                  <LocationHero
                    place={place}
                    weather={weather}
                    photo={photo}
                    isCurrentLocation={isCurrentLocation}
                  />
                </motion.div>

                {weather && (
                  <>
                    <motion.div variants={reduceMotion ? undefined : itemVariants}>
                      <ConditionStats current={weather.current} />
                    </motion.div>
                    <motion.div variants={reduceMotion ? undefined : itemVariants}>
                      <HourlyStrip hours={weather.hourly} timezone={weather.timezone} />
                    </motion.div>
                    <motion.div variants={reduceMotion ? undefined : itemVariants}>
                      <DailyList days={weather.daily} timezone={weather.timezone} />
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="pb-2 text-center text-[11px] text-white/40">
          Weather data from Open-Meteo · Photos from Wikipedia
        </footer>
      </div>

      <WeatherChat place={place} weather={weather} />
    </div>
  )
}