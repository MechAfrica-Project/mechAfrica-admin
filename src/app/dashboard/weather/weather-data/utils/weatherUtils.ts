// utils/weatherUtils.ts

import { IconStyle } from "../types/weather";


export const getWeatherIcon = (
  iconCode: string,
  sizeClass: string = "text-xl"
): IconStyle => {
  let symbol: string;
  let className: string;

  // Use a color based on the weather condition
  switch (iconCode.slice(0, 2)) {
    case "01": // Clear
      symbol = iconCode.includes("d") ? "☀️" : "🌙";
      className = `${sizeClass} text-yellow-300`;
      break;
    case "02": // Few clouds
    case "03": // Scattered clouds
      symbol = "🌤️";
      className = `${sizeClass} text-gray-300`;
      break;
    case "04": // Broken clouds / Overcast
      symbol = "☁️";
      className = `${sizeClass} text-gray-400`;
      break;
    case "09": // Shower rain
      symbol = "🌧️";
      className = `${sizeClass} text-blue-300`;
      break;
    case "10": // Rain
      symbol = "🌦️";
      className = `${sizeClass} text-blue-400`;
      break;
    case "11": // Thunderstorm
      symbol = "⛈️";
      className = `${sizeClass} text-purple-400`;
      break;
    case "13": // Snow
      symbol = "🌨️";
      className = `${sizeClass} text-white`;
      break;
    case "50": // Mist
      symbol = "🌫️";
      className = `${sizeClass} text-gray-500`;
      break;
    default:
      symbol = "🌡️";
      className = `${sizeClass} text-gray-200`;
  }
  return { symbol, className };
};

export const capitalizeFirstLetter = (string: string): string => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};
