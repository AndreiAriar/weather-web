export interface GeoResult {
  id: number
  name: string
  admin1?: string
  country: string
  country_code: string
  latitude: number
  longitude: number
  timezone: string
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  weatherCode: number
  isDay: boolean
  precipitation: number
  pressure: number
  uvIndex: number
}

export interface HourlyPoint {
  time: string
  temperature: number
  weatherCode: number
  isDay: boolean
  precipitationProbability: number
}

export interface DailyPoint {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipitationProbability: number
  sunrise: string
  sunset: string
}

export interface WeatherResponse {
  timezone: string
  utcOffsetSeconds: number
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
}

export interface Place {
  name: string
  region?: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  timezone: string
}
