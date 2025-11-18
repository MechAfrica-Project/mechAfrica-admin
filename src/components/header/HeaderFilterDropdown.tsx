"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useHeaderStore } from "@/stores/useHeaderStore";

export default function HeaderFilterDropdown({ name }: { name: string }) {
  const { filters, selectedFilters, setSelectedFilter } = useHeaderStore();
  const options = filters[name] || [];
  const selectedValue = selectedFilters[name];
  // Display label for selected value (fallback to All <name>)
  const selected =
    options.find((o) => o.value === selectedValue)?.label || `All ${name}`;

  if (!options.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="
            border border-gray-200
            bg-white
            text-gray-800
            text-sm
            font-medium
            rounded-xl
            shadow-sm
            hover:bg-gray-50
            flex items-center justify-between
            w-[130px] sm:w-[150px]
          "
        >
          <span className="truncate">{selected}</span>
          <ChevronDown className="ml-2 h-4 w-4 text-gray-700" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="w-[130px] sm:w-[150px] rounded-xl shadow-md"
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setSelectedFilter(name, opt.value)}
            className="text-sm capitalize"
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
