"use client";
import React, { useState, ReactNode } from "react";
import Header from "@/components/header/header";
import SideNav from "@/components/dashboard/sideNav";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="flex flex-col flex-grow bg-white">
        {/* Fixed Header (same component for mobile + desktop) */}
        <header className="sticky top-0 z-30   flex items-center justify-between  md:py-0">
          {/* Hamburger on mobile */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-3 rounded-md hover:bg-gray-100 md:hidden"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </header>

        {/* Scrollable content below fixed header */}
        <main className="flex-grow overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
