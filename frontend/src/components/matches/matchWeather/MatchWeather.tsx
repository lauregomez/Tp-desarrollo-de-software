import { useEffect, useState } from 'react'
import { weatherIconFor } from './MatchWeather.const'

import { getMatchWeather } from './MatchWeather.server'
import type { MatchWeather as Weather } from '../../../types/weather'

interface MatchWeatherProps {
  matchId: number
}

function renderWeather(weather: Weather | null) {
  if (weather?.status === 'AVAILABLE') {
    const { forecast } = weather
    const Icon = weatherIconFor(forecast.weatherCode)

    return (
      <>
        <div className="flex items-center gap-3">
          <Icon className="h-10 w-10 text-primary" />
          <p className="text-4xl font-bold text-navy">
            {forecast.temperature} °C
          </p>
        </div>
        <p className="mt-1 text-sm font-medium text-navy">{forecast.description}</p>

        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="font-semibold text-navy">Probabilidad de lluvia</dt>
            <dd className="text-muted">{forecast.precipitationProbability} %</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy">Viento</dt>
            <dd className="text-muted">{forecast.windSpeed} km/h</dd>
          </div>
        </dl>
      </>
    )
  }

  if (weather?.status === 'TOO_FAR') {
    return (
      <p className="text-sm text-muted">
        El clima estará disponible más cerca de la fecha del partido.
      </p>
    )
  }

  return <p className="text-sm text-muted">Clima no disponible.</p>
}

export default function MatchWeather({ matchId }: MatchWeatherProps) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    getMatchWeather(matchId, {
      onSuccess: (data) => {
        if (ignore) return
        setWeather(data)
        setIsLoading(false)
      },
      onError: () => {
        if (!ignore) setIsLoading(false)
      },
    })

    return () => {
      ignore = true
    }
  }, [matchId])

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-medium text-muted">Clima</h2>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-muted">Cargando clima…</p>
        ) : (
          renderWeather(weather)
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        Datos del clima:{' '}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open-Meteo.com
        </a>
      </p>
    </aside>
  )
}
