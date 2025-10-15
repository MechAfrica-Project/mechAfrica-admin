"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { useRouter, usePathname } from "next/navigation";
import { SECTION_TABS } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

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
    <>
      {/* Desktop: Show all tabs as buttons */}
      <div className="hidden sm:flex gap-1 sm:gap-2">
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
            {tab.title}
          </Button>
        ))}
      </div>

      {/* Mobile: Show dropdown with current tab + chevron */}
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
                className={`cursor-pointer ${
                  tab.title === activeTab ? "bg-[#00594C]/10 text-[#00594C] font-medium" : ""
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
