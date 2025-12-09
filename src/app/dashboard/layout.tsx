"use client";
import React, { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideNav from "@/components/dashboard/sideNav";
import Header from "@/components/header/Header";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated || !token) {
      router.push("/");
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, token, router]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#00594C]" />
          <p className="text-[#00594C] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Sidebar (glassmorphic drawer on mobile) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-lg bg-white/80 shadow-2xl border-r border-white/20
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:shadow-none md:bg-transparent md:backdrop-blur-none`}
      >
        <SideNav closeMenu={() => setIsOpen(false)} />
      </div>

      {/* Overlay when sidebar is open (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Main content area */}
      <div className="flex flex-col grow bg-white">
        {/* Fixed Header */}
        <div className="sticky top-0 z-30">
          <Header onMenuClick={() => setIsOpen(true)} />
        </div>

        {/* Scrollable content below fixed header */}
        <main className="grow overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
