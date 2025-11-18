"use client";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState } from "react";
import { MapMarker, Farmer, ServiceProvider } from "@/lib/dummyData";

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
}

const MapComponent = ({ center, zoom, markers, onMarkerClick }: MapProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
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
    }
  }, [ref, map, center, zoom]);

  // Clear existing markers
  useEffect(() => {
    mapMarkers.forEach(marker => marker.setMap(null));
    setMapMarkers([]);
  }, [markers, mapMarkers]);

  // Add new markers
  useEffect(() => {
    if (!map) return;

    const newMarkers: google.maps.Marker[] = [];

    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.type === 'farmer' 
          ? (markerData.data as Farmer).name 
          : (markerData.data as ServiceProvider).name,
        icon: {
          url: markerData.type === 'farmer' 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#00594C" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">F</text>
              </svg>
            `)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">S</text>
              </svg>
            `),
          scaledSize: new google.maps.Size(24, 24),
        },
      });

      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      newMarkers.push(marker);
    });

    setMapMarkers(newMarkers);
  }, [map, markers, onMarkerClick]);

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

export default function GoogleMap({ markers, onMarkerClick }: { markers: MapMarker[], onMarkerClick?: (marker: MapMarker) => void }) {
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
    <Wrapper apiKey={apiKey} render={render}>
      <MapComponent 
        center={{ lat: 7.9465, lng: -1.0232 }} 
        zoom={6} 
        markers={markers}
        onMarkerClick={onMarkerClick}
      />
    </Wrapper>
  );
}
