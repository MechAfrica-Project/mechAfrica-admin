"use client";
import NavLinks from "./nav-links";
import { PowerIcon, X } from "lucide-react";
import Image from "next/image";
import { images } from "@/lib/images";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface SideNavProps {
  closeMenu: () => void;
}

export default function SideNav({ closeMenu }: SideNavProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleSignOut = () => {
    // Call logout from auth store to clear state and cookies
    logout();

    // Show toast notification
    toast.success("Logged out successfully");

    // Close mobile menu if open
    closeMenu();

    // Navigate to login page
    router.push("/");
  };

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
        <button
          onClick={handleSignOut}
          className="flex h-12 w-full items-center justify-center md:justify-start gap-3 rounded-md p-3 text-sm font-medium text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors duration-200"
        >
          <PowerIcon className="w-5 h-5" />
          <span className="md:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
