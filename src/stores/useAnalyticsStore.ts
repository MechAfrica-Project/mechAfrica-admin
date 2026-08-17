import { create } from 'zustand';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';

interface AnalyticsFilters {
  role: string;
  gender: string;
  region_id: string;
  missing_data: string;
}

interface AnalyticsData {
  total_users: number;
  role_distribution: { name: string; value: number }[];
  gender_distribution: { name: string; value: number }[];
}

interface AnalyticsState {
  filters: AnalyticsFilters;
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  
  setFilter: (key: keyof AnalyticsFilters, value: string) => void;
  resetFilters: () => void;
  fetchAnalytics: () => Promise<void>;
}

const initialFilters: AnalyticsFilters = {
  role: 'all',
  gender: 'all',
  region_id: 'all',
  missing_data: '',
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  filters: initialFilters,
  data: null,
  isLoading: false,
  error: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().fetchAnalytics();
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchAnalytics();
  },

  fetchAnalytics: async () => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();
      
      const data = await api.getAnalytics({
        role: filters.role === 'all' ? undefined : filters.role,
        gender: filters.gender === 'all' ? undefined : filters.gender,
        region_id: filters.region_id === 'all' ? undefined : filters.region_id,
        missing_data: filters.missing_data || undefined,
      });

      set({ data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      set({ error: error.message || 'Failed to fetch analytics', isLoading: false });
      toast.error('Failed to load analytics data');
    }
  },
}));
