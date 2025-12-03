import { HourlyWeather } from "../types/weather";
import { getWeatherIcon } from "../utils/weatherUtils";


interface HourlyForecastItemProps {
  data: HourlyWeather;
}

export default function HourlyForecastItem({ data }: HourlyForecastItemProps) {
  const time = new Date(data.dt * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
  });
  const temp = Math.round(data.temp);
  const icon = getWeatherIcon(data.weather[0].icon, "h-6 w-6");

  return (
    <div className="shrink-0 w-20 p-3 text-center rounded-xl bg-white/10 hover:bg-white/20 transition duration-150">
      <p className="text-sm font-semibold mb-1">{time}</p>
      <div className="my-1 flex items-center justify-center">{icon.symbol}</div>
      <p className="text-lg font-bold">{temp}°</p>
    </div>
  );
}
