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
  setTitle: (title: string) => void;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: Record<string, FilterOption[]>) => void;
  setSelectedFilter: (key: string, value: string) => void;
  resetFilters: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: "",
  activeTab: "",
  filters: {},
  selectedFilters: {},
  setTitle: (title) => set({ title }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (filters) => set({ filters }),
  setSelectedFilter: (key, value) =>
    set((state) => ({
      selectedFilters: { ...state.selectedFilters, [key]: value },
    })),
  resetFilters: () => set({ filters: {}, selectedFilters: {} }),
}));
