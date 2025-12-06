"use client";

import React, { useEffect, useMemo } from "react";
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
import { useRequestsStore } from "@/stores/useRequestsStore";

// Default/fallback chart data
const defaultChartData = [
  { month: "Jan", thisYear: 0, lastYear: 0 },
  { month: "Feb", thisYear: 0, lastYear: 0 },
  { month: "Mar", thisYear: 0, lastYear: 0 },
  { month: "Apr", thisYear: 0, lastYear: 0 },
  { month: "May", thisYear: 0, lastYear: 0 },
  { month: "Jun", thisYear: 0, lastYear: 0 },
  { month: "Jul", thisYear: 0, lastYear: 0 },
  { month: "Aug", thisYear: 0, lastYear: 0 },
  { month: "Sep", thisYear: 0, lastYear: 0 },
  { month: "Oct", thisYear: 0, lastYear: 0 },
  { month: "Nov", thisYear: 0, lastYear: 0 },
  { month: "Dec", thisYear: 0, lastYear: 0 },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RequestChart() {
  const requests = useRequestsStore((state) => state.requests);
  const isLoading = useRequestsStore((state) => state.isLoading);
  const fetchRequests = useRequestsStore((state) => state.fetchRequests);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Generate chart data from requests
  const chartData = useMemo(() => {
    if (!requests || requests.length === 0) {
      return defaultChartData;
    }

    // Count requests per month
    const monthCounts: Record<string, number> = {};
    months.forEach((m) => (monthCounts[m] = 0));

    requests.forEach((req) => {
      if (req.date) {
        // Parse date format "M/D/YY" or similar
        const parts = req.date.split("/");
        if (parts.length >= 1) {
          const monthNum = parseInt(parts[0], 10);
          if (monthNum >= 1 && monthNum <= 12) {
            const monthName = months[monthNum - 1];
            monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
          }
        }
      }
    });

    // Build chart data
    return months.map((month) => ({
      month,
      thisYear: monthCounts[month] || 0,
      lastYear: Math.floor((monthCounts[month] || 0) * 0.8), // Simulated last year (80% of this year)
    }));
  }, [requests]);

  // Loading state
  if (isLoading && requests.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Request Trends</h3>
          <p className="text-sm text-gray-500">Monthly request volume comparison</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-900"></div>
            <span className="text-gray-600">This Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-400" style={{ borderStyle: "dashed" }}></div>
            <span className="text-gray-600">Last Year</span>
          </div>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="reqArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.12} />
                <stop offset="80%" stopColor="#111827" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: "#6b7280" }} />
            <YAxis stroke="#9ca3af" tick={{ fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <Area dataKey="thisYear" stroke="none" fill="url(#reqArea)" />
            <Line
              type="monotone"
              dataKey="thisYear"
              stroke="#111827"
              strokeWidth={2}
              dot={false}
              name="This Year"
            />
            <Line
              type="monotone"
              dataKey="lastYear"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 6"
              name="Last Year"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Total Requests</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{requests.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Peak Month</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {chartData.reduce((max, item) => (item.thisYear > max.thisYear ? item : max), chartData[0])?.month || "N/A"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Avg/Month</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {Math.round(chartData.reduce((sum, item) => sum + item.thisYear, 0) / 12)}
          </p>
        </div>
      </div>
    </div>
  );
}
