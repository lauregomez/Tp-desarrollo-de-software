import { MatchWeather, OpenMeteoResponse } from './weather.types';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const ROSARIO_LATITUDE = '-32.9468';
const ROSARIO_LONGITUDE = '-60.6393';

const DAY_MS = 24 * 60 * 60 * 1000;
const SLOT_SECONDS = 60 * 60;
const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 60 * 1000;

const MAX_FORECAST_DAYS = 15;

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna débil',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  56: 'Llovizna helada',
  57: 'Llovizna helada',
  61: 'Lluvia débil',
  63: 'Lluvia moderada',
  65: 'Lluvia fuerte',
  66: 'Lluvia helada',
  67: 'Lluvia helada',
  71: 'Nevada débil',
  73: 'Nevada moderada',
  75: 'Nevada fuerte',
  77: 'Nieve granulada',
  80: 'Chaparrones débiles',
  81: 'Chaparrones moderados',
  82: 'Chaparrones fuertes',
  85: 'Chaparrones de nieve',
  86: 'Chaparrones de nieve',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta con granizo',
};

function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'Sin descripción';
}

let cache: { data: OpenMeteoResponse; fetchedAt: number } | null = null;

async function fetchForecast(): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: ROSARIO_LATITUDE,
    longitude: ROSARIO_LONGITUDE,
    hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
    timezone: 'UTC',
    timeformat: 'unixtime',
    forecast_days: '16',
  });

  const response = await fetch(`${OPEN_METEO_URL}?${params}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo respondió con status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;

  const hourly = data?.hourly;
  if (
    !Array.isArray(hourly?.time) ||
    !Array.isArray(hourly.temperature_2m) ||
    !Array.isArray(hourly.precipitation_probability) ||
    !Array.isArray(hourly.weather_code) ||
    !Array.isArray(hourly.wind_speed_10m)
  ) {
    throw new Error('Open-Meteo devolvió una respuesta con formato inesperado');
  }

  return data;
}

async function getForecast(): Promise<OpenMeteoResponse> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const data = await fetchForecast();
  cache = { data, fetchedAt: Date.now() };
  return data;
}

export const weatherService = {
  async getWeatherAt(startsAt: Date): Promise<MatchWeather> {
    if (startsAt.getTime() - Date.now() > MAX_FORECAST_DAYS * DAY_MS) {
      return { status: 'TOO_FAR' };
    }

    let data: OpenMeteoResponse;
    try {
      data = await getForecast();
    } catch (error) {
      console.error('No se pudo obtener el pronóstico de Open-Meteo:', error);
      return { status: 'UNAVAILABLE' };
    }

    const { hourly } = data;
    const startsAtUnix = startsAt.getTime() / 1000;
    const index = hourly.time.findIndex(
      (time) => time <= startsAtUnix && startsAtUnix < time + SLOT_SECONDS,
    );

    if (index === -1) {
      return { status: 'UNAVAILABLE' };
    }

    const temperature = hourly.temperature_2m[index];
    const precipitationProbability = hourly.precipitation_probability[index];
    const windSpeed = hourly.wind_speed_10m[index];
    const weatherCode = hourly.weather_code[index];

    if (
      temperature === null ||
      precipitationProbability === null ||
      windSpeed === null ||
      weatherCode === null
    ) {
      return { status: 'UNAVAILABLE' };
    }

    return {
      status: 'AVAILABLE',
      forecast: {
        temperature: Math.round(temperature),
        precipitationProbability,
        windSpeed: Math.round(windSpeed),
        description: describeWeatherCode(weatherCode),
        weatherCode,
      },
    };
  },
};
