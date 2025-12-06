import { useState, useEffect, useRef } from "react";

interface Location {
  lat: number;
  lon: number;
  name: string;
  isDefault: boolean;
}

// Default location: Kumasi, Ghana
const DEFAULT_LOCATION: Location = {
  lat: 6.69,
  lon: -1.62,
  name: "Kumasi, Ghana",
  isDefault: true,
};

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

  // Track if we've already completed (success or fallback)
  const completedRef = useRef(false);
  // Track if error has been logged to avoid spam
  const errorLoggedRef = useRef(false);

  useEffect(() => {
    // Don't run again if already completed
    if (completedRef.current) return;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      if (!errorLoggedRef.current) {
        console.info("Geolocation not supported, using default location");
        errorLoggedRef.current = true;
      }
      setLocation(DEFAULT_LOCATION);
      setError("Geolocation not supported");
      setLoading(false);
      completedRef.current = true;
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      // Only process if not already completed
      if (completedRef.current) return;

      const { latitude, longitude } = position.coords;
      setLocation({
        lat: latitude,
        lon: longitude,
        name: `${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? 'E' : 'W'}`,
        isDefault: false,
      });
      setError(null);
      setLoading(false);
      completedRef.current = true;
    };

    const handleError = (err: GeolocationPositionError) => {
      // Only process if not already completed
      if (completedRef.current) return;

      // Log error only once
      if (!errorLoggedRef.current) {
        let errorMessage: string;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "Unable to get location";
        }
        console.info(`Geolocation: ${errorMessage}. Using default location (Kumasi, Ghana)`);
        errorLoggedRef.current = true;
      }

      // Use default location on error
      setLocation(DEFAULT_LOCATION);
      setError(null); // Don't show error to user since we have fallback
      setLoading(false);
      completedRef.current = true;
    };

    // Only try once with getCurrentPosition - don't use watchPosition
    // This avoids repeated error messages and unnecessary battery drain
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false, // Use low accuracy for faster response
      timeout: 10000, // 10 second timeout
      maximumAge: 300000, // Accept cached position up to 5 minutes old
    });

    // Fallback timeout in case geolocation hangs
    const timeoutId = setTimeout(() => {
      if (!completedRef.current) {
        if (!errorLoggedRef.current) {
          console.info("Geolocation timed out, using default location");
          errorLoggedRef.current = true;
        }
        setLocation(DEFAULT_LOCATION);
        setError(null);
        setLoading(false);
        completedRef.current = true;
      }
    }, 12000); // 12 seconds total timeout

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return { location, loading, error };
}
