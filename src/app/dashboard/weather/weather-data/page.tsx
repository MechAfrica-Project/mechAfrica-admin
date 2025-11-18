"use client";

import { useEffect, useState } from "react";
import CurrentWeatherCard from "./_components/CurrentWeatherCard";
import DailyForecastList from "./_components/DailyForecastList";
import HourlyForecastList from "./_components/HourlyForecastList";
import { WeatherData } from "./types/weather";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { WeatherBroadcastModal } from "./_components/WeatherBroadcastModal";

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const { setTitle, setFilters } = useHeaderStore();

  // Fetch weather data (client-side or switch back to server-side if you prefer)
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/weather"); // You can replace with your API route
          const data = await res.json();

          // If the API returned an error object, surface it to the UI instead of
          // blindly using the payload (which may be missing expected arrays).
          const isErrorPayload = typeof data === "object" && data !== null && "error" in data;
          if (isErrorPayload) {
            const errValue = (data as { error?: unknown }).error;
            setError(String(errValue ?? "Failed to load weather"));
            setWeatherData(null);
            return;
          }

          // Basic shape validation
          if (!data || !data.current || !Array.isArray(data.daily) || !Array.isArray(data.hourly)) {
            setError("Unexpected weather data. Check your OPENWEATHER_KEY and API response.");
            setWeatherData(null);
            return;
          }

          setWeatherData(data as WeatherData);
      } catch (err) {
        console.error("Failed to load weather", err);
        setError(String(err ?? "Failed to load weather"));
      }
    }
    fetchData();
  }, []);

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

  return (
    <main className="flex justify-center p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white">
        <CurrentWeatherCard
          current={weatherData.current}
          daily={weatherData.daily[0]}
          location="Kumasi, Ghana"
        />

        <HourlyForecastList hourlyData={weatherData.hourly.slice(0, 24)} />
        <DailyForecastList dailyData={weatherData.daily.slice(1, 8)} />
      </div>

      <WeatherBroadcastModal
        isOpen={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
        onSend={handleSendBroadcast}
      />
    </main>
  );
}
