import { Card } from "@/components/ui/card";
import { TrendIcon } from "./trend-icon";

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
  const metrics: MetricCard[] = [
    {
      id: "farmer",
      label: "Farmer Onboarding",
      value: 7265,
      change: 11.01,
      isHighlight: activeMetric === "farmer",
    },
    {
      id: "provider",
      label: "Provider Onboarding",
      value: 3671,
      change: -0.03,
      isHighlight: activeMetric === "provider",
    },
    {
      id: "solved",
      label: "Issues Solved",
      value: 156,
      change: 15.03,
      isHighlight: activeMetric === "solved",
    },
    {
      id: "escalated",
      label: "Issues Escalated",
      value: 2318,
      change: 6.08,
      isHighlight: activeMetric === "escalated",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <button
          key={metric.id}
          onClick={() => onMetricChange(metric.id)}
          className="text-left transition-all hover:shadow-md focus:outline-none focus:ring-primary rounded-md"
        >
          <Card
            className={`p-5 cursor-pointer transition-all ${
              metric.isHighlight
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
