import DailyForecastItem from './DailyForecastItem';
import { DailyWeather } from '../types/weather';

interface DailyForecastListProps {
  dailyData: DailyWeather[];
}

export default function DailyForecastList({ dailyData }: DailyForecastListProps) {
  return (
    <div className="pt-4 bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-medium mb-3 text-emerald-800">7-Day Forecast</h3>
      <ul className="space-y-2">
        {dailyData.map((day, index) => (
          <DailyForecastItem key={day.dt} data={day} isToday={index === 0} />
        ))}
      </ul>
    </div>
  );
}
