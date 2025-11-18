import { CurrentWeather, DailyWeather } from "../types/weather";
import { getWeatherIcon, capitalizeFirstLetter } from "../utils/weatherUtils";

interface CurrentWeatherCardProps {
  current: CurrentWeather;
  daily: DailyWeather;
  location: string;
}

export default function CurrentWeatherCard({
  current,
  daily,
  location,
}: CurrentWeatherCardProps) {
  const mainTemp = Math.round(current.temp);
  const description = capitalizeFirstLetter(current.weather[0].description);
  const high = Math.round(daily.temp.max);
  const low = Math.round(daily.temp.min);
  const icon = getWeatherIcon(current.weather[0].icon, "text-5xl");

  return (
    <div className="text-center pb-6 mb-6 border-b border-white/30">
      <h2 className="text-2xl font-light mb-1">{location}</h2>

      <div className="flex items-center justify-center my-3">
        <span className={`text-7xl mr-4 ${icon.className}`}>{icon.symbol}</span>
        <span className="text-8xl font-bold">{mainTemp}°C</span>
      </div>

      <p className="text-xl font-light">{description}</p>
      <p className="text-md mt-2">
        H:<span className="font-semibold">{high}°</span> L:
        <span className="font-semibold">{low}°</span>
      </p>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-y-3 mt-6 text-sm">
        <div className="flex justify-between px-4 border-r border-white/20">
          <span className="font-light">Humidity:</span>
          <span className="font-medium">{current.humidity}%</span>
        </div>
        <div className="flex justify-between px-4">
          <span className="font-light">Wind:</span>
          <span className="font-medium">
            {Math.round(current.wind_speed * 3.6)} km/h
          </span>
        </div>
        <div className="flex justify-between px-4 border-r border-white/20">
          <span className="font-light">Feels Like:</span>
          <span className="font-medium">{Math.round(current.feels_like)}°C</span>
        </div>
        <div className="flex justify-between px-4">
          <span className="font-light">UV Index:</span>
          <span className="font-medium">{current.uvi}</span>
        </div>
      </div>
    </div>
  );
}
