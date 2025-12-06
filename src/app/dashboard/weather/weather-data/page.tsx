"use client";

import { useEffect, useState } from "react";
import CurrentWeatherCard from "./_components/CurrentWeatherCard";
import DailyForecastList from "./_components/DailyForecastList";
import HourlyForecastList from "./_components/HourlyForecastList";
import { DaysForecastCard } from "./_components/DaysForecastCard";
import { TodayHighlights } from "./_components/TodayHighlights";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { WeatherBroadcastModal } from "@/app/dashboard/weather/weather-broadcast/_components/WeatherBroadcastModal";
import { useWeatherStore } from "@/stores/useWeatherStore";
import { useGeolocation } from "./hooks/useGeolocation";

export default function WeatherPage() {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const { location, loading: isLocating, error: locationError } = useGeolocation();
  const { setTitle, setFilters } = useHeaderStore();
  // use weather store
  const {
    data: weatherData,
    error,
    isLoading,
    setFromResponse,
  } = useWeatherStore();

  // Fetch weather data (client-side or switch back to server-side if you prefer)
  useEffect(() => {
    async function fetchData() {
      if (!location) return; // Wait for location to be determined

      try {
        const params = new URLSearchParams({
          lat: location.lat.toString(),
          lon: location.lon.toString(),
        });
        const res = await fetch(`/api/weather?${params}`);
        const data = await res.json();
        setFromResponse(data);
      } catch (err) {
        console.error("Failed to load weather", err);
        setFromResponse({ error: String(err ?? "Failed to load weather") });
      }
    }
    if (!weatherData && isLoading && location) fetchData();
  }, [weatherData, isLoading, setFromResponse, location]);

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
            <p className="text-lg font-semibold text-emerald-600">{error}</p>
            <p className="mt-2 text-sm text-emerald-700">
              The server API returned an error or invalid data. Make sure the
              environment variables are set:{" "}
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-800">
                OPENWEATHER_API_KEY
              </code>{" "}
              (server) or{" "}
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-800">
                NEXT_PUBLIC_OPENWEATHER_API_KEY
              </code>{" "}
              (public). See{" "}
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-800">
                .env
              </code>{" "}
              for configuration.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-emerald-700">
          {isLocating ? "Detecting location…" : "Loading weather…"}
        </p>
      </div>
    );
  }

  const todayDaily = weatherData.daily[0];
  const locationDisplay = location?.name || "Unknown Location";

  return (
    <main className="flex justify-center p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl">
        {/* Location Display */}
        <div className="mb-4 text-sm text-emerald-700">
          📍 Weather for: <span className="font-semibold">{locationDisplay}</span>
          {locationError ? (
            <span className="ml-2 text-xs text-amber-700">
              (Geolocation error: {locationError}. Using fallback.)
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Current Weather */}
          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <CurrentWeatherCard
                current={weatherData.current}
                daily={todayDaily}
                location={locationDisplay}
                className=""
              />

              <HourlyForecastList
                hourlyData={weatherData.hourly.slice(0, 24)}
              />
            </div>
          </div>

          {/* Right: Days Forecast */}
          <div className="col-span-12 lg:col-span-5">
            <DaysForecastCard daily={weatherData.daily} />
            <div className="mt-6">
              <DailyForecastList dailyData={weatherData.daily.slice(1, 8)} />
            </div>
          </div>
        </div>

        {/* Today's Highlight */}
        <div className="mt-6">
          <TodayHighlights
            current={weatherData.current}
            todayDaily={todayDaily}
          />
        </div>

        <WeatherBroadcastModal
          isOpen={isBroadcastOpen}
          onOpenChange={setIsBroadcastOpen}
          onSend={handleSendBroadcast}
        />
      </div>
    </main>
  );
}
