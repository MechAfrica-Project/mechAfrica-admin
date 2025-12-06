import { DailyWeather } from "../types/weather";
import { getWeatherIcon, capitalizeFirstLetter } from "../utils/weatherUtils";

interface DailyForecastItemProps {
  data: DailyWeather;
  isToday: boolean;
}

export default function DailyForecastItem({
  data,
  isToday,
}: DailyForecastItemProps) {
  const dayName = isToday
    ? "Today"
    : new Date(data.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });
  const high = Math.round(data.temp.max);
  const low = Math.round(data.temp.min);
  const description = capitalizeFirstLetter(data.weather[0].description);
  const icon = getWeatherIcon(data.weather[0].icon, "h-6 w-6");

  return (
    <li className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition duration-150">
      <span className="text-md font-semibold w-1/5 text-emerald-700">{dayName}</span>

      <div className="flex items-center w-3/5">
        <span className="mr-3 flex items-center">{icon.symbol}</span>
        <span className="text-sm font-light hidden sm:inline text-emerald-600">{description}</span>
      </div>

      <div className="flex justify-end w-1/5 space-x-4">
        <span className="font-bold text-emerald-800">{high}°</span>
        <span className="font-light text-emerald-600">{low}°</span>
      </div>
    </li>
  );
}
