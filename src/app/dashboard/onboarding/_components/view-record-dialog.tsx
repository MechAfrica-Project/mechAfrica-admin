"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  OnboardedRecord,
  SkippedRecord,
  ParticipantType,
  RoleType,
} from "@/lib/api/types";

interface ViewRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: OnboardedRecord | SkippedRecord | null;
  type: "onboarded" | "skipped";
}

const participantTypeConfig: Record<
  ParticipantType,
  { label: string; color: string; bgColor: string }
> = {
  farmer_only: {
    label: "Farmer Only",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  service_provider_only: {
    label: "Service Provider",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  farmer_and_provider: {
    label: "Farmer & Provider",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  unknown: {
    label: "Unknown",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
};

const roleTypeConfig: Record<RoleType, { label: string; color: string; bgColor: string }> = {
  farmer: {
    label: "Farmer",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  provider: {
    label: "Service Provider",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
};

function isOnboardedRecord(
  record: OnboardedRecord | SkippedRecord
): record is OnboardedRecord {
  return "created_as" in record || "user_id" in record;
}

export function ViewRecordDialog({
  isOpen,
  onOpenChange,
  record,
  type,
}: ViewRecordDialogProps) {
  if (!record) return null;

  const handleCopyUserId = () => {
    if (isOnboardedRecord(record) && record.user_id) {
      navigator.clipboard.writeText(record.user_id);
      toast.success("User ID copied to clipboard");
    }
  };

  const handleCopyPhone = () => {
    if (record.phone_number) {
      navigator.clipboard.writeText(record.phone_number);
      toast.success("Phone number copied to clipboard");
    }
  };

  const participantType = record.participant_type;
  const typeConfig = participantTypeConfig[participantType] || participantTypeConfig.unknown;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "onboarded" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            {type === "onboarded" ? "Onboarded Record" : "Skipped Record"} - Row{" "}
            {record.row_number}
          </DialogTitle>
          <DialogDescription>
            View details of this {type === "onboarded" ? "successfully created" : "skipped"} record.
          </DialogDescription>
        </DialogHeader>

        {/* Status Banner */}
        {type === "onboarded" ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-700">Successfully Created</p>
              <p className="text-sm text-green-600">
                This record was processed and a new user was created.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-700">Skipped</p>
              <p className="text-sm text-amber-600">
                {"reason" in record && record.reason
                  ? record.reason
                  : "This record was skipped during processing."}
              </p>
            </div>
          </div>
        )}

        {/* Record Details */}
        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00594C]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#00594C]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{record.full_name || "-"}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Phone Number</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{record.phone_number || "-"}</p>
                {record.phone_number && (
                  <button
                    onClick={handleCopyPhone}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy phone number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">
                {isOnboardedRecord(record)
                  ? [record.district, record.region].filter(Boolean).join(", ") || "-"
                  : "-"}
              </p>
            </div>
          </div>

          {/* Participant Type & Created As */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-sm text-gray-500 mb-1">Participant Type</p>
              <Badge className={cn(typeConfig.bgColor, typeConfig.color, "border-0")}>
                {typeConfig.label}
              </Badge>
            </div>
            {isOnboardedRecord(record) && record.created_as && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Created As</p>
                <Badge
                  className={cn(
                    roleTypeConfig[record.created_as]?.bgColor || "bg-gray-100",
                    roleTypeConfig[record.created_as]?.color || "text-gray-700",
                    "border-0"
                  )}
                >
                  {roleTypeConfig[record.created_as]?.label || record.created_as}
                </Badge>
              </div>
            )}
          </div>

          {/* User ID (for onboarded) */}
          {isOnboardedRecord(record) && record.user_id && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500 mb-1">User ID</p>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <code className="text-xs text-gray-700 flex-1 truncate">
                  {record.user_id}
                </code>
                <button
                  onClick={handleCopyUserId}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy user ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Source File Info */}
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500 mb-2">Source</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileSpreadsheet className="w-4 h-4 text-gray-400" />
              <span className="truncate">{record.source_file}</span>
              {record.source_sheet && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>Sheet: {record.source_sheet}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
