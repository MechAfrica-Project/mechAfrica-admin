import { create } from "zustand";
import { api } from "@/lib/api";
import type { FrontendContact, FrontendPagination } from "@/lib/api";

// =============================================================================
// Contacts Store Types
// =============================================================================

export type ContactType = "Farmer" | "Provider" | "Agent";

export type Contact = FrontendContact;

export interface ContactsState {
  // State
  farmers: Contact[];
  providers: Contact[];
  agents: Contact[];
  farmersPagination: FrontendPagination | null;
  providersPagination: FrontendPagination | null;
  agentsPagination: FrontendPagination | null;
  isLoading: boolean;
  error: string | null;
  currentContactType: ContactType;

  // Actions
  fetchFarmers: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchProviders: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchAgents: (page?: number, limit?: number, search?: string) => Promise<void>;
  setCurrentContactType: (type: ContactType) => void;
  clearError: () => void;

  // Getters
  getContactsByType: (type: ContactType) => Contact[];
  getPaginationByType: (type: ContactType) => FrontendPagination | null;
}

// =============================================================================
// Contacts Store
// =============================================================================

export const useContactsStore = create<ContactsState>((set, get) => ({
  // Initial state
  farmers: [],
  providers: [],
  agents: [],
  farmersPagination: null,
  providersPagination: null,
  agentsPagination: null,
  isLoading: false,
  error: null,
  currentContactType: "Farmer",

  // Fetch farmers from API
  fetchFarmers: async (page = 1, limit = 20, search?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getFarmers(page, limit, search);

      if (response.success) {
        set({
          farmers: response.data,
          farmersPagination: response.pagination,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch farmers",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch farmers";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Fetch providers from API
  fetchProviders: async (page = 1, limit = 20, search?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getServiceProviders(page, limit, search);

      if (response.success) {
        set({
          providers: response.data,
          providersPagination: response.pagination,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch service providers",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch service providers";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Fetch agents from API
  fetchAgents: async (page = 1, limit = 20, search?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getAgents(page, limit, search);

      if (response.success) {
        set({
          agents: response.data,
          agentsPagination: response.pagination,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch agents",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch agents";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Set current contact type
  setCurrentContactType: (type: ContactType) => {
    set({ currentContactType: type });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Get contacts by type
  getContactsByType: (type: ContactType): Contact[] => {
    const state = get();
    switch (type) {
      case "Farmer":
        return state.farmers;
      case "Provider":
        return state.providers;
      case "Agent":
        return state.agents;
      default:
        return [];
    }
  },

  // Get pagination by type
  getPaginationByType: (type: ContactType): FrontendPagination | null => {
    const state = get();
    switch (type) {
      case "Farmer":
        return state.farmersPagination;
      case "Provider":
        return state.providersPagination;
      case "Agent":
        return state.agentsPagination;
      default:
        return null;
    }
  },
}));

// =============================================================================
// Selector Hooks
// =============================================================================

export const useFarmers = () => useContactsStore((state) => state.farmers);
export const useProviders = () => useContactsStore((state) => state.providers);
export const useAgents = () => useContactsStore((state) => state.agents);
export const useContactsLoading = () =>
  useContactsStore((state) => state.isLoading);
export const useContactsError = () => useContactsStore((state) => state.error);
export const useCurrentContactType = () =>
  useContactsStore((state) => state.currentContactType);

// Pagination selectors
export const useFarmersPagination = () =>
  useContactsStore((state) => state.farmersPagination);
export const useProvidersPagination = () =>
  useContactsStore((state) => state.providersPagination);
export const useAgentsPagination = () =>
  useContactsStore((state) => state.agentsPagination);

export default useContactsStore;
