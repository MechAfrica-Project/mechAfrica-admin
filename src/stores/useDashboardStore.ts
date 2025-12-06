import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  FrontendStatistics,
  BackendDashboardData,
  BackendRecentActivity,
  BackendTopRegion,
} from "@/lib/api";

// =============================================================================
// Dashboard Store Types
// =============================================================================

export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalServiceRequests: number;
  pendingVerifications: number;
  systemHealth: string;
  revenue: number;
}

export interface DashboardState {
  // State
  statistics: FrontendStatistics | null;
  overview: DashboardOverview | null;
  recentActivity: BackendRecentActivity[];
  topRegions: BackendTopRegion[];
  rawDashboardData: BackendDashboardData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// Dashboard Store
// =============================================================================

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  statistics: null,
  overview: null,
  recentActivity: [],
  topRegions: [],
  rawDashboardData: null,
  isLoading: false,
  error: null,

  // Fetch full dashboard data from API
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getDashboard();

      if (response.success && response.data) {
        const data = response.data;

        // Transform overview
        const overview: DashboardOverview = {
          totalUsers: data.overview?.total_users || 0,
          activeUsers: data.overview?.active_users || 0,
          totalServiceRequests: data.overview?.total_service_requests || 0,
          pendingVerifications: data.overview?.pending_verifications || 0,
          systemHealth: data.overview?.system_health || "unknown",
          revenue: data.overview?.revenue || 0,
        };

        // Calculate statistics
        const userStats = data.user_stats;
        const totalFarmers = userStats?.farmers?.total || 0;
        const totalServiceProviders = userStats?.service_providers?.total || 0;

        const statistics: FrontendStatistics = {
          totalFarmers,
          totalServiceProviders,
          totalAcres: 0, // Not tracked in backend
          demandToSupply:
            totalServiceProviders > 0
              ? `${(totalFarmers / totalServiceProviders).toFixed(1)} : 1`
              : "N/A",
          farmersGrowth: "+0%", // Not tracked in backend yet
          providersGrowth: "+0%",
          acresGrowth: "+0%",
        };

        set({
          rawDashboardData: data,
          overview,
          statistics,
          recentActivity: data.recent_activity || [],
          topRegions: data.top_regions || [],
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch dashboard data",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch dashboard data";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Fetch only statistics (lighter endpoint)
  fetchStatistics: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getStatistics();

      if (response.success && response.data) {
        set({
          statistics: response.data,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch statistics",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch statistics";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// =============================================================================
// Selector Hooks
// =============================================================================

export const useStatistics = () =>
  useDashboardStore((state) => state.statistics);
export const useDashboardOverview = () =>
  useDashboardStore((state) => state.overview);
export const useRecentActivity = () =>
  useDashboardStore((state) => state.recentActivity);
export const useTopRegions = () =>
  useDashboardStore((state) => state.topRegions);
export const useDashboardLoading = () =>
  useDashboardStore((state) => state.isLoading);
export const useDashboardError = () =>
  useDashboardStore((state) => state.error);

export default useDashboardStore;
