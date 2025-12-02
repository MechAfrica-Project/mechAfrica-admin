import { create } from "zustand";

type DataKey = "thisYear" | "lastYear" | "overTime";

interface FinancesState {
  timeFilter: DataKey;
  setTimeFilter: (t: DataKey) => void;
}

export const useFinancesStore = create<FinancesState>((set) => ({
  timeFilter: "thisYear",
  setTimeFilter: (t: DataKey) => set({ timeFilter: t }),
}));

export type { DataKey };
