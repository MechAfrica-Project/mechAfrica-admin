"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStore } from "@/stores/useDashboardStore";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  isBlue?: boolean;
}

function StatCard({ title, value, change, trend, isBlue = false }: StatCardProps) {
  return (
    <div className={`rounded-lg p-4 ${isBlue ? 'bg-blue-600' : 'bg-[#00594C]'} text-white`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium opacity-90">{title}</h4>
        {trend && (
          <div className="flex items-center">
            {trend === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {change && (
        <div className={`text-sm ${trend === "up" ? "text-green-200" : "text-red-200"}`}>
          {change}
        </div>
      )}
    </div>
  );
}

export default function StatsGrid() {
  const statistics = useDashboardStore((state) => state.statistics);
  const isLoading = useDashboardStore((state) => state.isLoading);

  // Show loading skeleton if loading and no data
  if (isLoading && !statistics) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg p-4 bg-gray-200 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  // Get trend direction from change string
  const getTrend = (change: string): "up" | "down" => {
    return change.startsWith("+") ? "up" : "down";
  };

  const totalFarmers = statistics?.totalFarmers ?? 0;
  const totalServiceProviders = statistics?.totalServiceProviders ?? 0;
  const totalAcres = statistics?.totalAcres ?? 0;
  const demandToSupply = statistics?.demandToSupply ?? "N/A";
  const farmersGrowth = statistics?.farmersGrowth ?? "+0%";
  const providersGrowth = statistics?.providersGrowth ?? "+0%";
  const acresGrowth = statistics?.acresGrowth ?? "+0%";

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        title="Farmers"
        value={totalFarmers.toLocaleString()}
        change={farmersGrowth}
        trend={getTrend(farmersGrowth)}
      />
      <StatCard
        title="S.Providers"
        value={totalServiceProviders.toLocaleString()}
        change={providersGrowth}
        trend={getTrend(providersGrowth)}
        isBlue={true}
      />
      <StatCard
        title="Total Acres"
        value={totalAcres.toLocaleString()}
        change={acresGrowth}
        trend={getTrend(acresGrowth)}
      />
      <StatCard
        title="Demand to Supply"
        value={demandToSupply}
      />
    </div>
  );
}
