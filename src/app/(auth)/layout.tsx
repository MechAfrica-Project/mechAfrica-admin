"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ROUTES } from "@/lib/constants";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && token) {
      router.push(ROUTES.dashboard);
    }
  }, [isAuthenticated, token, router]);

  // If authenticated, don't render the auth page
  if (isAuthenticated && token) {
    return null;
  }

  return <>{children}</>;
}
