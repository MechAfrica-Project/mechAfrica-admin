"use client";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useEffect, useState } from "react";
import SearchBar from "./_components/SearchBar";
import FilterButton from "./_components/FilterButton";
import MapCard from "./_components/MapCard";
import StatsGrid from "./_components/StatsGrid";
import ChartCard from "./_components/ChartCard";
import { useMapData } from "./hooks/useMapData";

export default function MapPage() {
  const { setTitle, setFilters, setSelectedFilter } = useHeaderStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  useMapData();

  useEffect(() => {
    setTitle("Map");
    setFilters({
      Services: [
        { label: "All Services", value: "all" },
        { label: "Fertilizer", value: "fertilizer" },
        { label: "Irrigation", value: "irrigation" },
      ],
      Crops: [
        { label: "All Crops", value: "all" },
        { label: "Maize", value: "maize" },
        { label: "Rice", value: "rice" },
        { label: "Cocoa", value: "cocoa" },
      ],
    });
    // Initialize selected filters to "all"
    setSelectedFilter("Services", "all");
    setSelectedFilter("Crops", "all");
  }, [setTitle, setFilters, setSelectedFilter]);

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchBar />
        <FilterButton />
      </div>

      {/* Main Content Grid */}
      <div className={`grid grid-cols-1 gap-6 w-full transition-all duration-300 ${
        isFullscreen ? "lg:grid-cols-1" : "lg:grid-cols-3"
      }`}>
       {/* Left Column - Map */}
        <div className={isFullscreen ? "lg:col-span-1" : "lg:col-span-2"}>
          <MapCard 
            isFullscreen={isFullscreen}
            onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          />
        </div>

        {/* Right Column - Stats and Chart */}
        {!isFullscreen && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
            <StatsGrid />
          </div>

          {/* Chart */}
          <ChartCard />
        </div>
        )}
      </div>
    </div>
  );
}
