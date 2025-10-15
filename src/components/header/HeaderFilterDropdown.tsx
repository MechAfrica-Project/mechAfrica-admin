"use client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useHeaderStore } from "@/stores/useHeaderStore";

export default function HeaderFilterDropdown({ name }: { name: string }) {
  const { filters, selectedFilters, setSelectedFilter } = useHeaderStore();
  const options = filters[name] || [];
  const selected = selectedFilters[name] || `All ${name}`;

  if (!options.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="capitalize text-xs sm:text-sm">
          {selected}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-40 sm:w-48">
        {options.map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => setSelectedFilter(name, opt.label)}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
