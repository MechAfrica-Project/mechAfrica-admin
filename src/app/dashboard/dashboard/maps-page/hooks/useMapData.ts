"use client";
import { useState } from "react";
import { getMapStatistics, getFarmersOverTime, generateMapMarkers, MapMarker } from "@/lib/dummyData";

interface MapData {
  farmers: number;
  serviceProviders: number;
  totalAcres: number;
  demandToSupply: string;
  farmersOverTime: Array<{ month: string; value: number }>;
  markers: MapMarker[];
}

export function useMapData() {
  const [mapData, setMapData] = useState<MapData>(() => {
    const stats = getMapStatistics();
    return {
      farmers: stats.totalFarmers,
      serviceProviders: stats.totalServiceProviders,
      totalAcres: stats.totalAcres,
      demandToSupply: stats.demandToSupply,
      farmersOverTime: getFarmersOverTime(),
      markers: generateMapMarkers(),
    };
  });

  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const stats = getMapStatistics();
      setMapData(prev => ({
        ...prev,
        farmers: stats.totalFarmers,
        serviceProviders: stats.totalServiceProviders,
        totalAcres: stats.totalAcres,
        demandToSupply: stats.demandToSupply,
        markers: generateMapMarkers(),
      }));
      setLoading(false);
    }, 1000);
  };

  return {
    mapData,
    loading,
    refreshData,
  };
}
