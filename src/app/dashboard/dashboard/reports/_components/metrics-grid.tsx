"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendIcon } from "./trend-icon";
import { useDashboardStore } from "@/stores/useDashboardStore";

interface MetricCard {
  id: "farmer" | "provider" | "solved" | "escalated";
  label: string;
  value: number;
  change: number;
  isHighlight?: boolean;
}

interface MetricsGridProps {
  activeMetric: string;
  onMetricChange: (
    metric: "farmer" | "provider" | "solved" | "escalated"
  ) => void;
}

export function MetricsGrid({
  activeMetric,
  onMetricChange,
}: MetricsGridProps) {
  // Get data from dashboard store
  const statistics = useDashboardStore((state) => state.statistics);
  const rawDashboardData = useDashboardStore((state) => state.rawDashboardData);
  const isLoading = useDashboardStore((state) => state.isLoading);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Extract values from dashboard data
  const totalFarmers = statistics?.totalFarmers ?? 0;
  const totalProviders = statistics?.totalServiceProviders ?? 0;
  const serviceStats = rawDashboardData?.service_stats;
  const completedRequests = serviceStats?.completed ?? 0;
  const pendingRequests = serviceStats?.pending ?? 0;

  // Parse growth percentages
  const parseGrowth = (growth: string): number => {
    const match = growth.match(/([+-]?\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const farmersGrowth = parseGrowth(statistics?.farmersGrowth ?? "+0%");
  const providersGrowth = parseGrowth(statistics?.providersGrowth ?? "+0%");

  const metrics: MetricCard[] = [
    {
      id: "farmer",
      label: "Farmer Onboarding",
      value: totalFarmers,
      change: farmersGrowth,
      isHighlight: activeMetric === "farmer",
    },
    {
      id: "provider",
      label: "Provider Onboarding",
      value: totalProviders,
      change: providersGrowth,
      isHighlight: activeMetric === "provider",
    },
    {
      id: "solved",
      label: "Issues Solved",
      value: completedRequests,
      change: 0, // Backend doesn't provide historical comparison yet
      isHighlight: activeMetric === "solved",
    },
    {
      id: "escalated",
      label: "Issues Escalated",
      value: pendingRequests,
      change: 0, // Backend doesn't provide historical comparison yet
      isHighlight: activeMetric === "escalated",
    },
  ];

  // Loading skeleton
  if (isLoading && !statistics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <button
          key={metric.id}
          onClick={() => onMetricChange(metric.id)}
          className="text-left transition-all hover:shadow-md focus:outline-none focus:ring-primary rounded-md"
        >
          <Card
            className={`p-5 cursor-pointer transition-all ${metric.isHighlight
                ? "border-2 border-green-600 bg-yellow-50 dark:bg-yellow-900/20"
                : "hover:border-gray-300 dark:hover:border-gray-600"
              }`}
          >
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {metric.label}
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-2xl font-bold text-foreground">
                {metric.value.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span
                  className={
                    metric.change >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {metric.change >= 0 ? "+" : ""}
                  {metric.change.toFixed(2)}%
                </span>
                <TrendIcon isPositive={metric.change >= 0} />
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
