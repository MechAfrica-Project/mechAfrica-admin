"use client";
import { Button } from "@/components/ui/button";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useRouter, usePathname } from "next/navigation";
import { SECTION_TABS } from "@/lib/constants";

export default function HeaderTabs() {
  const { activeTab, setActiveTab, resetFilters } = useHeaderStore();
  const router = useRouter();
  const pathname = usePathname();

  // Get the current section tabs based on the base path
  const getCurrentSectionTabs = () => {
    if (pathname.startsWith("/dashboard/dashboard")) {
      return SECTION_TABS["/dashboard"];
    } else if (pathname.startsWith("/dashboard/weather")) {
      return SECTION_TABS["/weather"];
    } else if (pathname.startsWith("/dashboard/requests")) {
      return SECTION_TABS["/requests"];
    } else if (pathname.startsWith("/dashboard/finances")) {
      return SECTION_TABS["/finances"];
    } else if (pathname.startsWith("/dashboard/admin")) {
      return SECTION_TABS["/admin"];
    }
    return [];
  };

  const tabs = getCurrentSectionTabs();

  const handleTabClick = (tab: { title: string; path: string }) => {
    if (tab.title === activeTab) return;
    setActiveTab(tab.title);
    resetFilters();
    router.push(tab.path);
  };

  if (!tabs.length) return null;

  return (
    <div className="flex gap-1 sm:gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.title}
          variant={tab.title === activeTab ? "default" : "outline"}
          size="sm"
          className={`text-xs sm:text-sm ${
            tab.title === activeTab
              ? "bg-[#00594C] text-white"
              : "text-gray-600 hover:text-[#00594C]"
          }`}
          onClick={() => handleTabClick(tab)}
        >
          <span className="hidden sm:inline">{tab.title}</span>
          <span className="sm:hidden">{tab.title.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  );
}
