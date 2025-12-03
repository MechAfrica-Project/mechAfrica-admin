"use client";

import { motion } from "framer-motion";
import { DailyWeather } from "../types/weather";
import { getWeatherIcon } from "../utils/weatherUtils";

interface DaysForecastCardProps {
  daily: DailyWeather[];
}

export function DaysForecastCard({ daily }: DaysForecastCardProps) {
  return (
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
        {daily.slice(0, 5).map((d, i) => {
          const dayName =
            i === 0
              ? "Today"
              : new Date(d.dt * 1000).toLocaleDateString(undefined, {
                  weekday: "short",
                });
          const iconObj = getWeatherIcon(d.weather?.[0]?.icon ?? "", "text-3xl");
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
              <div className="text-lg font-bold text-emerald-700">{temp}°C</div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}


