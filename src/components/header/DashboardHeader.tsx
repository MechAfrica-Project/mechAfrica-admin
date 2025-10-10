"use client";
import { SectionTab } from "@/types/common";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const dashboardTabs = [
  { title: "Map", path: "/dashboard/dashboard/map" },
  { title: "Database", path: "/dashboard/dashboard/database-page" },
];

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("Map");

  useEffect(() => {
    const current = dashboardTabs.find(tab => pathname.includes(tab.path));
    if (current) setActive(current.title);
  }, [pathname]);

  const handleClick = (tab: SectionTab) => {
    setActive(tab.title);
    router.push(tab.path);
  };
  return (
    <div className="sticky top-0 z-30 bg-white border-b shadow-sm px-6 py-3 flex gap-4 items-center">
      {dashboardTabs.map((tab) => (
        <button
          key={tab.title}
          onClick={() => handleClick(tab)}
          className={` cursor-pointer py-2 rounded-md text-sm font-medium transition-all ${
            active === tab.title
              ? "bg-[#] text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-[#00594C]"
          }`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
}
