import { useEffect, useRef, useState } from 'react'
import { fetchPlacePhoto, fetchWeather } from '../lib/api'
import type { Place, WeatherResponse } from '../types/weather'

interface WeatherDataState {
  weather: WeatherResponse | null
  photo: string | null
  loading: boolean
  error: string | null
}

export function useWeatherData(place: Place | null): WeatherDataState {
  const [state, setState] = useState<WeatherDataState>({
    weather: null,
    photo: null,
    loading: false,
    error: null,
  })
  const requestId = useRef(0)

  useEffect(() => {
    if (!place) return
    const id = ++requestId.current
    setState((prev) => ({ ...prev, loading: true, error: null }))

    Promise.all([fetchWeather(place.latitude, place.longitude), fetchPlacePhoto(place)])
      .then(([weather, photo]) => {
        if (requestId.current !== id) return
        setState({ weather, photo, loading: false, error: null })
      })
      .catch(() => {
        if (requestId.current !== id) return
        setState((prev) => ({ ...prev, loading: false, error: "Couldn't load weather for this place." }))
      })
  }, [place])

  return state
}
