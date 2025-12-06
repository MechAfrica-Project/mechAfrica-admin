import { CurrentWeather, DailyWeather } from "../types/weather";
import { getWeatherIcon, capitalizeFirstLetter } from "../utils/weatherUtils";

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
    <div className={"text-left pb-6 mb-6 " + className}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-emerald-700 font-semibold">
            {location}
          </div>
          <div className="text-xs text-gray-500">
            {dayName} · {dateStr}
          </div>
        </div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          <span className={"mr-4 " + (icon.className ?? "")}>{icon.symbol}</span>
          <div>
            <div className="text-6xl font-extrabold text-emerald-800">
              {mainTemp}°C
            </div>
            <div className="text-sm text-gray-500">
              Feels like {Math.round(current.feels_like)}°
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <div>
            H: <span className="font-semibold">{high}°</span>
          </div>
          <div>
            L: <span className="font-semibold">{low}°</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 text-sm">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs text-gray-500">Wind Status</div>
          <div className="text-lg font-bold">
            {Math.round(current.wind_speed * 3.6)} km/h
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs text-gray-500">Humidity</div>
          <div className="text-lg font-bold">{current.humidity}%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs text-gray-500">Visibility</div>
          <div className="text-lg font-bold">
            {Math.round((current.visibility ?? 0) / 1000)} km
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-xs text-gray-500">UV Index</div>
          <div className="text-lg font-bold">{current.uvi}</div>
        </div>
      </div>
    </div>
  );
}
