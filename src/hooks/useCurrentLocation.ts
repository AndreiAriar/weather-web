import { useCallback, useState } from 'react'
import { reverseGeocode } from '../lib/api'
import type { Place } from '../types/weather'

interface LocationState {
  locating: boolean
  permissionDenied: boolean
  locate: () => void
}

export function useCurrentLocation(onResolved: (place: Place) => void): LocationState {
  const [locating, setLocating] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setPermissionDenied(true)
      return
    }
    setLocating(true)
    setPermissionDenied(false)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const place = await reverseGeocode(position.coords.latitude, position.coords.longitude)
          onResolved(place)
        } catch {
          // Reverse geocoding failed (network hiccup, API down, etc.) — treat it
          // like we couldn't get a location, so the caller can fall back
          // instead of being stuck "initializing" forever.
          setPermissionDenied(true)
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
        setPermissionDenied(true)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    )
  }, [onResolved])

  return { locating, permissionDenied, locate }
}