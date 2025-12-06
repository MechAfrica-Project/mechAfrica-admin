"use client";

import { useEffect } from "react";
import { useFinancesStore } from "@/stores/useFinancesStore";

export type ChartPoint = {
  month: string;
  thisYear: number;
  lastYear: number;
  overTime: number;
};

export function useFinancesData() {
  const summary = useFinancesStore((state) => state.summary);
  const chartData = useFinancesStore((state) => state.chartData);
  const isLoading = useFinancesStore((state) => state.isLoading);
  const error = useFinancesStore((state) => state.error);
  const fetchFinances = useFinancesStore((state) => state.fetchFinances);

  // Fetch finances on mount
  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  // Transform to expected format
  const data = summary
    ? {
      summary,
      chart: chartData,
    }
    : null;

  return {
    data,
    loading: isLoading,
    error,
    refetch: fetchFinances,
  };
}
