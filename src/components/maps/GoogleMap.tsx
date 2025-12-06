"use client";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapMarker, Farmer, ServiceProvider } from "@/lib/dummyData";

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
}

const MapComponent = ({ center, zoom, markers, onMarkerClick }: MapProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Use ref to track markers to avoid infinite loops
  const mapMarkersRef = useRef<(google.maps.Marker | google.maps.marker.AdvancedMarkerElement)[]>([]);

  // Initialize map
  useEffect(() => {
    if (ref.current && !map) {
      try {
        const g = (window as unknown as { google?: typeof google }).google;
        if (!g || !g.maps || !g.maps.Map) {
          throw new Error("Google Maps API not available");
        }
        const newMap = new g.maps.Map(ref.current, {
          center,
          zoom,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });
        setMap(newMap);
      } catch (err) {
        console.error("Failed to initialize Google Map:", err);
        setMapError(String(err ?? "Failed to initialize map"));
      }
    }
  }, [ref, map, center, zoom]);

  // Clear existing markers helper function
  const clearMarkers = useCallback(() => {
    mapMarkersRef.current.forEach((marker) => {
      try {
        if ("setMap" in marker && typeof (marker as google.maps.Marker).setMap === "function") {
          (marker as google.maps.Marker).setMap(null);
        } else if ("map" in marker) {
          (marker as google.maps.marker.AdvancedMarkerElement).map = null;
        }
      } catch {
        // ignore cleanup errors
      }
    });
    mapMarkersRef.current = [];
  }, []);

  // Add markers when map or markers change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers first
    clearMarkers();

    const g = (window as unknown as { google?: typeof google }).google;
    const newMarkers: (google.maps.Marker | google.maps.marker.AdvancedMarkerElement)[] = [];

    markers.forEach((markerData) => {
      try {
        // Build SVG content for the marker
        const svgString = markerData.type === "farmer"
          ? `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#00594C" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">F</text>
            </svg>`
          : `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">S</text>
            </svg>`;

        let marker: google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null = null;

        if (g && g.maps && g.maps.marker && typeof g.maps.marker.AdvancedMarkerElement === "function") {
          const content = document.createElement("div");
          content.innerHTML = svgString;
          marker = new g.maps.marker.AdvancedMarkerElement({
            position: markerData.position,
            map: map as google.maps.Map,
            title: markerData.type === "farmer" ? (markerData.data as Farmer).name : (markerData.data as ServiceProvider).name,
            content,
          });
        } else if (g && g.maps && typeof g.maps.Marker === "function") {
          marker = new g.maps.Marker({
            position: markerData.position,
            map: map as google.maps.Map,
            title: markerData.type === "farmer" ? (markerData.data as Farmer).name : (markerData.data as ServiceProvider).name,
          });
        }

        if (marker) {
          try {
            if ("addListener" in marker && typeof (marker as google.maps.Marker).addListener === "function") {
              (marker as google.maps.Marker).addListener("click", () => onMarkerClick?.(markerData));
            } else if (
              "addEventListener" in marker &&
              typeof (marker as unknown as { addEventListener?: (evt: string, cb: () => void) => void }).addEventListener === "function"
            ) {
              (marker as unknown as { addEventListener?: (evt: string, cb: () => void) => void }).addEventListener?.(
                "click",
                () => onMarkerClick?.(markerData)
              );
            }
          } catch {
            // ignore attach errors
          }

          newMarkers.push(marker);
        }
      } catch (err) {
        console.warn("Failed to create marker", err);
      }
    });

    mapMarkersRef.current = newMarkers;

    // Cleanup on unmount or when dependencies change
    return () => {
      clearMarkers();
    };
  }, [map, markers, onMarkerClick, clearMarkers]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Map failed to load</p>
          <p className="text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return <div ref={ref} className="w-full h-full rounded-lg" />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00594C] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium mb-2">Failed to load map</p>
            <p className="text-sm">Please check your internet connection</p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return <MapComponent center={{ lat: 7.9465, lng: -1.0232 }} zoom={6} markers={[]} />;
  }
};

export default function GoogleMap({ markers, onMarkerClick }: { markers: MapMarker[]; onMarkerClick?: (marker: MapMarker) => void }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium mb-2">Google Maps API Key not found</p>
          <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={["marker"]}>
      <MapComponent
        center={{ lat: 7.9465, lng: -1.0232 }}
        zoom={6}
        markers={markers}
        onMarkerClick={onMarkerClick}
      />
    </Wrapper>
  );
}
