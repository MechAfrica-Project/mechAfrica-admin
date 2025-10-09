import Header from "@/components/dashboard/header";
import SideNav from "@/components/dashboard/sideNav";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-grow">
        {/* Header stays fixed at top of this column */}
        <Header />

        {/* Scrollable content below header */}
        <div className="flex-grow overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
