"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SECTION_TABS } from "@/lib/constants";
import { useHeaderStore } from "@/stores/useHeaderStore";

interface SectionLayoutProps {
  basePath: keyof typeof SECTION_TABS;
  children: React.ReactNode;
}

export default function SmartSectionLayout({ basePath, children }: SectionLayoutProps) {
  const pathname = usePathname();
  const { setTitle, setActiveTab } = useHeaderStore();

  // All sub-tabs for this basePath
  const tabs = useMemo(() => SECTION_TABS[basePath] || [], [basePath]);

  // Detect the active tab based on pathname
  useEffect(() => {
    // TabItem may be a NavTab (has path) or an ActionTab (no path). Guard before
    // accessing `path`.
    const current = tabs.find((tab) => {
      return ("path" in tab && typeof tab.path === "string" && pathname.startsWith(tab.path));
    });
    const newActive = current?.title || tabs[0]?.title || "";
    setActiveTab(newActive);
    setTitle(newActive);
  }, [pathname, tabs, setActiveTab, setTitle]);

  return (
    <div className="flex flex-col h-full">
      {/* Page Transition Animation */}
      <div className="relative flex-grow overflow-y-auto p-2 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
