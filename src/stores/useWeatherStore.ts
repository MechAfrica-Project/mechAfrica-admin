import { create } from "zustand";
import type { WeatherData } from "@/app/dashboard/weather/weather-data/types/weather";

export interface LocationData {
  lat: number;
  lon: number;
  name: string;
  isDefault: boolean;
}

interface WeatherState {
  data: WeatherData | null;
  error: string | null;
  isLoading: boolean;
  location: LocationData | null;
  currentTime: Date;
  setFromResponse: (payload: unknown) => void;
  setLocation: (location: LocationData | null) => void;
  setCurrentTime: (time: Date) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  data: null,
  error: null,
  isLoading: true,
  location: null,
  currentTime: new Date(),
  setFromResponse: (payload: unknown) => {
    // Handle API error envelopes
    if (typeof payload === "object" && payload !== null && "error" in payload) {
      const errValue = (payload as { error?: unknown }).error;
      set({
        error: String(errValue ?? "Failed to load weather"),
        data: null,
        isLoading: false,
      });
      return;
    }

    const data = payload as Partial<WeatherData> | null;

    if (
      !data ||
      !data.current ||
      !Array.isArray(data.daily) ||
      !Array.isArray(data.hourly)
    ) {
      set({
        error:
          "Unexpected weather data. Check your OPENWEATHER_API_KEY and API response.",
        data: null,
        isLoading: false,
      });
      return;
    }

    set({
      data: data as WeatherData,
      error: null,
      isLoading: false,
    });
  },
  setLocation: (location: LocationData | null) => {
    set({ location });
  },
  setCurrentTime: (time: Date) => {
    set({ currentTime: time });
  },
}));




