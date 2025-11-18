import { HourlyWeather } from "../types/weather";
import HourlyForecastItem from "./HourlyForecastItem";


interface HourlyForecastListProps {
  hourlyData: HourlyWeather[];
}

export default function HourlyForecastList({
  hourlyData,
}: HourlyForecastListProps) {
  return (
    <div className="py-4 mb-6 border-b border-white/30">
      <h3 className="text-lg font-medium mb-3">Hourly Forecast</h3>
      <div
        className="flex space-x-4 overflow-x-scroll pb-2 
                   scrollbar-thin scrollbar-thumb-white/50 scrollbar-track-transparent"
      >
        {hourlyData.map((hour) => (
          <HourlyForecastItem key={hour.dt} data={hour} />
        ))}
      </div>
    </div>
  );
}
