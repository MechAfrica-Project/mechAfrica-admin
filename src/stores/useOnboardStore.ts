import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  FrontendOnboardJob,
  OnboardJobProgress,
  OnboardedRecord,
  SkippedRecord,
  ProblematicRecord,
  OnboardRecordsPagination,
  RoleType,
  RetryResult,
  BulkRetryResult,
  OnboardSummaryResponseData,
} from "@/lib/api";

// =============================================================================
// Onboard Store Types
// =============================================================================

export interface OnboardState {
  // State
  jobs: FrontendOnboardJob[];
  currentJob: FrontendOnboardJob | null;
  jobsPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;

  // Records for current job
  onboardedRecords: OnboardedRecord[];
  skippedRecords: SkippedRecord[];
  problematicRecords: ProblematicRecord[];
  recordsPagination: {
    onboarded: OnboardRecordsPagination | null;
    skipped: OnboardRecordsPagination | null;
    problematic: OnboardRecordsPagination | null;
  };

  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;

  // Loading states
  isLoadingJobs: boolean;
  isLoadingJob: boolean;
  isLoadingRecords: boolean;
  isConfirming: boolean;
  isCancelling: boolean;

  // Polling
  isPolling: boolean;
  pollingInterval: NodeJS.Timeout | null;

  // Error state
  error: string | null;

  // Actions
  uploadFile: (
    file: File,
    options?: {
      dryRun?: boolean;
      skipDuplicates?: boolean;
      onboardFarmers?: boolean;
      onboardProviders?: boolean;
      onboardMixedRoles?: boolean;
      mixedRoleAsType?: RoleType;
    }
  ) => Promise<string | null>;

  fetchJobs: (page?: number, limit?: number) => Promise<void>;
  fetchJob: (jobId: string) => Promise<void>;
  fetchJobProgress: (jobId: string) => Promise<OnboardJobProgress | null>;

  confirmJob: (jobId: string) => Promise<{ newJobId: string } | null>;
  cancelJob: (jobId: string) => Promise<boolean>;

  fetchOnboardedRecords: (jobId: string, page?: number, limit?: number) => Promise<void>;
  fetchSkippedRecords: (jobId: string, page?: number, limit?: number) => Promise<void>;
  fetchProblematicRecords: (jobId: string, page?: number, limit?: number) => Promise<void>;

  downloadProblematicFile: (downloadUrl: string) => void;

  // Summary & Result
  fetchJobSummary: (jobId: string) => Promise<OnboardSummaryResponseData | null>;

  // Record editing & retry actions
  updateProblematicRecord: (
    jobId: string,
    rowNumber: number,
    updatedData: Record<string, string>
  ) => Promise<ProblematicRecord | null>;

  retryRecord: (jobId: string, rowNumber: number) => Promise<RetryResult | null>;
  bulkRetryRecords: (jobId: string, rowNumbers: number[]) => Promise<BulkRetryResult | null>;
  retryAllEditedRecords: (jobId: string) => Promise<BulkRetryResult | null>;

  skipRecord: (jobId: string, rowNumber: number, reason?: string) => Promise<boolean>;
  deleteRecord: (jobId: string, rowNumber: number) => Promise<boolean>;

  getEditedCount: (jobId: string) => Promise<number>;
  exportEditedRecords: (jobId: string) => Promise<void>;

  startPolling: (jobId: string, onComplete?: (job: FrontendOnboardJob) => void) => void;
  stopPolling: () => void;

