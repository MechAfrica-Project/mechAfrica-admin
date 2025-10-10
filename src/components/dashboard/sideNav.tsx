import Link from "next/link";
import NavLinks from "./nav-links";
import { PowerIcon, X } from "lucide-react";
import Image from "next/image";
import { images } from "@/lib/images";
import React from "react";

interface SideNavProps {
  closeMenu: () => void;
}

export default function SideNav({ closeMenu }: SideNavProps) {
  return (
    <div className="flex h-full flex-col px-4 py-3 bg-[#FDFFE0]">
      {/* Header logo and close (mobile only) */}
      <div className="flex items-center justify-between mb-6">
        <Image
          src={images.mechLogo2}
          alt="mechLogo2"
          className="w-32 object-contain"
          priority
        />
        <button
          onClick={closeMenu}
          className="p-2 rounded-md hover:bg-gray-100 md:hidden"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Navigation links */}
      <div className="flex grow flex-col justify-between">
        <div>
          <NavLinks />
        </div>

        {/* Sign out button */}
        <form>
          <button className="flex h-[48px] w-full items-center justify-center md:justify-start gap-3 rounded-md p-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
            <PowerIcon className="w-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
