"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleMap from "@/components/maps/GoogleMap";
import {
  MapMarker,
  generateMapMarkers,
  Farmer,
  ServiceProvider,
} from "@/lib/dummyData";
import { useState } from "react";
import Image from "next/image";
import { images } from "@/lib/images";

interface MapCardProps {
  className?: string;
}

export default function MapCard({ className = "" }: MapCardProps) {
  const [markers] = useState<MapMarker[]>(generateMapMarkers());
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    console.log("Marker clicked:", marker);
  };

  const handleRefresh = () => {
    // In a real app, this would refresh the data from the API
    window.location.reload();
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 sm:p-6 ${className}`}
    >
      {/* Map Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Ghana Map</h3>
          <p className="text-sm text-gray-600">
            {markers.filter((m) => m.type === "farmer").length} Farmers •{" "}
            {markers.filter((m) => m.type === "service_provider").length}{" "}
            Service Providers
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="bg-[#00594C] hover:bg-[#00594cec] cursor-pointer"
          onClick={handleRefresh}
        >
          <Image src={images.maximize} alt="max" />
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative bg-gray-50 rounded-lg h-96 sm:h-[500px] overflow-hidden">
        <GoogleMap markers={markers} onMarkerClick={handleMarkerClick} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#00594C] rounded-full"></div>
          <span className="text-gray-600">Farmers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Service Providers</span>
        </div>
      </div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">
            {selectedMarker.type === "farmer" ? "Farmer" : "Service Provider"}:{" "}
            {(selectedMarker.data as Farmer | ServiceProvider).name}
          </h4>
          <p className="text-sm text-gray-600">
            Location:{" "}
            {(selectedMarker.data as Farmer | ServiceProvider).location.address}
          </p>
          {selectedMarker.type === "farmer" && (
            <p className="text-sm text-gray-600">
              Crops: {(selectedMarker.data as Farmer).crops.join(", ")} •{" "}
              {(selectedMarker.data as Farmer).acres} acres
            </p>
          )}
          {selectedMarker.type === "service_provider" && (
            <p className="text-sm text-gray-600">
              Services:{" "}
              {(selectedMarker.data as ServiceProvider).services.join(", ")} •
              Rating: {(selectedMarker.data as ServiceProvider).rating}/5
            </p>
          )}
        </div>
      )}
    </div>
  );
}
