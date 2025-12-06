import { create } from "zustand";
import { api } from "@/lib/api";
import type { FrontendFinancesResponse, FrontendFinanceSummaryItem } from "@/lib/api";

// =============================================================================
// Finances Store Types
// =============================================================================

export type DataKey = "thisYear" | "lastYear" | "overTime";
export type PeriodFilter = "day" | "week" | "month" | "year";

export interface ChartDataPoint {
  month: string;
  thisYear: number;
  lastYear: number;
  overTime: number;
}

export interface FinancesSummary {
  revenue: FrontendFinanceSummaryItem;
  withdrawals: FrontendFinanceSummaryItem;
  payments: FrontendFinanceSummaryItem;
  commission: FrontendFinanceSummaryItem;
}

export interface FinancesState {
  // State
  summary: FinancesSummary | null;
  chartData: ChartDataPoint[];
  timeFilter: DataKey;
  periodFilter: PeriodFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFinances: (period?: PeriodFilter) => Promise<void>;
  setTimeFilter: (filter: DataKey) => void;
  setPeriodFilter: (period: PeriodFilter) => void;
  clearError: () => void;
}

// =============================================================================
// Default/Fallback Chart Data
// =============================================================================

const defaultChartData: ChartDataPoint[] = [
  { month: "Jan", thisYear: 9000, lastYear: 7000, overTime: 8000 },
  { month: "Feb", thisYear: 12000, lastYear: 11000, overTime: 11500 },
  { month: "Mar", thisYear: 14000, lastYear: 12000, overTime: 13000 },
  { month: "Apr", thisYear: 26000, lastYear: 15000, overTime: 20500 },
  { month: "May", thisYear: 30000, lastYear: 20000, overTime: 25000 },
  { month: "Jun", thisYear: 22000, lastYear: 16000, overTime: 19000 },
  { month: "Jul", thisYear: 24000, lastYear: 28000, overTime: 26000 },
];

// =============================================================================
// Finances Store
// =============================================================================

export const useFinancesStore = create<FinancesState>((set, get) => ({
  // Initial state
  summary: null,
  chartData: defaultChartData,
  timeFilter: "thisYear",
  periodFilter: "month",
  isLoading: false,
  error: null,

  // Fetch finances from API
  fetchFinances: async (period?: PeriodFilter) => {
    const currentPeriod = period || get().periodFilter;
    set({ isLoading: true, error: null });

    try {
      const response: FrontendFinancesResponse = await api.getFinances(currentPeriod);

      // The API response is already transformed by the client
      set({
        summary: response.summary,
        // Use response chart data if available, otherwise use default
        chartData: response.chart.length > 0 ? response.chart : defaultChartData,
        periodFilter: currentPeriod,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch finances data";

      // On error, still provide default data for display
      set({
        isLoading: false,
        error: errorMessage,
        // Provide fallback summary if no data exists
        summary: get().summary || {
          revenue: { value: "¢0", delta: "+0%" },
          withdrawals: { value: "¢0", delta: "+0%" },
          payments: { value: "¢0", delta: "+0%" },
          commission: { value: "¢0", delta: "+0%" },
        },
      });
    }
  },

  // Set time filter for chart display
  setTimeFilter: (filter: DataKey) => {
    set({ timeFilter: filter });
  },

  // Set period filter and refetch
  setPeriodFilter: (period: PeriodFilter) => {
    set({ periodFilter: period });
    // Optionally trigger a refetch when period changes
    get().fetchFinances(period);
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// =============================================================================
// Selector Hooks
// =============================================================================

export const useFinancesSummary = () =>
  useFinancesStore((state) => state.summary);
export const useFinancesChartData = () =>
  useFinancesStore((state) => state.chartData);
export const useTimeFilter = () =>
  useFinancesStore((state) => state.timeFilter);
export const usePeriodFilter = () =>
  useFinancesStore((state) => state.periodFilter);
export const useFinancesLoading = () =>
  useFinancesStore((state) => state.isLoading);
export const useFinancesError = () =>
  useFinancesStore((state) => state.error);

export default useFinancesStore;
