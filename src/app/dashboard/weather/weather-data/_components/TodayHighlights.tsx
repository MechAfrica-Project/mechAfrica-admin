"use client";

import { motion } from "framer-motion";
import { Sun } from "lucide-react";
import { CurrentWeather, DailyWeather } from "../types/weather";

interface TodayHighlightsProps {
  current: CurrentWeather;
  todayDaily: DailyWeather;
}

export function TodayHighlights({ current, todayDaily }: TodayHighlightsProps) {
  const formatTime = (unix: number) =>
    new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
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
            {Math.round(current.wind_speed * 3.6)} km/h
          </div>
          <div className="mt-1 text-xs text-gray-500">9:00 AM</div>
        </div>

        <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
          <div className="text-sm text-emerald-900">Humidity</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-900">
            {current.humidity} %
          </div>
          <div className="mt-1 text-xs text-emerald-600">Humidity is good</div>
        </div>

        <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
          <div className="text-sm text-emerald-900">Visibility</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-900">
            {Math.round((current.visibility ?? 0) / 1000)} km
          </div>
          <div className="mt-1 text-xs text-gray-500">9:00 AM</div>
        </div>

        <div className="rounded-2xl bg-[#f5fbf7] px-4 py-4 text-center">
          <div className="text-sm text-emerald-900">UV Index</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-900">
            {current.uvi} UV
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
            <Sun className="h-6 w-6 rotate-180 text-yellow-400" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}


