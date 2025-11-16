"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getMapStatistics } from "@/lib/dummyData";

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
  const stats = getMapStatistics();

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        title="Farmers"
        value={stats.totalFarmers.toLocaleString()}
        change={stats.farmersGrowth}
        trend="up"
      />
      <StatCard
        title="S.Providers"
        value={stats.totalServiceProviders.toLocaleString()}
        change={stats.providersGrowth}
        trend="down"
        isBlue={true}
      />
      <StatCard
        title="Total Acres"
        value={stats.totalAcres.toLocaleString()}
        change={stats.acresGrowth}
        trend="up"
      />
      <StatCard
        title="Demand to Supply"
        value={stats.demandToSupply}
      />
    </div>
  );
}