  setCurrentJob: (job: FrontendOnboardJob | null) => void;
  clearError: () => void;
  clearUploadError: () => void;
  reset: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState = {
  jobs: [] as FrontendOnboardJob[],
  currentJob: null as FrontendOnboardJob | null,
  jobsPagination: null as {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null,

  onboardedRecords: [] as OnboardedRecord[],
  skippedRecords: [] as SkippedRecord[],
  problematicRecords: [] as ProblematicRecord[],
  recordsPagination: {
    onboarded: null as OnboardRecordsPagination | null,
    skipped: null as OnboardRecordsPagination | null,
    problematic: null as OnboardRecordsPagination | null,
  },

  isUploading: false,
  uploadProgress: 0,
  uploadError: null as string | null,

  isLoadingJobs: false,
  isLoadingJob: false,
  isLoadingRecords: false,
  isConfirming: false,
  isCancelling: false,
  isRetrying: false,
  isUpdatingRecord: false,

  isPolling: false,
  pollingInterval: null as NodeJS.Timeout | null,

  error: null as string | null,
};

// =============================================================================
// Onboard Store
// =============================================================================

export const useOnboardStore = create<OnboardState>((set, get) => ({
  ...initialState,

  // Upload file for bulk onboarding
  uploadFile: async (file, options = {}) => {
    set({ isUploading: true, uploadProgress: 0, uploadError: null });

    try {
      // Simulate upload progress (since we can't track actual progress with fetch)
      const progressInterval = setInterval(() => {
        set((state) => ({
          uploadProgress: Math.min(state.uploadProgress + 10, 90),
        }));
      }, 200);

      const response = await api.uploadBulkOnboard(file, options);

      clearInterval(progressInterval);
      set({ uploadProgress: 100 });

      if (response.success && response.data) {
        // Refresh jobs list
        await get().fetchJobs();

        set({ isUploading: false, uploadProgress: 0 });
        return response.data.job_id;
      } else {
        set({
          isUploading: false,
          uploadProgress: 0,
          uploadError: response.message || "Upload failed",
        });
        return null;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";

      set({
        isUploading: false,
        uploadProgress: 0,
        uploadError: errorMessage,
      });

      return null;
    }
  },

  // Fetch all jobs
  fetchJobs: async (page = 1, limit = 20) => {
    set({ isLoadingJobs: true, error: null });

    try {
      const response = await api.getOnboardJobs(page, limit);

      set({
        jobs: response.jobs,
        jobsPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          pages: response.pages,
        },
        isLoadingJobs: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch jobs";

      set({
        isLoadingJobs: false,
        error: errorMessage,
      });
    }
  },

  // Fetch single job
  fetchJob: async (jobId) => {
    set({ isLoadingJob: true, error: null });

    try {
      const job = await api.getOnboardJob(jobId);

      set({
        currentJob: job,
        isLoadingJob: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch job";

      set({
        isLoadingJob: false,
        error: errorMessage,
      });
    }
  },

  // Fetch job progress (for polling)
  fetchJobProgress: async (jobId) => {
    try {
      const progressData = await api.getOnboardJobProgress(jobId);

      // Debug logging to understand what the backend is returning
      console.log("[OnboardStore] Progress response:", JSON.stringify(progressData, null, 2));

      // Validate that we got progress data
      if (!progressData) {
        console.warn("[OnboardStore] No progress data returned from API");
        return null;
      }

      // The progress object might be nested or at the root level
      // Handle both cases for robustness
      const progress = progressData.progress || progressData;
      const status = progressData.status || get().currentJob?.status || "processing";

      console.log("[OnboardStore] Extracted progress:", {
        processed_rows: progress?.processed_rows,
        total_rows: progress?.total_rows,
        percent_complete: progress?.percent_complete,
        status,
      });

      // Update current job's progress if it matches
      const currentJob = get().currentJob;
      if (currentJob && currentJob.id === jobId) {
        // Merge with existing progress to preserve any fields
        const mergedProgress = {
          ...(currentJob.progress || {}),
          ...progress,
          // Ensure we have at least some default values
          total_rows: progress?.total_rows ?? currentJob.progress?.total_rows ?? 0,
          processed_rows: progress?.processed_rows ?? currentJob.progress?.processed_rows ?? 0,
          percent_complete: progress?.percent_complete ?? currentJob.progress?.percent_complete ?? 0,
          farmers_created: progress?.farmers_created ?? currentJob.progress?.farmers_created ?? 0,
          providers_created: progress?.providers_created ?? currentJob.progress?.providers_created ?? 0,
          skipped: progress?.skipped ?? currentJob.progress?.skipped ?? 0,
          errors: progress?.errors ?? currentJob.progress?.errors ?? 0,
        };

        set({
          currentJob: {
            ...currentJob,
            progress: mergedProgress,
            status: status,
          },
        });
      }

      // Update job in list
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId
            ? { ...job, progress: progress, status: status }
            : job
        ),
      }));

      return progress;
    } catch (error) {
      console.error("[OnboardStore] Failed to fetch job progress:", error);
      return null;
    }
  },

  // Confirm a dry-run job
  confirmJob: async (jobId) => {
    set({ isConfirming: true, error: null });

    try {
      const data = await api.confirmOnboardJob(jobId);

      set({ isConfirming: false });

      // Fetch the new job and start polling
      if (data.new_job_id) {
        await get().fetchJob(data.new_job_id);
        get().startPolling(data.new_job_id);
        return { newJobId: data.new_job_id };
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to confirm job";

      set({
        isConfirming: false,
        error: errorMessage,
      });

      return null;
    }
  },

  // Cancel a job
  cancelJob: async (jobId) => {
    set({ isCancelling: true, error: null });

    try {
      await api.cancelOnboardJob(jobId);

      // Update current job status
      const currentJob = get().currentJob;
      if (currentJob && currentJob.id === jobId) {
        set({
          currentJob: {
            ...currentJob,
            status: "cancelled",
          },
        });
      }

      // Update job in list
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId ? { ...job, status: "cancelled" as const } : job
        ),
        isCancelling: false,
      }));

      // Stop polling if active
      get().stopPolling();

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel job";

      set({
        isCancelling: false,
        error: errorMessage,
      });

      return false;
    }
  },

  // Fetch onboarded records
  fetchOnboardedRecords: async (jobId, page = 1, limit = 50) => {
    set({ isLoadingRecords: true });

    try {
      const data = await api.getOnboardedRecords(jobId, page, limit);

      set({
        onboardedRecords: data.records,
        recordsPagination: {
          ...get().recordsPagination,
          onboarded: {
            count: data.count,
            page: data.page,
            limit: data.limit,
            pages: data.pages,
          },
        },
        isLoadingRecords: false,
      });
    } catch (error) {
      console.error("Failed to fetch onboarded records:", error);
      set({ isLoadingRecords: false });
    }
  },

  // Fetch skipped records
  fetchSkippedRecords: async (jobId, page = 1, limit = 50) => {
    set({ isLoadingRecords: true });

    try {
      const data = await api.getSkippedRecords(jobId, page, limit);

      set({
        skippedRecords: data.records,
        recordsPagination: {
          ...get().recordsPagination,
          skipped: {
            count: data.count,
            page: data.page,
            limit: data.limit,
            pages: data.pages,
          },
        },
        isLoadingRecords: false,
      });
    } catch (error) {
      console.error("Failed to fetch skipped records:", error);
      set({ isLoadingRecords: false });
    }
  },

  // Fetch problematic records
  fetchProblematicRecords: async (jobId, page = 1, limit = 50) => {
    set({ isLoadingRecords: true });

    try {
      const data = await api.getProblematicRecords(jobId, page, limit);

      set({
        problematicRecords: data.records,
        recordsPagination: {
          ...get().recordsPagination,
          problematic: {
            count: data.count,
            page: data.page,
            limit: data.limit,
            pages: data.pages,
          },
        },
        isLoadingRecords: false,
      });
    } catch (error) {
      console.error("Failed to fetch problematic records:", error);
      set({ isLoadingRecords: false });
    }
  },

  // Download problematic records file
  downloadProblematicFile: (downloadUrl: string) => {
    api.downloadProblematicRecords(downloadUrl);
  },

  // Fetch job summary with breakdowns
  fetchJobSummary: async (jobId) => {
    try {
      const summary = await api.getOnboardJobSummary(jobId);
      return summary;
    } catch (error) {
      console.error("Failed to fetch job summary:", error);
      return null;
    }
  },

  // Update a problematic record
  updateProblematicRecord: async (jobId, rowNumber, updatedData) => {
    try {
      const record = await api.updateProblematicRecord(jobId, rowNumber, updatedData);

      // Update the record in the local state
      set((state) => ({
        problematicRecords: state.problematicRecords.map((r) =>
          r.row_number === rowNumber ? record : r
        ),
      }));

      return record;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update record";
      set({ error: errorMessage });
      return null;
    }
  },

  // Retry a single problematic record
  retryRecord: async (jobId, rowNumber) => {
    try {
      const result = await api.retryProblematicRecord(jobId, rowNumber);

      // If successful, remove from problematic records
      if (result.success) {
        set((state) => ({
          problematicRecords: state.problematicRecords.filter(
            (r) => r.row_number !== rowNumber
          ),
        }));
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to retry record";
      set({ error: errorMessage });
      return null;
    }
  },

  // Bulk retry multiple records
  bulkRetryRecords: async (jobId, rowNumbers) => {
    try {
      const result = await api.bulkRetryRecords(jobId, rowNumbers);

      // Remove successful records from the list
      const successfulRows = result.results
        .filter((r) => r.success)
        .map((r) => r.row_number);

      set((state) => ({
        problematicRecords: state.problematicRecords.filter(
          (r) => !successfulRows.includes(r.row_number)
        ),
      }));

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to bulk retry records";
      set({ error: errorMessage });
      return null;
    }
  },

  // Retry all edited records
  retryAllEditedRecords: async (jobId) => {
    try {
      const result = await api.retryAllEditedRecords(jobId);

      // Refresh problematic records list
      await get().fetchProblematicRecords(jobId);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to retry edited records";
      set({ error: errorMessage });
      return null;
    }
  },

  // Skip a problematic record
  skipRecord: async (jobId, rowNumber, reason) => {
    try {
      await api.skipProblematicRecord(jobId, rowNumber, reason);

      // Remove from problematic records
      set((state) => ({
        problematicRecords: state.problematicRecords.filter(
          (r) => r.row_number !== rowNumber
        ),
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to skip record";
      set({ error: errorMessage });
      return false;
    }
  },

  // Delete a problematic record
  deleteRecord: async (jobId, rowNumber) => {
    try {
      await api.deleteProblematicRecord(jobId, rowNumber);

      // Remove from problematic records
      set((state) => ({
        problematicRecords: state.problematicRecords.filter(
          (r) => r.row_number !== rowNumber
        ),
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete record";
      set({ error: errorMessage });
      return false;
    }
  },

  // Get count of edited records
  getEditedCount: async (jobId) => {
    try {
      const count = await api.getEditedRecordsCount(jobId);
      return count;
    } catch (error) {
      console.error("Failed to get edited count:", error);
      return 0;
    }
  },

  // Export edited records
  exportEditedRecords: async (jobId) => {
    try {
      const blob = await api.exportEditedRecords(jobId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_records_${jobId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to export records";
      set({ error: errorMessage });
    }
  },

  // Start polling for job progress
  startPolling: (jobId, onComplete) => {
    // Stop any existing polling
    get().stopPolling();

    set({ isPolling: true });

    const interval = setInterval(async () => {
      const progress = await get().fetchJobProgress(jobId);

      if (progress) {
        const currentJob = get().currentJob;
        // Check if job is complete
        if (
          currentJob &&
          (currentJob.status === "completed" ||
            currentJob.status === "failed" ||
            currentJob.status === "cancelled" ||
            currentJob.status === "confirmed")
        ) {
          get().stopPolling();

          // Fetch full job details
          await get().fetchJob(jobId);

          if (onComplete && get().currentJob) {
            onComplete(get().currentJob!);
          }
        }
      }
    }, 2000); // Poll every 2 seconds

    set({ pollingInterval: interval });
  },

  // Stop polling
  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    set({ isPolling: false, pollingInterval: null });
  },

  // Set current job
  setCurrentJob: (job) => {
    set({ currentJob: job });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear upload error
  clearUploadError: () => {
    set({ uploadError: null });
  },

  // Reset store
  reset: () => {
    get().stopPolling();
    set(initialState);
  },
}));

// =============================================================================
// Selector Hooks
// =============================================================================

export const useOnboardJobs = () => useOnboardStore((state) => state.jobs);
export const useCurrentOnboardJob = () => useOnboardStore((state) => state.currentJob);
export const useIsUploading = () => useOnboardStore((state) => state.isUploading);
export const useUploadProgress = () => useOnboardStore((state) => state.uploadProgress);
export const useOnboardError = () => useOnboardStore((state) => state.error);

export default useOnboardStore;
