import { create } from "zustand";
import { api } from "@/lib/api";
import type { FrontendRequestItem, FrontendPagination } from "@/lib/api";

// =============================================================================
// Requests Store Types
// =============================================================================

export type RequestStatus =
  | "Active"
  | "Offline"
  | "Wait"
  | "Cancelled"
  | "Completed"
  | "Ongoing";

export type RequestItem = FrontendRequestItem;

export interface RequestsState {
  // State
  requests: RequestItem[];
  pagination: FrontendPagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRequests: (page?: number, limit?: number) => Promise<void>;
  setRequests: (requests: RequestItem[]) => void;
  deleteRequest: (id: string) => void;
  addRequest: (request: Omit<RequestItem, "id">) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  clearError: () => void;
}

// =============================================================================
// Requests Store
// =============================================================================

export const useRequestsStore = create<RequestsState>((set, get) => ({
  // Initial state
  requests: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch requests from API
  fetchRequests: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getServiceRequests(page, limit);
      console.log(response)

      if (response.success) {
        set({
          requests: response.data,
          pagination: response.pagination || null,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch requests",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch requests";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Set requests directly (for local updates)
  setRequests: (requests: RequestItem[]) => {
    set({ requests });
  },

  // Delete a request (local only - backend endpoint may not exist)
  deleteRequest: (id: string) => {
    const { requests } = get();
    set({
      requests: requests.filter((r) => r.id !== id),
    });
  },

  // Add a new request (local only)
  addRequest: (request: Omit<RequestItem, "id">) => {
    const { requests } = get();
    const newRequest: RequestItem = {
      ...request,
      id: `local-${Date.now()}`,
    };
    set({
      requests: [...requests, newRequest],
    });
  },

  // Update request status (local only)
  updateRequestStatus: (id: string, status: RequestStatus) => {
    const { requests } = get();
    set({
      requests: requests.map((r) => (r.id === id ? { ...r, status } : r)),
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// =============================================================================
// Selector Hooks
// =============================================================================

export const useRequests = () => useRequestsStore((state) => state.requests);
export const useRequestsLoading = () =>
  useRequestsStore((state) => state.isLoading);
export const useRequestsError = () => useRequestsStore((state) => state.error);
export const useRequestsPagination = () =>
  useRequestsStore((state) => state.pagination);

export default useRequestsStore;
