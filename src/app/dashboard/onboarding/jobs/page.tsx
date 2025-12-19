"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  Filter,
  RefreshCcw,
  Loader2,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardStore } from "@/stores/useOnboardStore";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { JobCard, JobCardSkeleton } from "../_components/job-card";
import type { OnboardJobStatus } from "@/lib/api/types";

type FilterStatus = OnboardJobStatus | "all";

export default function JobsPage() {
  const router = useRouter();
  const { setTitle } = useHeaderStore();

  // Store state
  const jobs = useOnboardStore((s) => s.jobs);
  const isLoadingJobs = useOnboardStore((s) => s.isLoadingJobs);
  const jobsPagination = useOnboardStore((s) => s.jobsPagination);
  const error = useOnboardStore((s) => s.error);
  const fetchJobs = useOnboardStore((s) => s.fetchJobs);
  const clearError = useOnboardStore((s) => s.clearError);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  // Set page title
  useEffect(() => {
    setTitle("Jobs History");
  }, [setTitle]);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    fetchJobs();
  };

  const handleNewUpload = () => {
    router.push("/dashboard/onboarding/upload");
  };

  // Loading state
  if (isLoadingJobs && jobs.length === 0) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          </div>

          {/* Filter Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded w-80 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
          </div>

          {/* Jobs List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && jobs.length === 0) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Failed to load jobs
            </p>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => {
                clearError();
                fetchJobs();
              }}
              className="gap-2 bg-[#00594C] hover:bg-[#00594C]/90"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00594C] flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobs History</h1>
              <p className="text-gray-500">
                {jobsPagination
                  ? `${jobsPagination.total} total jobs`
                  : `${jobs.length} jobs`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingJobs}
              className="gap-2"
            >
              {isLoadingJobs ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              Refresh
            </Button>
            <Button
              onClick={handleNewUpload}
              className="gap-2 bg-[#00594C] hover:bg-[#00594C]/90"
            >
              <Plus className="w-4 h-4" />
              New Upload
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by filename or job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="processing">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Processing
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="failed">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Failed
                  </div>
                </SelectItem>
                <SelectItem value="cancelled">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Cancelled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-xl bg-white">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {jobs.length === 0 ? "No import jobs yet" : "No matching jobs"}
            </p>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              {jobs.length === 0
                ? "Start by uploading an Excel file to bulk onboard farmers and service providers."
                : "Try adjusting your search or filter criteria."}
            </p>
            {jobs.length === 0 && (
              <Button
                onClick={handleNewUpload}
                className="gap-2 bg-[#00594C] hover:bg-[#00594C]/90"
              >
                <Plus className="w-4 h-4" />
                Upload Your First File
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Show error banner if there's an error but we have cached data */}
        {error && jobs.length > 0 && (
          <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-600 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
