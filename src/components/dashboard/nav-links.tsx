"use client";

import { SidebarTabs } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAdminsStore } from "@/stores/useAdminsStore";

export default function NavLinks() {
  const pathname = usePathname();
  const { dataQuality, fetchDataQuality } = useAdminsStore();

  useEffect(() => {
    fetchDataQuality();
  }, [fetchDataQuality]);

  return (
    <>
      {SidebarTabs.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname === link.url || pathname.startsWith(`${link.url}/`);
        
        const isUsersLink = link.title === "Users";
        const hasIncompleteProfiles = dataQuality && dataQuality.incomplete > 0;

        return (
          <Link
            key={link.title}
            href={link.url}
            className={`group relative flex flex-col rounded-md transition-all
              ${
                isActive
                  ? "bg-[#00594C]/5 border-l-4 border-[#00594C]"
                  : "border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-200"
              }`}
          >
            <div className={`flex items-center gap-3 p-3 text-sm font-medium
              ${isActive ? "text-[#00594C]" : "text-gray-500"}
            `}>
              <LinkIcon
                className={`w-5 transition-colors ${
                  isActive ? "text-[#00594C]" : "text-gray-400"
                }`}
              />
              <span className="flex-grow">{link.title}</span>
              
              {isUsersLink && hasIncompleteProfiles && (
                <span className="flex items-center gap-1.5 bg-[#F59E0B] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></span>
                  {dataQuality.incomplete.toLocaleString()}
                </span>
              )}
            </div>
            
            {isUsersLink && hasIncompleteProfiles && (
              <div className="pl-11 pr-3 pb-2 text-[11px] text-[#F59E0B] font-medium tracking-tight">
                {dataQuality.incomplete.toLocaleString()} incomplete profiles
              </div>
            )}
          </Link>
        );
      })}
    </>
  );
}
