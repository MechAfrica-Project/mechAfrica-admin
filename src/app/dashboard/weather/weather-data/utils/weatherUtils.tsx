import React from "react";
import { IconStyle } from "../types/weather";
import {
  Sun,
  Moon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplet,
} from "lucide-react";

export const getWeatherIcon = (
  iconCode: string,
  sizeClass: string = "h-6 w-6"
): IconStyle => {
  const code = (iconCode || "").slice(0, 2);
  let symbol: React.ReactNode = <Cloud className={sizeClass} />;
  let className = "";

  switch (code) {
    case "01": // Clear
      symbol = iconCode.includes("d") ? (
        <Sun className={sizeClass + " text-yellow-400"} />
      ) : (
        <Moon className={sizeClass + " text-yellow-300"} />
      );
      break;
    case "02": // Few clouds
    case "03": // Scattered clouds
      symbol = <Cloud className={sizeClass + " text-gray-400"} />;
      break;
    case "04": // Overcast
      symbol = <Cloud className={sizeClass + " text-gray-500"} />;
      break;
    case "09": // Shower rain
      symbol = <CloudDrizzle className={sizeClass + " text-blue-400"} />;
      break;
    case "10": // Rain
      symbol = <CloudRain className={sizeClass + " text-blue-500"} />;
      break;
    case "11": // Thunderstorm
      symbol = <CloudLightning className={sizeClass + " text-purple-500"} />;
      break;
    case "13": // Snow
      symbol = <CloudSnow className={sizeClass + " text-slate-200"} />;
      break;
    case "50": // Mist
      symbol = <Droplet className={sizeClass + " text-gray-400"} />;
      break;
    default:
      symbol = <Cloud className={sizeClass + " text-gray-300"} />;
  }

  return { symbol, className };
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};


