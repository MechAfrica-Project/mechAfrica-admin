"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  AlertTriangle,
  Users,
  Download,
  Play,
  Square,
  RefreshCcw,
  Calendar,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressCircle } from "@/components/ui/progress";
import { useOnboardStore } from "@/stores/useOnboardStore";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RecordsTable } from "../../_components/records-table";
import { EditRecordDialog } from "../../_components/edit-record-dialog";
import { ViewRecordDialog } from "../../_components/view-record-dialog";
import type { OnboardJobStatus, ProblematicRecord, OnboardedRecord, SkippedRecord } from "@/lib/api/types";

type TabType = "onboarded" | "skipped" | "problematic";

const statusConfig: Record<
  OnboardJobStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  analyzing: {
    label: "Analyzing",
    icon: Loader2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertTriangle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailsPage({ params }: PageProps) {
  const { id: jobId } = use(params);
  const router = useRouter();
  const { setTitle } = useHeaderStore();

  // Store state
  const currentJob = useOnboardStore((s) => s.currentJob);
  const isLoadingJob = useOnboardStore((s) => s.isLoadingJob);
  const isConfirming = useOnboardStore((s) => s.isConfirming);
  const isCancelling = useOnboardStore((s) => s.isCancelling);
  const isPolling = useOnboardStore((s) => s.isPolling);
  const isLoadingRecords = useOnboardStore((s) => s.isLoadingRecords);
  const error = useOnboardStore((s) => s.error);

  const onboardedRecords = useOnboardStore((s) => s.onboardedRecords);
  const skippedRecords = useOnboardStore((s) => s.skippedRecords);
  const problematicRecords = useOnboardStore((s) => s.problematicRecords);
  const recordsPagination = useOnboardStore((s) => s.recordsPagination);

  const fetchJob = useOnboardStore((s) => s.fetchJob);
  const confirmJob = useOnboardStore((s) => s.confirmJob);
  const cancelJob = useOnboardStore((s) => s.cancelJob);
  const startPolling = useOnboardStore((s) => s.startPolling);
  const stopPolling = useOnboardStore((s) => s.stopPolling);
  const fetchOnboardedRecords = useOnboardStore((s) => s.fetchOnboardedRecords);
  const fetchSkippedRecords = useOnboardStore((s) => s.fetchSkippedRecords);
  const fetchProblematicRecords = useOnboardStore((s) => s.fetchProblematicRecords);
  const downloadProblematicFile = useOnboardStore((s) => s.downloadProblematicFile);
  const clearError = useOnboardStore((s) => s.clearError);
  const retryRecord = useOnboardStore((s) => s.retryRecord);
  const skipRecord = useOnboardStore((s) => s.skipRecord);
  const deleteRecord = useOnboardStore((s) => s.deleteRecord);
  const bulkRetryRecords = useOnboardStore((s) => s.bulkRetryRecords);
  const getEditedCount = useOnboardStore((s) => s.getEditedCount);
  const retryAllEditedRecords = useOnboardStore((s) => s.retryAllEditedRecords);

  const fetchJobSummary = useOnboardStore((s) => s.fetchJobSummary);

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>("onboarded");
  const [editingRecord, setEditingRecord] = useState<ProblematicRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<OnboardedRecord | SkippedRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewRecordType, setViewRecordType] = useState<"onboarded" | "skipped">("onboarded");
  const [editedCount, setEditedCount] = useState(0);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [jobSummary, setJobSummary] = useState<{
    onboardedCount: number;
    skippedCount: number;
    errorsCount: number;
    farmersCreated: number;
    providersCreated: number;
  } | null>(null);

  // Set page title
  useEffect(() => {
    setTitle("Job Details");
  }, [setTitle]);

  // Fetch job on mount
  useEffect(() => {
    if (jobId) {
      fetchJob(jobId);
    }

    return () => {
      stopPolling();
    };
  }, [jobId, fetchJob, stopPolling]);

  // Fetch job summary to get accurate counts when job is completed
  const jobStatus = currentJob?.status;
  useEffect(() => {
    if (jobStatus === "completed" || jobStatus === "confirmed") {
      fetchJobSummary(jobId).then((summary) => {
        if (summary) {
          setJobSummary({
            onboardedCount: summary.onboarded?.count ?? 0,
            skippedCount: summary.skipped?.count ?? 0,
            errorsCount: summary.errors?.count ?? 0,
            farmersCreated: summary.result_summary?.farmers_created ?? summary.progress?.farmers_created ?? 0,
            providersCreated: summary.result_summary?.providers_created ?? summary.progress?.providers_created ?? 0,
          });
        }
      });
      // Pre-fetch all record counts
      fetchOnboardedRecords(jobId, 1, 1);
      fetchSkippedRecords(jobId, 1, 1);
      fetchProblematicRecords(jobId, 1, 1);
    }
  }, [jobStatus, jobId, fetchJobSummary, fetchOnboardedRecords, fetchSkippedRecords, fetchProblematicRecords]);

  // Start polling if job is processing
  useEffect(() => {
    if (currentJob && currentJob.status === "processing" && !isPolling) {
      startPolling(jobId, (job) => {
        toast.success(`Job ${job.status === "completed" ? "completed" : "finished"}!`);
      });
    }
  }, [currentJob, jobId, isPolling, startPolling]);

  // Fetch records when tab changes or job completes
  useEffect(() => {
    if (!currentJob || currentJob.status === "processing" || currentJob.status === "pending") {
      return;
    }

    switch (activeTab) {
      case "onboarded":
        fetchOnboardedRecords(jobId);
        break;
      case "skipped":
        fetchSkippedRecords(jobId);
        break;
      case "problematic":
        fetchProblematicRecords(jobId);
        break;
    }
  }, [activeTab, currentJob, jobId, fetchOnboardedRecords, fetchSkippedRecords, fetchProblematicRecords]);

  const handleBack = () => {
    router.push("/dashboard/onboarding/jobs");
  };

  const handleConfirm = async () => {
    const result = await confirmJob(jobId);
    if (result) {
      toast.success("Import confirmed! Processing started.");
      router.push(`/dashboard/onboarding/jobs/${result.newJobId}`);
    }
  };

  const handleCancel = async () => {
    const success = await cancelJob(jobId);
    if (success) {
      toast.success("Job cancelled.");
    }
  };

  const handleDownload = () => {
    const downloadUrl = currentJob?.problematicFileUrl;
    if (downloadUrl) {
      downloadProblematicFile(downloadUrl);
    }
  };

  const handleRefresh = () => {
    fetchJob(jobId);
  };

  const handleEditRecord = (record: ProblematicRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleViewRecord = (record: OnboardedRecord | SkippedRecord) => {
    setViewingRecord(record);
    setViewRecordType("reason" in record ? "skipped" : "onboarded");
    setIsViewDialogOpen(true);
  };

  const handleRecordSaved = () => {
    // Refresh the problematic records after saving
    fetchProblematicRecords(jobId);
    // Update edited count
    getEditedCount(jobId).then(setEditedCount);
  };

  const handleRetrySuccess = () => {
    // Refresh all record lists after successful retry
    fetchJob(jobId);
    fetchOnboardedRecords(jobId);
    fetchSkippedRecords(jobId);
    fetchProblematicRecords(jobId);
    getEditedCount(jobId).then(setEditedCount);
  };

  const handleSkipSuccess = () => {
    // Refresh skipped and problematic records
    fetchSkippedRecords(jobId);
    fetchProblematicRecords(jobId);
    fetchJob(jobId);
  };

  const handleDeleteSuccess = () => {
    // Refresh problematic records
    fetchProblematicRecords(jobId);
    fetchJob(jobId);
  };

  // Handlers for inline actions from table
  const handleRetryRecordFromTable = async (record: ProblematicRecord) => {
    const result = await retryRecord(jobId, record.row_number);
    if (result) {
      if (result.success) {
        toast.success(`Record ${record.row_number} processed successfully as ${result.created_as}`);
        handleRetrySuccess();
      } else {
        toast.error(result.message || `Record ${record.row_number} still has issues`);
      }
    }
  };

  const handleSkipRecordFromTable = async (record: ProblematicRecord) => {
    const success = await skipRecord(jobId, record.row_number, "Skipped by admin");
    if (success) {
      toast.success(`Record ${record.row_number} moved to skipped list`);
      handleSkipSuccess();
    }
  };

  const handleDeleteRecordFromTable = async (record: ProblematicRecord) => {
    const success = await deleteRecord(jobId, record.row_number);
    if (success) {
      toast.success(`Record ${record.row_number} deleted`);
      handleDeleteSuccess();
    }
  };

  const handleBulkRetry = async (records: ProblematicRecord[]) => {
    const rowNumbers = records.map((r) => r.row_number);
    const result = await bulkRetryRecords(jobId, rowNumbers);
    if (result) {
      toast.success(
        `Bulk retry complete: ${result.successful} succeeded, ${result.failed} failed`
      );
      handleRetrySuccess();
    }
  };

  const handleRetryAllEdited = async () => {
    if (editedCount === 0) {
      toast.info("No edited records to retry");
      return;
    }
    setIsRetryingAll(true);
    try {
      const result = await retryAllEditedRecords(jobId);
      if (result) {
        toast.success(
          `Retry all edited complete: ${result.successful} succeeded, ${result.failed} failed`
        );
        handleRetrySuccess();
      }
    } finally {
      setIsRetryingAll(false);
    }
  };

  // Fetch edited count when viewing problematic tab
  useEffect(() => {
    if (activeTab === "problematic" && currentJob && currentJob.status !== "processing") {
      getEditedCount(jobId).then(setEditedCount);
    }
  }, [activeTab, currentJob, jobId, getEditedCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return "-";
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const seconds = Math.floor((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Loading state
  if (isLoadingJob && !currentJob) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentJob) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Failed to load job
            </p>
            <p className="text-gray-500 mb-6">{error}</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBack}>
                Go Back
              </Button>
              <Button
                onClick={() => {
                  clearError();
                  fetchJob(jobId);
                }}
                className="gap-2 bg-[#00594C] hover:bg-[#00594C]/90"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return null;
  }

  const status = statusConfig[currentJob.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isProcessing = currentJob.status === "processing" || currentJob.status === "analyzing";
  const isPending = currentJob.status === "pending";
  const isCompleted = currentJob.status === "completed";
  const isConfirmed = currentJob.status === "confirmed";
  const isDryRun = currentJob.config?.dry_run;
  const canConfirm = isCompleted && isDryRun;
  const canCancel = isProcessing || isPending;
  const progress = currentJob.progress;
  const result = currentJob.result;
  const resultSummary = currentJob.resultSummary;

  // Get stats from progress, result, or resultSummary - whichever has values
  // The backend may return data in different places depending on job status
  const getStatValue = (
    progressKey: keyof typeof progress,
    resultKey: keyof NonNullable<typeof result>,
    summaryKey: keyof NonNullable<typeof resultSummary>
  ): number => {
    // First try progress (for in-progress jobs)
    const progressVal = progress?.[progressKey];
    if (typeof progressVal === "number" && progressVal > 0) return progressVal;

    // Then try result (for completed jobs)
    const resultVal = result?.[resultKey];
    if (typeof resultVal === "number" && resultVal > 0) return resultVal;

    // Finally try resultSummary
    const summaryVal = resultSummary?.[summaryKey];
    if (typeof summaryVal === "number" && summaryVal > 0) return summaryVal;

    return 0;
  };

  // Get counts from progress/result or fall back to pagination counts from records
  const onboardedPaginationCount = recordsPagination.onboarded?.count ?? 0;
  const skippedPaginationCount = recordsPagination.skipped?.count ?? 0;
  const problematicPaginationCount = recordsPagination.problematic?.count ?? 0;

  const farmersCreated = getStatValue("farmers_created", "farmers_created", "farmers_created");
  const providersCreated = getStatValue("providers_created", "providers_created", "providers_created");
  const skippedCount = getStatValue("skipped", "skipped", "skipped");
  const errorsCount = getStatValue("errors", "errors", "errors");
  const totalRows = progress?.total_rows ?? result?.total_rows ?? resultSummary?.total_rows ?? 0;

  // Use job summary, pagination counts, or progress as fallbacks (in order of preference)
  const displayFarmersCreated = jobSummary?.farmersCreated ?? (farmersCreated > 0 ? farmersCreated : onboardedPaginationCount);
  const displayProvidersCreated = jobSummary?.providersCreated ?? providersCreated;
  const displaySkipped = jobSummary?.skippedCount ?? (skippedCount > 0 ? skippedCount : skippedPaginationCount);
  const displayErrors = jobSummary?.errorsCount ?? (errorsCount > 0 ? errorsCount : problematicPaginationCount);
  const displayOnboardedCount = jobSummary?.onboardedCount ?? onboardedPaginationCount;

  // Calculate total created (farmers + providers)
  const totalCreated = displayFarmersCreated + displayProvidersCreated;

  const tabs: { key: TabType; label: string; count: number; icon: React.ElementType; color: string }[] = [
    {
      key: "onboarded",
      label: "Created",
      count: totalCreated > 0 ? totalCreated : displayOnboardedCount,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      key: "skipped",
      label: "Skipped",
      count: displaySkipped,
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      key: "problematic",
      label: "Errors",
      count: displayErrors,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  const getRecordsForTab = (): { records: typeof onboardedRecords | typeof skippedRecords | typeof problematicRecords; pagination: typeof recordsPagination.onboarded } => {
    switch (activeTab) {
      case "onboarded":
        return { records: onboardedRecords, pagination: recordsPagination.onboarded };
      case "skipped":
        return { records: skippedRecords, pagination: recordsPagination.skipped };
      case "problematic":
        return { records: problematicRecords, pagination: recordsPagination.problematic };
    }
  };

  const handlePageChange = (page: number) => {
    switch (activeTab) {
      case "onboarded":
        fetchOnboardedRecords(jobId, page);
        break;
      case "skipped":
        fetchSkippedRecords(jobId, page);
        break;
      case "problematic":
        fetchProblematicRecords(jobId, page);
        break;
    }
  };

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentJob.fileName}
                </h1>
                {isDryRun && (
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 bg-amber-50"
                  >
                    Dry Run
                  </Badge>
                )}
                <Badge className={cn(status.bgColor, status.color, "border-0 gap-1.5")}>
                  <StatusIcon
                    className={cn("w-3.5 h-3.5", isProcessing && "animate-spin")}
                  />
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(currentJob.createdAt)}
                </span>
                {currentJob.startedAt && (
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    {formatDuration(currentJob.startedAt, currentJob.completedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-12 sm:ml-0">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Cancel
              </Button>
            )}
            {canConfirm && (
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="gap-2 bg-[#00594C] hover:bg-[#00594C]/90"
              >
                {isConfirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Confirm Import
              </Button>
            )}
            {!canCancel && !canConfirm && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingJob}
                className="gap-2"
              >
                {isLoadingJob ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {(isProcessing || isPending) && progress && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <ProgressCircle
                  value={progress.percent_complete || 0}
                  size={100}
                  strokeWidth={8}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {isProcessing ? "Processing..." : "Waiting to start..."}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {progress.current_sheet ? `Processing ${progress.current_sheet}...` : "Processing rows..."}
                  </p>
                  <Progress value={progress.percent_complete || 0} className="h-2 mb-2" />
                  <p className="text-xs text-gray-500">
                    {(progress.processed_rows ?? 0).toLocaleString()} of{" "}
                    {(progress.total_rows ?? 0).toLocaleString()} rows processed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalRows.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Rows</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">
                {displayFarmersCreated.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Farmers</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {displayProvidersCreated.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">Providers</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {displaySkipped.toLocaleString()}
              </p>
              <p className="text-sm text-amber-600">Skipped</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-700">
                {displayErrors.toLocaleString()}
              </p>
              <p className="text-sm text-red-600">Errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Dry Run Notice */}
        {canConfirm && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  This was a dry run - no users were created
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Review the results above and click &quot;Confirm Import&quot; to perform
                  the actual import. This will create {totalCreated.toLocaleString()} new users
                  ({(progress?.farmers_created ?? 0).toLocaleString()} farmers, {(progress?.providers_created ?? 0).toLocaleString()} providers).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmed Notice */}
        {isConfirmed && (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-emerald-800">
                  Import confirmed and completed
                </p>
                <p className="text-sm text-emerald-700 mt-1">
                  Successfully created {(currentJob.finalImportFarmers ?? 0).toLocaleString()} farmers
                  and {(currentJob.finalImportProviders ?? 0).toLocaleString()} service providers.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records Tabs */}
        {!isProcessing && !isPending && (
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Import Records</CardTitle>
                  <CardDescription>
                    View details of processed records
                  </CardDescription>
                </div>
                {activeTab === "problematic" && (progress?.errors ?? 0) > 0 && currentJob.problematicFileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Errors
                  </Button>
                )}
              </div>

              {/* Tab Buttons */}
              <div className="flex gap-1 mt-4 -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
                        isActive
                          ? "border-[#00594C] text-[#00594C] bg-white"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive && tab.color)} />
                      {tab.label}
                      <span
                        className={cn(
                          "ml-1 px-2 py-0.5 rounded-full text-xs",
                          isActive
                            ? "bg-[#00594C]/10 text-[#00594C]"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {tab.count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Retry All Edited Button for Problematic Tab */}
              {activeTab === "problematic" && editedCount > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">
                      <strong>{editedCount}</strong> edited records ready to retry
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleRetryAllEdited}
                    disabled={isRetryingAll}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRetryingAll ? (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Retry All Edited
                      </>
                    )}
                  </Button>
                </div>
              )}
              {(() => {
                const { records, pagination } = getRecordsForTab();
                return (
                  <RecordsTable
                    records={records}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onDownload={activeTab === "problematic" && currentJob.problematicFileUrl ? handleDownload : undefined}
                    onEditRecord={activeTab === "problematic" ? handleEditRecord : undefined}
                    onViewRecord={(activeTab === "onboarded" || activeTab === "skipped") ? handleViewRecord : undefined}
                    onRetryRecord={activeTab === "problematic" ? handleRetryRecordFromTable : undefined}
                    onSkipRecord={activeTab === "problematic" ? handleSkipRecordFromTable : undefined}
                    onDeleteRecord={activeTab === "problematic" ? handleDeleteRecordFromTable : undefined}
                    onBulkRetry={activeTab === "problematic" ? handleBulkRetry : undefined}
                    isLoading={isLoadingRecords}
                    emptyMessage={`No ${activeTab} records`}
                    type={activeTab}
                    editable={activeTab === "problematic"}
                    showBulkActions={activeTab === "problematic"}
                  />
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Error Banner */}
        {error && currentJob && (
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

        {/* Edit Record Dialog */}
        <EditRecordDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          record={editingRecord}
          jobId={jobId}
          onSave={handleRecordSaved}
          onRetrySuccess={handleRetrySuccess}
          onSkip={handleSkipSuccess}
          onDelete={handleDeleteSuccess}
        />

        {/* View Record Dialog */}
        <ViewRecordDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          record={viewingRecord}
          type={viewRecordType}
        />
      </div>
    </div>
  );
}
