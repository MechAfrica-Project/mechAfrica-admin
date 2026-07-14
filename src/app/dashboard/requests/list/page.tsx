"use client";

import { useEffect, useCallback } from "react";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { ServiceRequestsTable } from "./_components/ServiceRequestsTable";
import { useRequestsStore } from "@/stores/useRequestsStore";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AllRequestsPage() {
  const requests = useRequestsStore((s) => s.requests);
  const pagination = useRequestsStore((s) => s.pagination);
  const isLoading = useRequestsStore((s) => s.isLoading);
  const error = useRequestsStore((s) => s.error);
  const fetchRequests = useRequestsStore((s) => s.fetchRequests);
  const clearError = useRequestsStore((s) => s.clearError);

  const { setTitle, setFilters } = useHeaderStore();

  const loadRequests = useCallback((page = 1) => {
    fetchRequests(page, 20);
  }, [fetchRequests]);

  useEffect(() => {
    loadRequests(1);
  }, [loadRequests]);

  useEffect(() => {
    setTitle("All Requests");
    setFilters({});
  }, [setTitle, setFilters]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handlePageChange = (newPage: number) => {
    loadRequests(newPage);
  };

  const handleRefresh = () => {
    loadRequests(pagination?.page || 1);
  };

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;
  const totalRecords = pagination?.total || requests.length;

  if (isLoading && requests.length === 0) {
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

  if (error && requests.length === 0) {
    return (
      <main className="min-h-screen bg-red p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Failed to load Service Requests</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-primary rounded-lg hover:bg-[#00594cd4] transition-colors flex mx-auto"
              >
                <RefreshCcw className="mr-2 h-5 w-5" />
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
      <div className="mx-auto max-w-[95%]">
        {error && requests.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => clearError()}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Total Requests: <strong className="text-foreground">{totalRecords}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="cursor-pointer"
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <ServiceRequestsTable
          requests={requests}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
