"use client";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function FilterButton() {
  return (
    <Button className="bg-[#00594C] text-white hover:bg-[#00594C]/90 flex items-center gap-2">
      Filter
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}
