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
    <li className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition duration-150">
      <span className="text-md font-semibold w-1/5">{dayName}</span>

      <div className="flex items-center w-3/5">
        <span className="mr-3 flex items-center">{icon.symbol}</span>
        <span className="text-sm font-light hidden sm:inline">{description}</span>
      </div>

      <div className="flex justify-end w-1/5 space-x-4">
        <span className="font-bold">{high}°</span>
        <span className="font-light text-white/70">{low}°</span>
      </div>
    </li>
  );
}
