import { create } from "zustand";

interface FilterOption {
  label: string;
  value: string;
}

interface HeaderState {
  title: string;
  activeTab: string;
  filters: Record<string, FilterOption[]>;
  selectedFilters: Record<string, string>;
  // lastAction holds the most recent action-type tab that was clicked (e.g. open-weatherBroadcast-modal)
  lastAction: string | null;
  setTitle: (title: string) => void;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: Record<string, FilterOption[]>) => void;
  setSelectedFilter: (key: string, value: string) => void;
  setAction: (action: string | null) => void;
  resetFilters: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: "",
  activeTab: "",
  filters: {},
  selectedFilters: {},
  lastAction: null,

  setTitle: (title) => set({ title }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setFilters: (filters) => set({ filters }),

  setSelectedFilter: (key, value) =>
    set((state) => ({
      selectedFilters: { ...state.selectedFilters, [key]: value },
    })),

  setAction: (action) => set({ lastAction: action }),

  resetFilters: () => set({ filters: {}, selectedFilters: {} }),
}));
