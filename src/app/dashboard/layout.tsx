"use client";
import React, { useState, ReactNode } from "react";
import SideNav from "@/components/dashboard/sideNav";
import Header from "@/components/header/Header";

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
