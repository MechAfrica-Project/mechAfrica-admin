"use client";

import React, { useEffect } from "react";
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
import { useDashboardStore } from "@/stores/useDashboardStore";

export default function RequestChart() {
  const trendsData = useDashboardStore((state) => state.trends);
  const isTrendsLoading = useDashboardStore((state) => state.isTrendsLoading);
  const fetchTrends = useDashboardStore((state) => state.fetchTrends);

  // Fetch trends on mount
  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // Loading state
  if (isTrendsLoading && !trendsData) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center space-y-4">
          <div className="flex space-x-2 justify-center">
            <div className="h-2 w-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="h-2 w-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="h-2 w-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Synthesizing trends...</p>
        </div>
      </div>
    );
  }

  // Handle empty state gracefully
  const chartData = trendsData?.trends || [];
  const summary = trendsData?.summary || {
    ytd_requests: 0,
    peak_month: "N/A",
    avg_per_month: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Request Trends</h3>
          <p className="text-sm text-gray-500 mt-1">Monthly request volume and algorithm forecast</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-gray-900 rounded-full shadow-sm"></div>
            <span className="text-gray-600 uppercase tracking-wider">This Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-400 rounded-full" style={{ borderStyle: "dashed" }}></div>
            <span className="text-gray-600 uppercase tracking-wider">Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-400 rounded-full" style={{ borderStyle: "dashed" }}></div>
            <span className="text-gray-600 uppercase tracking-wider">Last Year</span>
          </div>
        </div>
      </div>

      <div className="h-96 w-full -ml-4 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reqArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#111827" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#d1d5db" 
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#d1d5db" 
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }} 
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
                padding: "12px 16px",
                fontFamily: "inherit",
              }}
              itemStyle={{ fontSize: "13px", fontWeight: 500, padding: "2px 0" }}
              labelStyle={{ color: "#6b7280", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area dataKey="this_year" stroke="none" fill="url(#reqArea)" />
            <Line
              type="monotone"
              dataKey="this_year"
              stroke="#111827"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#111827" }}
              name="This Year"
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              name="Forecast"
              animationDuration={1500}
              animationBegin={500}
            />
            <Line
              type="monotone"
              dataKey="last_year"
              stroke="#93c5fd"
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 6"
              name="Last Year"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
        <div className="text-center sm:text-left pl-0 sm:pl-4">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">YTD Requests</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
            {summary.ytd_requests.toLocaleString()}
          </p>
        </div>
        <div className="text-center border-l border-r border-gray-100">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">Peak Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
            {summary.peak_month}
          </p>
        </div>
        <div className="text-center sm:text-right pr-0 sm:pr-4">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">Avg / Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
            {summary.avg_per_month.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
