// Pronóstico de la franja horaria en la que empieza el partido.
export type WeatherForecast = {
  temperature: number;              // °C, redondeado a entero
  precipitationProbability: number; // %
  windSpeed: number;                // km/h, redondeado a entero
  description: string;              // en español, ej. "Lluvia moderada"
};

// Unión discriminada por status: forecast solo existe cuando hay pronóstico,
// así TypeScript obliga a chequear el status antes de leerlo (acá y en el front).
export type MatchWeather =
  | { status: 'AVAILABLE'; forecast: WeatherForecast }
  | { status: 'TOO_FAR' }
  | { status: 'UNAVAILABLE' };

// Parte de la respuesta de Open-Meteo que usamos (pedida con timeformat=unixtime,
// así time viene en segundos Unix). Las variables pueden venir en null en
// algunas horas; el eje time siempre viene completo.
export type OpenMeteoResponse = {
  hourly: {
    time: number[];
    temperature_2m: (number | null)[];
    precipitation_probability: (number | null)[];
    weather_code: (number | null)[];
    wind_speed_10m: (number | null)[];
  };
};
