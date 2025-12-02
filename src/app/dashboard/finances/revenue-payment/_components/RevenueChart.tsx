"use client";

// React is used in JSX; no named React imports required here.
import { Button } from "@/components/ui/button";
import { useFinancesData, ChartPoint } from "./useFinancesData";
import {
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// chart data will be provided by the hook; fallback data kept below
const fallbackChartData = [
  { month: "Jan", thisYear: 9000, lastYear: 7000, overTime: 8000 },
  { month: "Feb", thisYear: 12000, lastYear: 11000, overTime: 11500 },
  { month: "Mar", thisYear: 14000, lastYear: 12000, overTime: 13000 },
  { month: "Apr", thisYear: 26000, lastYear: 15000, overTime: 20500 },
  { month: "May", thisYear: 30000, lastYear: 20000, overTime: 25000 },
  { month: "Jun", thisYear: 22000, lastYear: 16000, overTime: 19000 },
  { month: "Jul", thisYear: 24000, lastYear: 28000, overTime: 26000 },
];

const COLORS = {
  thisYear: "#111827",
  lastYear: "#94a3b8",
  overTime: "#60a5fa",
};

type TooltipEntry = { name?: string; value?: number; color?: string };

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) => {
  if (active && Array.isArray(payload) && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {p.name}: <span className="font-semibold">{(p.value ?? 0).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

import { useFinancesStore } from "@/stores/useFinancesStore";

export function RevenueChart({ title = "Revenue" }: { title?: string }) {
  const timeFilter = useFinancesStore((s) => s.timeFilter);
  const setTimeFilter = useFinancesStore((s) => s.setTimeFilter);
  const { data } = useFinancesData();

  const chartData = data?.chart ?? fallbackChartData;

  const getVisible = () => {
    switch (timeFilter) {
      case "overTime":
        return [
          { key: "overTime", name: "Over time", color: COLORS.overTime, strokeWidth: 3 },
        ];
      case "thisYear":
        return [
          { key: "thisYear", name: "This year", color: COLORS.thisYear, strokeWidth: 3 },
          { key: "lastYear", name: "Last year", color: COLORS.lastYear, strokeWidth: 2, strokeDasharray: "6 6" },
        ];
      case "lastYear":
        return [
          { key: "lastYear", name: "Last year", color: COLORS.lastYear, strokeWidth: 3 },
        ];
      default:
        return [];
    }
  };

  const visible = getVisible();

  type DataKey = "thisYear" | "lastYear" | "overTime";

  const avg = Math.round(
    chartData.reduce((sum, item) => {
      const key: DataKey = timeFilter === "overTime" ? "overTime" : (timeFilter as DataKey);
      const val = (item as ChartPoint)[key] ?? 0;
      return sum + Number(val);
    }, 0) / chartData.length
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Overtime</p>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[{ id: "overTime", label: "Over time" }, { id: "thisYear", label: "This year" }, { id: "lastYear", label: "Last year" }].map((f) => (
            <Button
              key={f.id}
              onClick={() => setTimeFilter(f.id as DataKey)}
              variant={timeFilter === f.id ? "default" : "ghost"}
              size="sm"
              className={`text-xs font-medium ${timeFilter === f.id ? "bg-gray-900 text-white" : "text-gray-600"}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-96 w-full bg-white rounded-lg border border-gray-100 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.18} />
                <stop offset="80%" stopColor="#111827" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} vertical={false} />

            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: "#6b7280" }} />
            <YAxis stroke="#9ca3af" tick={{ fill: "#6b7280" }} />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#d1d5db", opacity: 0.3 }} />

            <ReferenceLine y={avg} stroke="#9ca3af" strokeDasharray="3 3" opacity={0.4} label={{ value: `Avg: ${avg.toLocaleString()}`, position: "right", fill: "#6b7280", fontSize: 12 }} />

            <Legend wrapperStyle={{ paddingTop: 20 }} iconType="line" formatter={(v: string | number | undefined) => <span className="text-sm text-gray-700 font-medium">{String(v)}</span>} />

            {/* area for the primary series (thisYear) */}
            <Area dataKey="thisYear" stroke="none" fill="url(#areaGradient)" />

            {visible.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeDasharray={s.strokeDasharray}
                dot={false}
                isAnimationActive
                name={s.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Average</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{avg.toLocaleString()}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Peak Month</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {chartData.reduce((max, item) => {
              const key: DataKey = timeFilter === "overTime" ? "overTime" : (timeFilter as DataKey);
              const val = Number((item as ChartPoint)[key] ?? 0);
              const maxVal = Number((max as ChartPoint)[key] ?? 0);
              return val > maxVal ? item : max;
            }).month}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Growth</p>
          <p className="text-lg font-semibold text-green-600 mt-1">
            {Math.round(
              (((chartData[chartData.length - 1] as ChartPoint)[timeFilter === "overTime" ? "overTime" : (timeFilter as DataKey)] as number) || 0) /
                (((chartData[0] as ChartPoint)[timeFilter === "overTime" ? "overTime" : (timeFilter as DataKey)] as number) || 1) -
                1) * 100
            }
            %
          </p>
        </div>
      </div>
    </div>
  );
}
