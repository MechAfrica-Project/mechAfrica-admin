"use client";

import { useEffect, useState, useCallback } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { AddAdminDialog } from "./_components/add-admin-dialog";
import { AdminsTable } from "./_components/admins-table";
import { DataQualityBanner } from "./_components/data-quality-banner";
import { useAdminsStore, Admin } from "@/stores/useAdminsStore";
import { useTableStore } from "@/stores/useTableStore";
import { RefreshCcw, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const PAGE_SIZE = 10;

export default function AdminsPage() {
  // Get store state and actions
  const admins = useAdminsStore((s) => s.admins);
  const pagination = useAdminsStore((s) => s.pagination);
  const isLoading = useAdminsStore((s) => s.isLoading);
  const error = useAdminsStore((s) => s.error);
  const fetchAdmins = useAdminsStore((s) => s.fetchAdmins);
  const addAdmin = useAdminsStore((s) => s.addAdmin);
  const deleteAdmin = useAdminsStore((s) => s.deleteAdmin);
  const clearError = useAdminsStore((s) => s.clearError);
  const dataQuality = useAdminsStore((s) => s.dataQuality);
  const fetchDataQuality = useAdminsStore((s) => s.fetchDataQuality);

  const { setTitle, setFilters, selectedFilters } = useHeaderStore();

  const selectedAdmins = useTableStore((s) => s.selections["admins"] || []);
  const toggleSelect = useTableStore((s) => s.toggleSelect);
  const clearSelection = useTableStore((s) => s.clearSelection);
  const page = useTableStore((s) => s.pages["admins"] || 1);
  const setPage = useTableStore((s) => s.setPage);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userStats, setUserStats] = useState<{
    farmers: number;
    providers: number;
    agents: number;
    admins: number;
    total: number;
  } | null>(null);

  // Missing data modal state
  const [missingDataFilters, setMissingDataFilters] = useState<string[]>([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get selected role filter
  const selectedRole = selectedFilters["Users"] || "all";

  // Fetch user stats from dashboard API for accurate metrics
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await api.getDashboard();
      if (response.success && response.data?.user_stats) {
        const stats = response.data.user_stats;
        setUserStats({
          farmers: stats.farmers?.total || 0,
          providers: stats.service_providers?.total || 0,
          agents: stats.agents?.total || 0,
          admins: stats.admins?.total || 0,
          total: (stats.farmers?.total || 0) +
            (stats.service_providers?.total || 0) +
            (stats.agents?.total || 0) +
            (stats.admins?.total || 0),
        });
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  }, []);

  // Fetch user stats and data quality on mount
  useEffect(() => {
    fetchUserStats();
    fetchDataQuality();
  }, [fetchUserStats, fetchDataQuality]);

  // Fetch admins when page, filter, or search changes (server-side pagination)
  const loadAdmins = useCallback(() => {
    const roleFilter = selectedRole === "all" ? undefined : selectedRole;
    const searchParam = debouncedSearch.trim() ? debouncedSearch : undefined;
    const missingParam = missingDataFilters.length > 0 ? missingDataFilters.join(",") : undefined;
    fetchAdmins(page, PAGE_SIZE, roleFilter, searchParam, missingParam);
  }, [fetchAdmins, page, selectedRole, debouncedSearch, missingDataFilters]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Reset to page 1 when filter, search, or missing data filter changes
  useEffect(() => {
    setPage("admins", 1);
  }, [selectedRole, debouncedSearch, missingDataFilters, setPage]);

  // Set page title and filters
  useEffect(() => {
    setTitle("Admin");
    setFilters({
      Users: [
        { label: "All Users", value: "all" },
        { label: "Admin", value: "Admin" },
        { label: "Farmer", value: "Farmer" },
        { label: "Agent", value: "Agent" },
        { label: "Provider", value: "Provider" },
        { label: "Accounting", value: "Accounting" },
      ],
    });
  }, [setTitle, setFilters]);

  // Listen for action tab events from HeaderTabs
  useEffect(() => {
    const handleOpenModal = () => setIsDialogOpen(true);
    window.addEventListener("open-agent-modal", handleOpenModal);
    return () => window.removeEventListener("open-agent-modal", handleOpenModal);
  }, []);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleAddAdmin = async (
    newAdmin: Omit<Admin, "id"> & {
      password: string;
      idNumber: string;
      idType: string;
      communityName: string;
      gender: string;
    }
  ) => {
    const success = await addAdmin(newAdmin);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleSelectAdmin = (id: string) => {
    toggleSelect("admins", id);
  };

  const handleDeleteAdmin = async (id: string) => {
    await deleteAdmin(id);
    clearSelection("admins");
  };

  // Admins are now filtered server-side, no client-side filtering needed
  const filteredAdmins = admins;

  // Handle page change for server-side pagination
  const handlePageChange = (newPage: number) => {
    setPage("admins", newPage);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAdmins();
    fetchUserStats();
    fetchDataQuality();
  };

  // Get total pages from server pagination
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;
  const totalRecords = pagination?.total || admins.length;

  // Use accurate metrics from dashboard API, fallback to pagination total
  const metrics = {
    total: userStats?.total || totalRecords,
    farmers: userStats?.farmers || 0,
    providers: userStats?.providers || 0,
    agents: userStats?.agents || 0,
    admins: userStats?.admins || 0,
  };

  const handleDataQualityFilter = (filterType: string) => {
    setMissingDataFilters(prev => {
      if (prev.includes(filterType)) {
        return prev.filter(f => f !== filterType);
      } else {
        return [...prev, filterType];
      }
    });
  };

  // Loading state
  if (isLoading && admins.length === 0) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00594C] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && admins.length === 0) {
    return (
      <main className="min-h-screen bg-red p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Failed to load Users</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => handleRefresh()}
                className="px-4 py-2  text-primary rounded-lg hover:bg-[#00594cd4] transition-colors flex"
              >
                <span><RefreshCcw /></span>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        {/* Show error banner if there's an error but we have cached data */}
        {error && admins.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button
              onClick={() => clearError()}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <DataQualityBanner 
          data={dataQuality} 
          activeFilters={missingDataFilters}
          onFilter={handleDataQualityFilter} 
        />

        {/* Header with Search, Refresh and Add buttons */}
        <div className="mb-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, phone, location, or role..." 
              className="pl-9 bg-background border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="cursor-pointer"
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="lg"
              className="cursor-pointer bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats summary metrics */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Total: <strong className="text-foreground">{metrics.total}</strong></span>
          <span>Farmers: <strong className="text-foreground">{metrics.farmers}</strong></span>
          <span>Providers: <strong className="text-foreground">{metrics.providers}</strong></span>
          <span>Agents: <strong className="text-foreground">{metrics.agents}</strong></span>
          <span>Admins: <strong className="text-foreground">{metrics.admins}</strong></span>
        </div>

        <AdminsTable
          admins={filteredAdmins}
          selectedAdmins={selectedAdmins}
          onSelectAdmin={handleSelectAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onRefresh={loadAdmins}
        />

        <AddAdminDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAddAdmin={handleAddAdmin}
        />

      </div>
    </main>
  );
}
