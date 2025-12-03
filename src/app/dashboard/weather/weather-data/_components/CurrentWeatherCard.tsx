import { CurrentWeather, DailyWeather } from "../types/weather";
import { getWeatherIcon, capitalizeFirstLetter } from "../utils/weatherUtils";
import { MapPin, ChevronDown } from "lucide-react";

interface CurrentWeatherCardProps {
  current: CurrentWeather;
  daily: DailyWeather;
  location: string;
  className?: string;
}

export default function CurrentWeatherCard({
  current,
  daily,
  location,
  className = "",
}: CurrentWeatherCardProps) {
  const mainTemp = Math.round(current.temp);
  const description = capitalizeFirstLetter(current.weather[0].description);
  const high = Math.round(daily.temp.max);
  const low = Math.round(daily.temp.min);
  const icon = getWeatherIcon(current.weather[0].icon, "h-20 w-20");
  const dayName = new Date(current.dt * 1000).toLocaleDateString(undefined, {
    weekday: "long",
  });
  const dateStr = new Date(current.dt * 1000).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={"text-left pb-4 " + className}>
      {/* Header row: location + units toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {dayName}, {dateStr}
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 rounded-full bg-[#f5fbf7] px-3 py-1 text-xs font-medium text-emerald-900"
        >
          °C
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Main temperature + icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-4">{icon.symbol}</span>
          <div>
            <div className="text-6xl font-extrabold text-emerald-800">
              {mainTemp}°C
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Feels like {Math.round(current.feels_like)}°
            </div>
          </div>
        </div>

        <div className="text-right text-sm text-gray-600">
          <div className="font-semibold text-emerald-900">Heavy Rain</div>
          <div className="text-xs text-gray-500">
            H: {high}° · L: {low}°
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {capitalizeFirstLetter(description)}
          </div>
        </div>
      </div>
    </div>
  );
}
