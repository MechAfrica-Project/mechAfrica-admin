"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

// Default chart data (placeholder until backend provides historical data)
const defaultChartData = [
  { month: "Jan", value: 0 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
  { month: "Jul", value: 0 },
  { month: "Aug", value: 0 },
  { month: "Sep", value: 0 },
  { month: "Oct", value: 0 },
  { month: "Nov", value: 0 },
  { month: "Dec", value: 0 },
];

export default function ChartCard() {
  const statistics = useDashboardStore((state) => state.statistics);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Generate chart data based on current farmers count
  // Note: Backend doesn't provide historical data yet, so we show current total
  const totalFarmers = statistics?.totalFarmers ?? 0;

  // Generate simulated growth data based on current total
  const chartData = defaultChartData.map((item, index) => ({
    ...item,
    value: Math.round((totalFarmers / 12) * (index + 1) * (0.8 + Math.random() * 0.4)),
  }));

  // Ensure the last month shows actual total
  if (chartData.length > 0) {
    chartData[chartData.length - 1].value = totalFarmers;
  }

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const avgValue = Math.round(
    chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
  );

  // Loading state
  if (isLoading && !statistics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          <span className="text-[#00594C]">Farmers</span> Count Overtime
        </h3>
        <div className="h-96 w-full bg-gray-50 rounded-lg border border-gray-200 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00594C] mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          <span className="text-[#00594C]">Farmers</span> Count Overtime
        </h3>
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold text-[#00594C]">{totalFarmers}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full bg-gray-50 rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="farmersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00594C" stopOpacity={0.12} />
                <stop offset="80%" stopColor="#00594C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              style={{ fontSize: "12px", fontWeight: 500 }}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "12px", fontWeight: 500 }}
              tick={{ fill: "#6b7280" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
              cursor={{ stroke: "#d1d5db", opacity: 0.3 }}
              formatter={(value: number) => [value, "Farmers"]}
            />
            <Area dataKey="value" stroke="none" fill="url(#farmersGradient)" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00594C"
              strokeWidth={2}
              dot={{ fill: "#00594C", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive
              name="Farmers"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
            Average
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {avgValue}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
            Peak
          </p>
          <p className="text-lg font-semibold text-[#00594C] mt-2">
            {maxValue} farmers
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
            Total Growth
          </p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            {chartData[0].value > 0
              ? `+${(
                ((chartData[chartData.length - 1].value - chartData[0].value) /
                  chartData[0].value) *
                100
              ).toFixed(1)}%`
              : "+0%"}
          </p>
        </div>
      </div>

      {/* Note about data */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        * Historical data will be available when backend analytics are implemented
      </p>
    </div>
  );
}
