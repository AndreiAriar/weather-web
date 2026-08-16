import type { GeoResult, Place, WeatherResponse } from '../types/weather'

/**
 * Search for places by name. Open-Meteo's geocoding API is free and keyless.
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query.trim()) return []

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query)
  url.searchParams.set('count', '6')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()

  const results: GeoResult[] = data.results ?? []
  return results.map((r) => ({
    name: r.name,
    region: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }))
}

/**
 * Reverse-geocode browser coordinates into a place name using BigDataCloud's
 * free, keyless client-side reverse geocoding endpoint.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<Place> {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('localityLanguage', 'en')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Reverse geocoding failed')
  const data = await res.json()

  return {
    name: data.city || data.locality || data.principalSubdivision || 'Current location',
    region: data.principalSubdivision,
    country: data.countryName,
    countryCode: (data.countryCode || '').toLowerCase(),
    latitude: lat,
    longitude: lon,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

/**
 * Fetch current + hourly + daily weather for a coordinate. Timezone is
 * resolved server-side ("auto") so the response tells us the local IANA
 * timezone of the place itself, not the visitor's browser.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day,precipitation,surface_pressure,uv_index'
  )
  url.searchParams.set('hourly', 'temperature_2m,weather_code,is_day,precipitation_probability')
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset'
  )
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()

  const nowIso: string = data.current.time
  const hourlyStartIndex = data.hourly.time.findIndex((t: string) => t >= nowIso)
  const startIdx = hourlyStartIndex === -1 ? 0 : hourlyStartIndex

  return {
    timezone: data.timezone,
    utcOffsetSeconds: data.utc_offset_seconds,
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      precipitation: data.current.precipitation,
      pressure: data.current.surface_pressure,
      uvIndex: data.current.uv_index ?? 0,
    },
    hourly: data.hourly.time.slice(startIdx, startIdx + 24).map((t: string, i: number) => ({
      time: t,
      temperature: data.hourly.temperature_2m[startIdx + i],
      weatherCode: data.hourly.weather_code[startIdx + i],
      isDay: data.hourly.is_day[startIdx + i] === 1,
      precipitationProbability: data.hourly.precipitation_probability[startIdx + i],
    })),
    daily: data.daily.time.map((d: string, i: number) => ({
      date: d,
      weatherCode: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      precipitationProbability: data.daily.precipitation_probability_max[i],
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
    })),
  }
}

/**
 * Look up a representative photo for a place via Wikipedia's public REST
 * summary endpoint (keyless, CORS-enabled). Falls back to null when the
 * place has no matching article or lead image.
 */
export async function fetchPlacePhoto(place: Place): Promise<string | null> {
  const title = encodeURIComponent(`${place.name}`)
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.type === 'disambiguation') return null
    return data.originalimage?.source ?? data.thumbnail?.source ?? null
  } catch {
    return null
  }
}
