"use client";
import { getFarmersOverTime } from "@/lib/dummyData";
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

export default function ChartCard() {
  const chartData = getFarmersOverTime();
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const avgValue = Math.round(
    chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        <span className="text-[#00594C]">Farmers</span> Count Overtime
      </h3>

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
            +
            {(
              ((chartData[chartData.length - 1].value - chartData[0].value) /
                chartData[0].value) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>
    </div>
  );
}
