"use client";

import { useEffect, useRef, ReactNode } from "react";
import { api } from "@/lib/api";

// =============================================================================
// Auth Provider Props
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

// =============================================================================
// Auth Provider Component
// =============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const initialized = useRef(false);

  // Initialize auth on mount - only once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check for token in localStorage and sync with API client
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        api.setToken(token);
      }
    }
  }, []);

  return <>{children}</>;
}

export default AuthProvider;
