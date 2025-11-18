// types/weather.ts

export interface WeatherDetail {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  uvi: number;
  wind_speed: number;
  weather: WeatherDetail[];
}

export interface HourlyWeather extends CurrentWeather {
  pop: number; // Probability of precipitation
}

export interface DailyTemp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyWeather {
  dt: number;
  temp: DailyTemp;
  pop: number;
  weather: WeatherDetail[];
}

export interface WeatherData {
  lat: number;
  lon: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface IconStyle {
  symbol: string;
  className: string;
}
