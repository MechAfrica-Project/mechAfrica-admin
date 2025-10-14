"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SECTION_TABS } from "@/lib/constants";
import { SectionTab } from "@/types/common";

interface SectionLayoutProps {
  basePath: keyof typeof SECTION_TABS; // strictly typed to allowed keys
  children: React.ReactNode;
}

export default function SectionLayout({
  basePath,
  children,
}: SectionLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Memoize tabs to avoid ESLint warning
  const tabs = useMemo(() => SECTION_TABS[basePath] || [], [basePath]);

  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const current = tabs.find((tab) => pathname.startsWith(tab.path));
    setActiveTab(current?.title || tabs[0]?.title || "");
  }, [pathname, tabs]);

  const handleTabClick = (tab: SectionTab) => {
    if (tab.title === activeTab) return;
    setActiveTab(tab.title);
    router.push(tab.path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header Tabs */}
      <div className="sticky top-0 z-30  px-6 py-3 flex gap-3 items-center">
        {tabs.map((tab) => (
          <button
            key={tab.title}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.title
                ? "bg-[#00594C] text-white"
                : "text-gray-600 hover:text-[#00594C] hover:bg-gray-100"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Animated Children */}
      <div className="relative flex-grow overflow-y-auto p-4">
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
