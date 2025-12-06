import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { FrontendUser } from "@/lib/api";

// =============================================================================
// Auth Store Types
// =============================================================================

export interface AuthState {
  // State
  user: FrontendUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: FrontendUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// =============================================================================
// Auth Store
// =============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (identifier: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.login(identifier, password);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Set token in API client
            api.setToken(token);

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "Login failed",
            });
            return false;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Login failed. Please try again.";

          set({
            isLoading: false,
            error: errorMessage,
          });

          return false;
        }
      },

      // Logout action
      logout: () => {
        // Clear API client token
        api.clearToken();

        // Reset state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Set user
      setUser: (user: FrontendUser | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "mechafrica-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, initialize the API client with the token
        if (state?.token) {
          api.setToken(state.token);
        }
      },
    }
  )
);

// =============================================================================
// Selector Hooks (stable references)
// =============================================================================

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;
