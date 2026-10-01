// Espejo de weather.types.ts del backend: respuesta de
// GET /api/matches/:id/weather.
export interface WeatherForecast {
  temperature: number              // °C, redondeado a entero
  precipitationProbability: number // %
  windSpeed: number                // km/h, redondeado a entero
  description: string              // en español, ej. "Lluvia moderada"
}

// Unión discriminada por status: forecast solo existe en AVAILABLE, así
// TypeScript obliga a chequear el status antes de leerlo.
export type MatchWeather =
  | { status: 'AVAILABLE'; forecast: WeatherForecast }
  | { status: 'TOO_FAR' }
  | { status: 'UNAVAILABLE' }
