export interface WeatherForecast {
  temperature: number
  precipitationProbability: number
  windSpeed: number
  description: string
  weatherCode: number
}

export type MatchWeather =
  | { status: 'AVAILABLE'; forecast: WeatherForecast }
  | { status: 'TOO_FAR' }
  | { status: 'UNAVAILABLE' }
