"use client";

import { create } from "zustand";
import { api } from "@/lib/api/client";

// ─── Types matching the backend LocationHierarchy response ────────────────────

export interface LocationNode {
  id: string;
  name: string;
}

export interface DistrictNode extends LocationNode {
  communities: LocationNode[];
}

export interface RegionNode extends LocationNode {
  districts: DistrictNode[];
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface LocationState {
  regions: RegionNode[];
  isLoading: boolean;
  error: string | null;
  /** Ensures we only fetch once per session */
  hasFetched: boolean;
  fetchLocations: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  regions: [],
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchLocations: async () => {
    // Prevent redundant fetches
    if (get().hasFetched || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const res = await api.getLocations();
      const data = res.data as { regions?: RegionNode[] };

      set({
        regions: data?.regions ?? [],
        isLoading: false,
        hasFetched: true,
      });
    } catch (err) {
      console.error("Failed to load locations:", err);
      set({
        isLoading: false,
        error: "Failed to load locations from server.",
      });
    }
  },
}));
