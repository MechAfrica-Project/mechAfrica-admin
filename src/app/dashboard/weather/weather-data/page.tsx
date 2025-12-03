"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun } from "lucide-react";

import CurrentWeatherCard from "./_components/CurrentWeatherCard";
import { getWeatherIcon } from "./utils/weatherUtils";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { WeatherBroadcastModal } from "./_components/WeatherBroadcastModal";
import { useWeatherStore } from "@/stores/useWeatherStore";

export default function WeatherPage() {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const { setTitle, setFilters } = useHeaderStore();
  const { data: weatherData, error, isLoading, setFromResponse } =
    useWeatherStore();

  // Fetch weather data once on mount
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

    fetchData();
  }, [setFromResponse]);

  // Set dashboard header
  useEffect(() => {
    setTitle("Weather");
    setFilters({});
  }, [setTitle, setFilters]);

  // Listen for `Weather Broadcast` action tab
  const lastAction = useHeaderStore((s) => s.lastAction);
  const setAction = useHeaderStore((s) => s.setAction);

  useEffect(() => {
    if (lastAction === "open-weatherBroadcast-modal") {
      setIsBroadcastOpen(true);
      setAction(null);
    }
  }, [lastAction, setAction]);

  const handleSendBroadcast = (data: Record<string, unknown>) => {
    console.log("Weather Broadcast sent:", data);
    setIsBroadcastOpen(false);
  };

  if (isLoading || !weatherData) {
    if (!error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#f5fbf7]">
          <p className="text-lg text-emerald-900">Loading weather…</p>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5fbf7]">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The server API returned an error or invalid data. Make sure the
            environment variables are set: <code>OPENWEATHER_KEY</code> (server)
            or <code>NEXT_PUBLIC_OPENWEATHER_KEY</code> (public). See
            <code>.env.example</code> for names.
          </p>
        </div>
      </main>
    );
  }

  const todayDaily = weatherData.daily[0];

  const formatTime = (unix: number) =>
    new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="flex min-h-screen justify-center bg-[#f5fbf7] px-4 py-6 md:px-8">
      <motion.div
        className="w-full max-w-6xl space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Top section */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1.4fr]">
          {/* Left: current weather card */}
          <motion.div
            className="rounded-[24px] bg-white px-6 py-6 shadow-sm md:px-8 md:py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <CurrentWeatherCard
              current={weatherData.current}
              daily={todayDaily}
              location="Kumasi, Ghana"
            />
          </motion.div>

          {/* Right: Days Forecast */}
          <motion.div
            className="rounded-[24px] bg-white px-6 py-6 shadow-sm md:px-8 md:py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 className="mb-4 text-2xl font-semibold text-emerald-800">
              Days Forecast
            </h3>

            <div className="flex space-x-3 overflow-x-auto pb-2">
              {weatherData.daily.slice(0, 5).map((d, i) => {
                const dayName =
                  i === 0
                    ? "Today"
                    : new Date(d.dt * 1000).toLocaleDateString(undefined, {
                        weekday: "short",
                      });
                const iconObj = getWeatherIcon(
                  d.weather?.[0]?.icon ?? "",
                  "text-3xl"
                );
                const temp = Math.round(d.temp.day ?? d.temp.max);
                return (
                  <div
                    key={d.dt}
                    className="w-24 shrink-0 rounded-2xl bg-[#f5fbf7] px-3 py-3 text-center shadow-sm"
                  >
                    <div className="mb-1 text-sm text-gray-500">{dayName}</div>
                    <div className="mb-2">
                      <span className={iconObj.className}>{iconObj.symbol}</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-700">
                      {temp}°C
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Today's Highlight */}
        <motion.section
          className="rounded-[24px] bg-white px-6 py-6 shadow-sm md:px-8 md:py-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h3 className="mb-6 text-2xl font-semibold text-emerald-800">
            Today&apos;s Highlight
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
              <div className="text-sm text-emerald-900">Wind Status</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-900">
                {Math.round(weatherData.current.wind_speed * 3.6)} km/h
              </div>
              <div className="mt-1 text-xs text-gray-500">9:00 AM</div>
            </div>

            <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
              <div className="text-sm text-emerald-900">Humidity</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-900">
                {weatherData.current.humidity} %
              </div>
              <div className="mt-1 text-xs text-emerald-600">
                Humidity is good
              </div>
            </div>

            <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
              <div className="text-sm text-emerald-900">Visibility</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-900">
                {Math.round((weatherData.current.visibility ?? 0) / 1000)} km
              </div>
              <div className="mt-1 text-xs text-gray-500">9:00 AM</div>
            </div>

            <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
              <div className="text-sm text-emerald-900">UV Index</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-900">
                {weatherData.current.uvi} UV
              </div>
              <div className="mt-1 text-xs text-gray-500">Moderate UV</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl bg-[#f5fbf7] px-6 py-5">
              <div>
                <div className="text-sm text-emerald-900">Sunset</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-900">
                  {formatTime(todayDaily.sunset)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe9c7]">
                <Sun className="h-6 w-6 text-orange-400" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#f5fbf7] px-6 py-5">
              <div>
                <div className="text-sm text-emerald-900">Sunrise</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-900">
                  {formatTime(todayDaily.sunrise)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffe9c7]">
                <Sun className="h-6 w-6 text-yellow-400 rotate-180" />
              </div>
            </div>
          </div>
        </motion.section>

        <WeatherBroadcastModal
          isOpen={isBroadcastOpen}
          onOpenChange={setIsBroadcastOpen}
          onSend={handleSendBroadcast}
        />
      </motion.div>
    </main>
  );
}
