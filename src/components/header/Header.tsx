"use client";
import HeaderFilterDropdown from "./HeaderFilterDropdown";
import HeaderTabs from "./HeaderTabs";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { title, filters } = useHeaderStore();

  return (
    <div className="flex items-center justify-between bg-white px-3 py-4 sm:px-6">
      {/* Left side - Mobile Menu Button + Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Page Title */}
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 truncate">
          {title || "Dashboard"}
        </h2>
      </div>

      {/* Center - Active Filters (hidden on mobile, shown on desktop) */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        {Object.keys(filters).map((key) => (
          <HeaderFilterDropdown key={key} name={key} />
        ))}
      </div>

      {/* Mobile - Filters next to title (shown only on mobile) */}
      <div className="md:hidden flex items-center gap-1">
        {Object.keys(filters).map((key) => (
          <HeaderFilterDropdown key={key} name={key} />
        ))}
      </div>

      {/* Right side - Navigation Tabs */}
      <div className="flex items-center flex-shrink-0">
        <HeaderTabs />
      </div>
    </div>
  );
}
