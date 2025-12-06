import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lon: number;
  name: string;
  isDefault: boolean;
}

/**
 * Custom hook to get user's geolocation
 * Falls back to Kumasi, Ghana if geolocation is denied or unavailable
 */
export function useGeolocation(): { 
  location: Location | null; 
  loading: boolean; 
  error: string | null; 
} {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const DEFAULT_LOCATION: Location = {
      lat: 6.69,
      lon: -1.62,
      name: "Kumasi, Ghana (Default)",
      isDefault: true,
    };

    if (!navigator.geolocation) {
      // Geolocation not supported
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Try to get city name from coordinates using reverse geocoding
        // For now, just use coordinates
        setLocation({
          lat: latitude,
          lon: longitude,
          name: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
          isDefault: false,
        });
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setError(err.message);
        // Fallback to default location
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, loading, error };
}
