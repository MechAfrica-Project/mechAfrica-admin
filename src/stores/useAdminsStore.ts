import { create } from "zustand";
import { api } from "@/lib/api";
import type { FrontendAdmin, FrontendPagination } from "@/lib/api";

// =============================================================================
// Admins Store Types
// =============================================================================

export type AdminType = "Admin" | "Agent" | "Farmer" | "Provider" | "Accounts";

export type Admin = FrontendAdmin;

export interface AdminsState {
  // State
  admins: Admin[];
  pagination: FrontendPagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAdmins: (page?: number, limit?: number, role?: string) => Promise<void>;
  setAdmins: (admins: Admin[]) => void;
  addAdmin: (
    admin: Omit<Admin, "id"> & {
      password: string;
      idNumber: string;
      idType: string;
      communityName: string;
      gender: string;
    }
  ) => Promise<boolean>;
  deleteAdmin: (id: string) => Promise<boolean>;
  updateAdmin: (id: string, patch: Partial<Admin>) => void;
  clearError: () => void;
}

// =============================================================================
// Admins Store
// =============================================================================

export const useAdminsStore = create<AdminsState>((set, get) => ({
  // Initial state
  admins: [],
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch admins from API
  fetchAdmins: async (page = 1, limit = 50, role?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getAdmins(page, limit, role);

      if (response.success) {
        set({
          admins: response.data,
          pagination: response.pagination || null,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch admins",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch admins";

      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Set admins directly (for local updates)
  setAdmins: (admins: Admin[]) => {
    set({ admins });
  },

  // Add a new admin via API
  addAdmin: async (adminData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.createAdmin(adminData);

      if (response.success) {
        // Refresh the admins list
        await get().fetchAdmins();
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || "Failed to create admin",
        });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create admin";

      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  // Delete an admin via API
  deleteAdmin: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.deleteAdmin(id);

      if (response.success) {
        // Remove from local state
        const { admins } = get();
        set({
          admins: admins.filter((a) => a.id !== id),
          isLoading: false,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: "Failed to delete admin",
        });
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete admin";

      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  // Update admin locally (API update would need profile endpoint)
  updateAdmin: (id: string, patch: Partial<Admin>) => {
    const { admins } = get();
    set({
      admins: admins.map((a) => (a.id === id ? { ...a, ...patch } : a)),
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

export const useAdmins = () => useAdminsStore((state) => state.admins);
export const useAdminsLoading = () =>
  useAdminsStore((state) => state.isLoading);
export const useAdminsError = () => useAdminsStore((state) => state.error);
export const useAdminsPagination = () =>
  useAdminsStore((state) => state.pagination);

export default useAdminsStore;
