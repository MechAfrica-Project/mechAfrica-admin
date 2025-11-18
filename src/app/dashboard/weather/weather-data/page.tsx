import CurrentWeatherCard from "./_components/CurrentWeatherCard";
import DailyForecastList from "./_components/DailyForecastList";
import HourlyForecastList from "./_components/HourlyForecastList";
import { WeatherData } from "./types/weather";

// Replace with your actual environment variable
const API_KEY = process.env.OPENWEATHERMAP_API_KEY || "YOUR_API_KEY";
const LAT = 6.6885; // Kumasi, Ghana
const LON = -1.6244;

async function getWeatherData(): Promise<WeatherData | null> {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&units=metric&exclude=minutely&appid=${API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    const data: WeatherData = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

export default async function WeatherApp() {
  const weatherData = await getWeatherData();

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Could not load weather data.</p>
      </div>
    );
  }

  return (
    <main className="flex justify-center p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div
        className="w-full max-w-md p-6 rounded-3xl shadow-2xl 
                    bg-gradient-to-br from-blue-600 to-indigo-700 
                    text-white"
      >
        <h1 className="sr-only">Weather Dashboard</h1>

        <CurrentWeatherCard
          current={weatherData.current}
          daily={weatherData.daily[0]}
          location="Kumasi, Ghana"
        />

        <HourlyForecastList hourlyData={weatherData.hourly.slice(0, 24)} />

        <DailyForecastList dailyData={weatherData.daily.slice(1, 8)} />
      </div>
    </main>
  );
}
