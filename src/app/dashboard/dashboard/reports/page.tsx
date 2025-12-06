"use client";

import { useState, useEffect } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { MetricsGrid } from "./_components/metrics-grid";
import { DataView } from "./_components/data-view";


type MetricType = "farmer" | "provider" | "solved" | "escalated";

export default function Dashboard() {
  const { setTitle, setFilters } = useHeaderStore();
  const [activeMetric, setActiveMetric] = useState<MetricType>("farmer");
  const [viewType, setViewType] = useState<"table" | "chart">("table");

  useEffect(() => {
    setTitle("Reports");
    setFilters({});
  }, [setTitle, setFilters]);

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Metrics Grid */}
        <MetricsGrid
          activeMetric={activeMetric}
          onMetricChange={setActiveMetric}
        />

        {/* Data View with Toggle */}
        <DataView
          metric={activeMetric}
          viewType={viewType}
          onViewChange={setViewType}
        />
      </div>
    </main>
  );
}
