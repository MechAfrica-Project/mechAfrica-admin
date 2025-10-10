"use client";

import { SidebarTabs } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {SidebarTabs.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname === link.url || pathname.startsWith(`${link.url}/`);

        return (
          <Link
            key={link.title}
            href={link.url}
            className={`flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-all
              ${
                isActive
                  ? "text-[#00594C]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <LinkIcon
              className={`w-5 transition-colors ${
                isActive ? "text-[#00594C]" : "text-gray-400"
              }`}
            />
            <p>{link.title}</p>
          </Link>
        );
      })}
    </>
  );
}
