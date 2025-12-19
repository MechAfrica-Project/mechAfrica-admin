"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  AlertCircle,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FrontendOnboardJob, OnboardJobStatus } from "@/lib/api/types";

interface JobCardProps {
  job: FrontendOnboardJob;
  onClick?: () => void;
  compact?: boolean;
}

const statusConfig: Record<
  OnboardJobStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  analyzing: {
    label: "Analyzing",
    icon: Loader2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertTriangle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

export function JobCard({ job, onClick, compact = false }: JobCardProps) {
  const router = useRouter();
  const status = statusConfig[job.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/dashboard/onboarding/jobs/${job.id}`);
    }
  };

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

  const progress = job.progress;
  const isProcessing = job.status === "processing" || job.status === "analyzing";
  const isDryRun = job.config?.dry_run;
  const totalCreated = (progress?.farmers_created ?? 0) + (progress?.providers_created ?? 0);

  if (compact) {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#00594C]/30",
          status.borderColor
        )}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  status.bgColor
                )}
              >
                <StatusIcon
                  className={cn(
                    "w-5 h-5",
                    status.color,
                    isProcessing && "animate-spin"
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {job.fileName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(job.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {isDryRun && (
                <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                  Dry Run
                </Badge>
              )}
              <Badge className={cn(status.bgColor, status.color, "border-0")}>
                {status.label}
              </Badge>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {isProcessing && progress && (
            <div className="mt-3">
              <Progress value={progress.percent_complete ?? 0} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {(progress.processed_rows ?? 0).toLocaleString()} of {(progress.total_rows ?? 0).toLocaleString()} rows
                processed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-[#00594C]/30 overflow-hidden",
        status.borderColor
      )}
      onClick={handleClick}
    >
      {/* Status Bar */}
      <div className={cn("h-1", status.bgColor.replace("bg-", "bg-").replace("50", "400"))} />

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* File Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                status.bgColor
              )}
            >
              <FileSpreadsheet className={cn("w-6 h-6", status.color)} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate mb-1">
                {job.fileName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>

        {/* Progress Section */}
        {isProcessing && progress && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Processing...
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress.percent_complete ?? 0)}%
              </span>
            </div>
            <Progress value={progress.percent_complete ?? 0} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">
              {(progress.processed_rows ?? 0).toLocaleString()} of{" "}
              {(progress.total_rows ?? 0).toLocaleString()} rows processed
            </p>
          </div>
        )}

        {/* Stats */}
        {progress && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-lg font-bold text-green-700">
                  {totalCreated.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-green-600">Created</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-lg font-bold text-amber-700">
                  {(progress.skipped ?? 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-amber-600">Skipped</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-lg font-bold text-red-700">
                  {(progress.errors ?? 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-red-600">Errors</p>
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00594C] hover:text-[#00594C] hover:bg-[#00594C]/10 gap-1"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-pulse overflow-hidden">
      <div className="h-1 bg-gray-200" />
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-24" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded-lg" />
          <div className="h-16 bg-gray-200 rounded-lg" />
          <div className="h-16 bg-gray-200 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
