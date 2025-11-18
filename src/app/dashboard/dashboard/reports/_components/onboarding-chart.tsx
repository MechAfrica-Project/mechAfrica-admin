"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";

const chartDataMap = {
  farmer: [
    { month: "Jan", thisYear: 7200, lastYear: 5400, overTime: 6200 },
    { month: "Feb", thisYear: 8100, lastYear: 6200, overTime: 7100 },
    { month: "Mar", thisYear: 9600, lastYear: 7800, overTime: 8600 },
    { month: "Apr", thisYear: 11200, lastYear: 8900, overTime: 10100 },
    { month: "May", thisYear: 10800, lastYear: 9200, overTime: 10000 },
    { month: "Jun", thisYear: 9500, lastYear: 7900, overTime: 8700 },
    { month: "Jul", thisYear: 11400, lastYear: 8900, overTime: 10100 },
  ],
  provider: [
    { month: "Jan", thisYear: 2100, lastYear: 1800, overTime: 1950 },
    { month: "Feb", thisYear: 2400, lastYear: 2100, overTime: 2250 },
    { month: "Mar", thisYear: 2800, lastYear: 2300, overTime: 2550 },
    { month: "Apr", thisYear: 3200, lastYear: 2700, overTime: 2950 },
    { month: "May", thisYear: 3100, lastYear: 2900, overTime: 3000 },
    { month: "Jun", thisYear: 2900, lastYear: 2500, overTime: 2700 },
    { month: "Jul", thisYear: 3400, lastYear: 2800, overTime: 3100 },
  ],
  solved: [
    { month: "Jan", thisYear: 45, lastYear: 32, overTime: 38 },
    { month: "Feb", thisYear: 52, lastYear: 38, overTime: 45 },
    { month: "Mar", thisYear: 68, lastYear: 45, overTime: 56 },
    { month: "Apr", thisYear: 89, lastYear: 56, overTime: 72 },
    { month: "May", thisYear: 76, lastYear: 64, overTime: 70 },
    { month: "Jun", thisYear: 62, lastYear: 50, overTime: 56 },
    { month: "Jul", thisYear: 92, lastYear: 68, overTime: 80 },
  ],
  escalated: [
    { month: "Jan", thisYear: 234, lastYear: 187, overTime: 210 },
    { month: "Feb", thisYear: 267, lastYear: 204, overTime: 235 },
    { month: "Mar", thisYear: 289, lastYear: 245, overTime: 267 },
    { month: "Apr", thisYear: 312, lastYear: 278, overTime: 295 },
    { month: "May", thisYear: 298, lastYear: 289, overTime: 293 },
    { month: "Jun", thisYear: 276, lastYear: 234, overTime: 255 },
    { month: "Jul", thisYear: 334, lastYear: 267, overTime: 300 },
  ],
};

const COLORS = {
  thisYear: "#16a34a",
  lastYear: "#94a3b8",
  overTime: "#0ea5e9",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}:{" "}
            <span className="font-semibold">
              {entry.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface OnboardingChartProps {
  metric: "farmer" | "provider" | "solved" | "escalated";
}

export function OnboardingChart({ metric }: OnboardingChartProps) {
  const [timeFilter, setTimeFilter] = useState("thisYear");
  const chartData = chartDataMap[metric];

  const getVisibleSeries = () => {
    switch (timeFilter) {
      case "overTime":
        return [
          {
            key: "overTime",
            name: "Over time",
            color: COLORS.overTime,
            strokeWidth: 3,
            opacity: 1,
          },
        ];
      case "thisYear":
        return [
          {
            key: "thisYear",
            name: "This year",
            color: COLORS.thisYear,
            strokeWidth: 3,
            opacity: 1,
          },
          {
            key: "lastYear",
            name: "Last year",
            color: COLORS.lastYear,
            strokeWidth: 2,
            strokeDasharray: "5 5",
            opacity: 0.7,
          },
        ];
      case "lastYear":
        return [
          {
            key: "lastYear",
            name: "Last year",
            color: COLORS.lastYear,
            strokeWidth: 3,
            opacity: 1,
          },
        ];
      default:
        return [];
    }
  };

  const visibleSeries = getVisibleSeries();

  const avgValue = Math.round(
    chartData.reduce(
      (sum, item) =>
        sum +
        (item as any)[timeFilter === "overTime" ? "overTime" : timeFilter],
      0
    ) / chartData.length
  );

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Trend Analysis
            </h3>
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: "overTime", label: "Over time" },
              { id: "thisYear", label: "This year" },
              { id: "lastYear", label: "Last year" },
            ].map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                variant={timeFilter === filter.id ? "default" : "ghost"}
                size="sm"
                className={`text-xs font-medium transition-all ${
                  timeFilter === filter.id
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-96 w-full bg-gray-50 rounded-lg border border-gray-200 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.5}
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
                content={<CustomTooltip />}
                cursor={{ stroke: "#d1d5db", opacity: 0.3 }}
              />

              <ReferenceLine
                y={avgValue}
                stroke="#9ca3af"
                strokeDasharray="3 3"
                opacity={0.4}
                label={{
                  value: `Avg: ${avgValue.toLocaleString()}`,
                  position: "right",
                  fill: "#6b7280",
                  fontSize: 12,
                }}
              />

              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
                formatter={(value) => (
                  <span className="text-sm text-gray-700 font-medium">
                    {value}
                  </span>
                )}
              />

              {visibleSeries.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color}
                  strokeWidth={series.strokeWidth}
                  strokeDasharray={series.strokeDasharray || undefined}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                  name={series.name}
                  opacity={series.opacity}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Average
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {avgValue.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Peak Month
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {
                chartData.reduce((max, item) => {
                  const val = (item as any)[
                    timeFilter === "overTime" ? "overTime" : timeFilter
                  ];
                  return val >
                    ((max as any)[
                      timeFilter === "overTime" ? "overTime" : timeFilter
                    ] || 0)
                    ? item
                    : max;
                }).month
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Growth
            </p>
            <p className="text-lg font-semibold text-green-600 mt-1">
              {Math.round(
                ((chartData[chartData.length - 1] as any)[
                  timeFilter === "overTime" ? "overTime" : timeFilter
                ] /
                  (chartData[0] as any)[
                    timeFilter === "overTime" ? "overTime" : timeFilter
                  ] -
                  1) *
                  100
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
