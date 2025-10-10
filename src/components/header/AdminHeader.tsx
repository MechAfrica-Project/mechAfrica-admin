import { SectionTab } from "@/types/common";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// AdminHeader.tsx
const adminTabs = [
  { title: "Users", path: "/dashboard/admin/users" },
  { title: "Settings", path: "/dashboard/admin/settings" },
];

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("Weather Data");

  useEffect(() => {
    const current = adminTabs.find((tab) => pathname.includes(tab.path));
    if (current) setActive(current.title);
  }, [pathname]);

  const handleClick = (tab: SectionTab) => {
    setActive(tab.title);
    router.push(tab.path);
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b shadow-sm px-6 py-3 flex gap-4 items-center">
      {adminTabs.map((tab) => (
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
