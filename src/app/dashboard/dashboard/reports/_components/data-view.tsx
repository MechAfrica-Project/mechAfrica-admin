"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Grid3x3 } from "lucide-react";
import { FarmersTable } from "./farmers-table";
import { OnboardingChart } from "./onboarding-chart";

interface DataViewProps {
  metric: string;
  viewType: "table" | "chart";
  onViewChange: (view: "table" | "chart") => void;
}

export function DataView({ metric, viewType, onViewChange }: DataViewProps) {
  const getTitle = () => {
    const titles: Record<string, string> = {
      farmer: "Farmers Onboarding",
      provider: "Providers Onboarding",
      solved: "Issues Solved",
      escalated: "Issues Escalated",
    };
    return titles[metric] || "Onboarding";
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {getTitle()}
          </h2>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewChange("chart")}
            variant={viewType === "chart" ? "default" : "outline"}
            size="sm"
            className="w-10 h-10 p-0"
            title="Chart view"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onViewChange("table")}
            variant={viewType === "table" ? "default" : "outline"}
            size="sm"
            className="w-10 h-10 p-0"
            title="Table view"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewType === "table" ? (
        <FarmersTable metric={metric} />
      ) : (
        <OnboardingChart metric={metric} />
      )}
    </div>
  );
}
