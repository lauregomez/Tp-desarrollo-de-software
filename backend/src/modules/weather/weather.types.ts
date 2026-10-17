export type WeatherForecast = {
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
  description: string;
  weatherCode: number;
};

export type MatchWeather =
  | { status: 'AVAILABLE'; forecast: WeatherForecast }
  | { status: 'TOO_FAR' }
  | { status: 'UNAVAILABLE' };

export type OpenMeteoResponse = {
  hourly: {
    time: number[];
    temperature_2m: (number | null)[];
    precipitation_probability: (number | null)[];
    weather_code: (number | null)[];
    wind_speed_10m: (number | null)[];
  };
};
