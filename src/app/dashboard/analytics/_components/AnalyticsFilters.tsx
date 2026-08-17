"use client";

import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function AnalyticsFilters() {
  const { filters, setFilter, resetFilters } = useAnalyticsStore();

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all' && v !== '').length;

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
      <div className="flex-1 flex items-center gap-4">
        <Select value={filters.role} onValueChange={(val) => setFilter('role', val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="farmer">Farmer</SelectItem>
            <SelectItem value="provider">Service Provider</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.gender} onValueChange={(val) => setFilter('gender', val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.missing_data} onValueChange={(val) => setFilter('missing_data', val)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Data Quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="missing_phone">Missing Phone</SelectItem>
            <SelectItem value="missing_location">Missing Location</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground h-9 px-3">
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
