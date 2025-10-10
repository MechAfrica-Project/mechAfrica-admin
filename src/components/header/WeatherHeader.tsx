"use client";
import { SectionTab } from "@/types/common";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const weatherTabs = [
  { title: "Weather Data", path: "/dashboard/weather/data" },
  { title: "Stats", path: "/dashboard/weather/stats" },
];

export default function WeatherHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("Weather Data");

  useEffect(() => {
    const current = weatherTabs.find(tab => pathname.includes(tab.path));
    if (current) setActive(current.title);
  }, [pathname]);

  const handleClick = (tab: SectionTab) => {
    setActive(tab.title);
    router.push(tab.path);
  };

  return (
    <div className="sticky top-0 z-30 ">
      {weatherTabs.map((tab) => (
        <button
          key={tab.title}
          onClick={() => handleClick(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            active === tab.title
              ? "bg-[#00594C] text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-[#00594C]"
          }`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
}
