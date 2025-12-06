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
import { api } from "@/lib/api";

export default function WeatherPage() {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const { location: geoLocation, loading: isLocating, error: locationError } = useGeolocation();
  const { setTitle, setFilters } = useHeaderStore();

  const {
    data: weatherData,
    error,
    setFromResponse,
    setLocation,
    setCurrentTime,
  } = useWeatherStore();

  // Sync geolocation to weather store
  useEffect(() => {
    if (geoLocation) {
      setLocation({
        lat: geoLocation.lat,
        lon: geoLocation.lon,
        name: geoLocation.name,
        isDefault: geoLocation.isDefault,
      });
    }
  }, [geoLocation, setLocation]);

  // Real-time clock: update store time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [setCurrentTime]);

  // Auto-refresh weather every 10 minutes and on location change
  useEffect(() => {
    const interval = setInterval(() => setRefreshTick((t) => t + 1), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data when location is known or refresh tick increments
  useEffect(() => {
    async function fetchData() {
      if (!geoLocation) return; // Wait for location to be determined

      try {
        setIsFetching(true);
        // Use the API client to fetch weather from backend
        const data = await api.getWeather(geoLocation.lat, geoLocation.lon);
        setFromResponse(data);
      } catch (err) {
        console.error("Failed to load weather", err);
        setFromResponse({ error: String(err ?? "Failed to load weather") });
      } finally {
        setIsFetching(false);
      }
    }
    fetchData();
  }, [setFromResponse, geoLocation, refreshTick]);

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

  const handleSendBroadcast = async (data: Record<string, unknown>) => {
    try {
      await api.sendWeatherBroadcast({
        aiNotifications: data.aiNotifications as boolean,
        region: data.region as string,
        district: data.district as string,
        message: data.message as string,
      });
      console.log("Weather Broadcast sent:", data);
    } catch (err) {
      console.error("Failed to send broadcast:", err);
    }
    setIsBroadcastOpen(false);
  };

  if (!weatherData) {
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg font-semibold text-emerald-600">{error}</p>
            <p className="mt-2 text-sm text-emerald-700">
              The server API returned an error or invalid data. Please check that
              the backend server is running and the{" "}
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-800">
                NEXT_PUBLIC_API_BASE_URL
              </code>{" "}
              environment variable is set correctly.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-emerald-700">
          {isLocating ? "Detecting location…" : isFetching ? "Loading weather…" : "Preparing weather…"}
        </p>
      </div>
    );
  }

  const todayDaily = weatherData.daily[0];
  const locationDisplay = geoLocation?.name || "Unknown Location";

  return (
    <main className="flex justify-center p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl">
        {/* Location Display */}
        <div className="mb-4 text-sm text-emerald-700">
          Weather for: <span className="font-semibold">{locationDisplay}</span>
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
