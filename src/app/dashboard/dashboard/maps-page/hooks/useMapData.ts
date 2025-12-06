"use client";

import { useEffect, useCallback } from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { useContactsStore } from "@/stores/useContactsStore";
import { generateMapMarkers, MapMarker } from "@/lib/dummyData";

interface MapData {
  farmers: number;
  serviceProviders: number;
  totalAcres: number;
  demandToSupply: string;
  farmersGrowth: string;
  providersGrowth: string;
  acresGrowth: string;
  farmersOverTime: Array<{ month: string; value: number }>;
  markers: MapMarker[];
}

export function useMapData() {
  // Dashboard store for statistics
  const statistics = useDashboardStore((state) => state.statistics);
  const dashboardLoading = useDashboardStore((state) => state.isLoading);
  const dashboardError = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  // Contacts store for user data (can be used for markers in future)
  const fetchFarmers = useContactsStore((state) => state.fetchFarmers);
  const fetchProviders = useContactsStore((state) => state.fetchProviders);
  const contactsLoading = useContactsStore((state) => state.isLoading);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Compute map data from store
  const mapData: MapData = {
    farmers: statistics?.totalFarmers ?? 0,
    serviceProviders: statistics?.totalServiceProviders ?? 0,
    totalAcres: statistics?.totalAcres ?? 0,
    demandToSupply: statistics?.demandToSupply ?? "N/A",
    farmersGrowth: statistics?.farmersGrowth ?? "+0%",
    providersGrowth: statistics?.providersGrowth ?? "+0%",
    acresGrowth: statistics?.acresGrowth ?? "+0%",
    // Farmers over time not yet implemented in backend - use placeholder
    farmersOverTime: [
      { month: "Jan", value: 0 },
      { month: "Feb", value: 0 },
      { month: "Mar", value: 0 },
      { month: "Apr", value: 0 },
      { month: "May", value: 0 },
      { month: "Jun", value: 0 },
      { month: "Jul", value: 0 },
      { month: "Aug", value: 0 },
      { month: "Sep", value: 0 },
      { month: "Oct", value: 0 },
      { month: "Nov", value: 0 },
      { month: "Dec", value: 0 },
    ],
    // Map markers - using dummy data for now as backend doesn't provide coordinates
    // TODO: Update when backend provides geolocation data
    markers: generateMapMarkers(),
  };

  const loading = dashboardLoading || contactsLoading;

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchDashboard(),
      fetchFarmers(1, 100),
      fetchProviders(1, 100),
    ]);
  }, [fetchDashboard, fetchFarmers, fetchProviders]);

  return {
    mapData,
    loading,
    error: dashboardError,
    refreshData,
  };
}
