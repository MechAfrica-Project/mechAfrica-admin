"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import CurrentWeatherCard from "./_components/CurrentWeatherCard";
import { DaysForecastCard } from "./_components/DaysForecastCard";
import { TodayHighlights } from "./_components/TodayHighlights";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useWeatherStore } from "@/stores/useWeatherStore";
import { WeatherBroadcastModal } from "../weather-broadcast/_components/WeatherBroadcastModal";

export default function WeatherPage() {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const { setTitle, setFilters } = useHeaderStore();
  const {
    data: weatherData,
    error,
    isLoading,
    setFromResponse,
  } = useWeatherStore();

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

  return (
    <main className="flex min-h-screen justify-center bg-[#f5fbf7] px-4 py-6 md:px-8">
      <motion.div
        className="w-full max-w-6xl space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Top section */}
        <section className="flex flex-col lg:flex-row lg:justify-between">
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
          <DaysForecastCard daily={weatherData.daily} />
        </section>

        {/* Today's Highlight */}
        <TodayHighlights current={weatherData.current} todayDaily={todayDaily} />

        <WeatherBroadcastModal
          isOpen={isBroadcastOpen}
          onOpenChange={setIsBroadcastOpen}
          onSend={handleSendBroadcast}
        />
      </motion.div>
    </main>
  );
}
