"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useRouter, usePathname } from "next/navigation";
import { SECTION_TABS } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

// Types for navigation and action tabs
type NavTab = { title: string; path: string };
type ActionTab = { title: string; type: "action"; action: string };
type TabItem = NavTab | ActionTab;

export default function HeaderTabs() {
  const { activeTab, setActiveTab, resetFilters, setAction } = useHeaderStore();
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentSectionTabs = (): TabItem[] => {
    if (pathname.startsWith("/dashboard/dashboard"))
      return SECTION_TABS["/dashboard"];
    if (pathname.startsWith("/dashboard/weather"))
      return SECTION_TABS["/weather"];
    if (pathname.startsWith("/dashboard/requests"))
      return SECTION_TABS["/requests"];
    if (pathname.startsWith("/dashboard/finances"))
      return SECTION_TABS["/finances"];
    if (pathname.startsWith("/dashboard/admin")) return SECTION_TABS["/admin"];
    if (pathname.startsWith("/dashboard/onboarding"))
      return SECTION_TABS["/onboarding"];

    return [];
  };

  const tabs = getCurrentSectionTabs();

  const handleTabClick = (tab: TabItem) => {
    resetFilters();
    setActiveTab(tab.title);

    // Handle ACTION tab: set store action (pages can react) and also dispatch browser event
    if ("type" in tab && tab.type === "action") {
      setAction(tab.action);
      // keep existing event dispatch for compatibility
      try {
        window.dispatchEvent(new CustomEvent(tab.action));
      } catch (err) {
        // ignore if dispatching fails in some environments; pages will still react to the store change
        console.warn("Failed to dispatch action event:", err);
      }
      return;
    }

    // Handle NAVIGATION tab
    if ("path" in tab) {
      router.push(tab.path);
    }
  };

  if (!tabs.length) return null;

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex gap-1 sm:gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.title}
            variant={tab.title === activeTab ? "default" : "outline"}
            size="sm"
            className={`text-xs sm:text-sm ${tab.title === activeTab
                ? "bg-[#00594C] text-white"
                : "text-gray-600 hover:text-[#00594C]"
              }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.title}
          </Button>
        ))}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs bg-[#00594C] text-white hover:bg-[#00594C]/90"
            >
              <span>{activeTab || tabs[0]?.title}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {tabs.map((tab) => (
              <DropdownMenuItem
                key={tab.title}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer ${tab.title === activeTab
                    ? "bg-[#00594C]/10 text-[#00594C] font-medium"
                    : ""
                  }`}
              >
                {tab.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
