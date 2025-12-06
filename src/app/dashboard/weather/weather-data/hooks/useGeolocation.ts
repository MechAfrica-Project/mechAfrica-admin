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
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({
        lat: latitude,
        lon: longitude,
        name: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
        isDefault: false,
      });
      setError(null);
      setLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("Geolocation error:", err.message);
      setError(err.message);
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
    };

    // Get immediate position, then watch for movement for real-time updates
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, loading, error };
}
