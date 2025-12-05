"use client";

import { useEffect, useState } from "react";
import CurrentWeatherCard from "./_components/CurrentWeatherCard";
import DailyForecastList from "./_components/DailyForecastList";
import HourlyForecastList from "./_components/HourlyForecastList";
import { getWeatherIcon } from "./utils/weatherUtils";
import { Sun, Moon } from "lucide-react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { WeatherBroadcastModal } from "@/app/dashboard/weather/weather-broadcast/_components/WeatherBroadcastModal";
import { useWeatherStore } from "@/stores/useWeatherStore";

export default function WeatherPage() {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const { setTitle, setFilters } = useHeaderStore();
  // use weather store
  const { data: weatherData, error, isLoading, setFromResponse } = useWeatherStore();

  // Fetch weather data (client-side or switch back to server-side if you prefer)
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/weather");
        const data = await res.json();
        setFromResponse(data);
      } catch (err) {
        console.error("Failed to load weather", err);
        setFromResponse({ error: String(err ?? "Failed to load weather") });
      }
    }
    if (!weatherData && isLoading) fetchData();
  }, [weatherData, isLoading, setFromResponse]);

  // Set header title and filters
  useEffect(() => {
    setTitle("Weather");
    setFilters({});
  }, [setTitle, setFilters]);

  // Listen for `Weather Broadcast` action tab
  // React to header action tabs via the header store. This is more reliable than
  // relying only on window events (ensures the modal opens even if events are
  // dispatched before the page is mounted).
  const lastAction = useHeaderStore((s) => s.lastAction);
  const setAction = useHeaderStore((s) => s.setAction);

  useEffect(() => {
    if (lastAction === "open-weatherBroadcast-modal") {
      setIsBroadcastOpen(true);
      // clear the action so it doesn't reopen repeatedly
      setAction(null);
    }
  }, [lastAction, setAction]);

  const handleSendBroadcast = (data: Record<string, unknown>) => {
    console.log("Weather Broadcast sent:", data);
    setIsBroadcastOpen(false);
  };

  if (!weatherData) {
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The server API returned an error or invalid data. Make sure the
              environment variables are set: <code>OPENWEATHER_KEY</code> (server)
              or <code>NEXT_PUBLIC_OPENWEATHER_KEY</code> (public). See
              <code>.env.example</code> for names.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading weather…</p>
      </div>
    );
  }

  const todayDaily = weatherData.daily[0];

  return (
    <main className="flex justify-center p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Current Weather */}
          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <CurrentWeatherCard
                current={weatherData.current}
                daily={todayDaily}
                location="Kumasi, Ghana"
                className=""
              />

              <HourlyForecastList hourlyData={weatherData.hourly.slice(0, 24)} />
            </div>
          </div>

          {/* Right: Days Forecast */}
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">Days Forecast</h3>

              <div className="flex space-x-3 overflow-x-auto pb-2">
                {weatherData.daily.slice(0, 5).map((d, i) => {
                  const dayName = i === 0 ? 'Today' : new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
                  const iconObj = getWeatherIcon(d.weather?.[0]?.icon ?? '', 'h-6 w-6');
                  const temp = Math.round(d.temp.day ?? d.temp.max);
                  return (
                    <div key={d.dt} className="w-24 shrink-0 bg-gray-50 rounded-2xl p-3 text-center shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">{dayName}</div>
                      <div className="mb-2 flex items-center justify-center">{iconObj.symbol}</div>
                      <div className="text-lg font-bold text-emerald-700">{temp}°C</div>
                    </div>
                  );
                })}
              </div>

              <DailyForecastList dailyData={weatherData.daily.slice(1, 8)} />
            </div>
          </div>
        </div>

        {/* Today&apos;s Highlight */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h3 className="text-2xl font-semibold text-emerald-800 mb-4">Today&apos;s Highlight</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-sm text-gray-500">Wind Status</div>
              <div className="text-xl font-bold">{Math.round(weatherData.current.wind_speed * 3.6)} km/h</div>
              <div className="text-xs text-gray-400">9:00 AM</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-sm text-gray-500">Humidity</div>
              <div className="text-xl font-bold">{weatherData.current.humidity}%</div>
              <div className="text-xs text-gray-400">Humidity is good</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-sm text-gray-500">Visibility</div>
              <div className="text-xl font-bold">{Math.round((weatherData.current.visibility ?? 0) / 1000)} km</div>
              <div className="text-xs text-gray-400">9:00 AM</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <div className="text-sm text-gray-500">UV Index</div>
              <div className="text-xl font-bold">{weatherData.current.uvi}</div>
              <div className="text-xs text-gray-400">Moderate UV</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Sunset</div>
                <div className="text-2xl font-bold">{todayDaily.sunset ? new Date(todayDaily.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
              </div>
              <div className="text-4xl"><Sun className="h-8 w-8 text-orange-400" /></div>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Sunrise</div>
                <div className="text-2xl font-bold">{todayDaily.sunrise ? new Date(todayDaily.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
              </div>
              <div className="text-4xl"><Moon className="h-8 w-8 text-yellow-400" /></div>
            </div>
          </div>
        </section>

        <WeatherBroadcastModal
          isOpen={isBroadcastOpen}
          onOpenChange={setIsBroadcastOpen}
          onSend={handleSendBroadcast}
        />
      </div>
    </main>
  );
}
