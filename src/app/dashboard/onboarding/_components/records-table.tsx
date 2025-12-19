"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Phone,
  MapPin,
  Download,
  FileSpreadsheet,
  Edit2,
  Eye,
  MoreHorizontal,
  RotateCcw,
  SkipForward,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OnboardedRecord,
  SkippedRecord,
  ProblematicRecord,
  OnboardRecordsPagination,
  ParticipantType,
  RoleType,
  IssueType,
} from "@/lib/api/types";

type RecordType = "onboarded" | "skipped" | "problematic";

interface RecordsTableProps {
  records: OnboardedRecord[] | SkippedRecord[] | ProblematicRecord[];
  pagination?: OnboardRecordsPagination | null;
  onPageChange?: (page: number) => void;
  onDownload?: () => void;
  onEditRecord?: (record: ProblematicRecord) => void;
  onViewRecord?: (record: OnboardedRecord | SkippedRecord) => void;
  onRetryRecord?: (record: ProblematicRecord) => Promise<void>;
  onSkipRecord?: (record: ProblematicRecord) => Promise<void>;
  onDeleteRecord?: (record: ProblematicRecord) => Promise<void>;
  onBulkRetry?: (records: ProblematicRecord[]) => Promise<void>;
  isLoading?: boolean;
  emptyMessage?: string;
  type: RecordType;
  editable?: boolean;
  showBulkActions?: boolean;
}

const participantTypeConfig: Record<
  ParticipantType,
  { label: string; color: string }
> = {
  farmer_only: { label: "Farmer", color: "bg-green-100 text-green-700" },
  service_provider_only: { label: "Provider", color: "bg-blue-100 text-blue-700" },
  farmer_and_provider: { label: "Both", color: "bg-purple-100 text-purple-700" },
  unknown: { label: "Unknown", color: "bg-gray-100 text-gray-700" },
};

const roleTypeConfig: Record<RoleType, { label: string; color: string }> = {
  farmer: { label: "Farmer", color: "bg-green-100 text-green-700" },
  provider: { label: "Provider", color: "bg-blue-100 text-blue-700" },
};

const issueTypeConfig: Record<IssueType, { label: string; color: string }> = {
  missing_phone: { label: "Missing Phone", color: "text-red-600" },
  invalid_phone: { label: "Invalid Phone", color: "text-red-600" },
  missing_name: { label: "Missing Name", color: "text-red-600" },
  unknown_type: { label: "Unknown Type", color: "text-amber-600" },
  duplicate_phone: { label: "Duplicate Phone", color: "text-amber-600" },
  duplicate_id: { label: "Duplicate ID", color: "text-amber-600" },
  creation_error: { label: "Creation Error", color: "text-red-600" },
  validation_error: { label: "Validation Error", color: "text-red-600" },
};

function isOnboardedRecord(record: OnboardedRecord | SkippedRecord | ProblematicRecord): record is OnboardedRecord {
  return "created_as" in record || "user_id" in record;
}

function isSkippedRecord(record: OnboardedRecord | SkippedRecord | ProblematicRecord): record is SkippedRecord {
  return "reason" in record && !("issue" in record);
}

function isProblematicRecord(record: OnboardedRecord | SkippedRecord | ProblematicRecord): record is ProblematicRecord {
  return "issue" in record && "issue_type" in record;
}

export function RecordsTable({
  records,
  pagination,
  onPageChange,
  onDownload,
  onEditRecord,
  onViewRecord,
  onRetryRecord,
  onSkipRecord,
  onDeleteRecord,
  onBulkRetry,
  isLoading = false,
  emptyMessage = "No records found",
  type,
  editable = false,
  showBulkActions = false,
}: RecordsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [bulkRetrying, setBulkRetrying] = useState(false);

  const toggleRowSelection = (rowNumber: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredRecords.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRecords.map((r) => r.row_number)));
    }
  };

  const handleRetryRecord = async (record: ProblematicRecord) => {
    if (!onRetryRecord) return;
    setActionLoading((prev) => ({ ...prev, [record.row_number]: "retry" }));
    try {
      await onRetryRecord(record);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[record.row_number];
        return next;
      });
    }
  };

  const handleSkipRecord = async (record: ProblematicRecord) => {
    if (!onSkipRecord) return;
    setActionLoading((prev) => ({ ...prev, [record.row_number]: "skip" }));
    try {
      await onSkipRecord(record);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[record.row_number];
        return next;
      });
    }
  };

  const handleDeleteRecord = async (record: ProblematicRecord) => {
    if (!onDeleteRecord) return;
    if (!window.confirm("Are you sure you want to permanently delete this record?")) {
      return;
    }
    setActionLoading((prev) => ({ ...prev, [record.row_number]: "delete" }));
    try {
      await onDeleteRecord(record);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[record.row_number];
        return next;
      });
    }
  };

  const handleBulkRetry = async () => {
    if (!onBulkRetry || selectedRows.size === 0) return;
    const selectedRecords = filteredRecords.filter(
      (r) => selectedRows.has(r.row_number) && isProblematicRecord(r)
    ) as ProblematicRecord[];

    if (selectedRecords.length === 0) return;

    setBulkRetrying(true);
    try {
      await onBulkRetry(selectedRecords);
      setSelectedRows(new Set());
    } finally {
      setBulkRetrying(false);
    }
  };

  const filteredRecords = searchQuery
    ? records.filter((record) => {
      const name = "full_name" in record ? record.full_name : "";
      const phone = "phone_number" in record ? record.phone_number : "";
      return (
        name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone?.includes(searchQuery)
      );
    })
    : records;

  const getParticipantTypeBadge = (participantType: ParticipantType) => {
    const config = participantTypeConfig[participantType] || participantTypeConfig.unknown;
    return (
      <Badge className={cn(config.color, "border-0")}>
        {config.label}
      </Badge>
    );
  };

  const getCreatedAsBadge = (createdAs: RoleType) => {
    const config = roleTypeConfig[createdAs] || roleTypeConfig.farmer;
    return (
      <Badge className={cn(config.color, "border-0")}>
        {config.label}
      </Badge>
    );
  };

  const getIssueTypeBadge = (issueType: IssueType) => {
    const config = issueTypeConfig[issueType] || { label: issueType, color: "text-gray-600" };
    return (
      <span className={cn("text-sm font-medium", config.color)}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-100 border-b" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white border-b last:border-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {showBulkActions && type === "problematic" && selectedRows.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkRetry}
              disabled={bulkRetrying}
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {bulkRetrying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Retry Selected ({selectedRows.size})
            </Button>
          )}
          {onDownload && records.length > 0 && (
            <Button variant="outline" size="sm" onClick={onDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
          {pagination && pagination.count !== undefined && (
            <span className="text-sm text-gray-500">
              {(pagination.count ?? 0).toLocaleString()} records
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-gray-50">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-1">{emptyMessage}</p>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Records will appear here after processing"}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {showBulkActions && type === "problematic" && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === filteredRecords.length && filteredRecords.length > 0}
                      onCheckedChange={toggleAllSelection}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead className="w-16">Row</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                {type === "onboarded" && <TableHead>Created As</TableHead>}
                {type === "skipped" && <TableHead>Reason</TableHead>}
                {type === "problematic" && <TableHead>Issue</TableHead>}
                <TableHead>Source</TableHead>
                <TableHead className="w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => {
                const rowNumber = record.row_number;
                const fullName = "full_name" in record ? record.full_name : "";
                const phoneNumber = "phone_number" in record ? record.phone_number : "";
                const participantType = "participant_type" in record ? record.participant_type : "unknown";
                const region = "region" in record ? record.region : "";
                const district = "district" in record ? record.district : "";
                const sourceFile = "source_file" in record ? record.source_file : "";
                const sourceSheet = "source_sheet" in record ? record.source_sheet : "";

                const isRecordEdited = isProblematicRecord(record) && record.raw_data?.["_edited"] === "true";
                const recordAction = actionLoading[rowNumber];

                return (
                  <TableRow key={`${rowNumber}-${index}`} className={cn(isRecordEdited && "bg-blue-50/50")}>
                    {showBulkActions && type === "problematic" && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(rowNumber)}
                          onCheckedChange={() => toggleRowSelection(rowNumber)}
                          aria-label={`Select row ${rowNumber}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {rowNumber}
                        {isRecordEdited && (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] px-1">
                            Edited
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#00594C]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-[#00594C]">
                            {(fullName?.[0] || "?").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {fullName || "-"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{phoneNumber || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getParticipantTypeBadge(participantType as ParticipantType)}
                    </TableCell>
                    <TableCell>
                      {region || district ? (
                        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {[district, region].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Onboarded specific column */}
                    {type === "onboarded" && isOnboardedRecord(record) && (
                      <TableCell>
                        {getCreatedAsBadge(record.created_as)}
                      </TableCell>
                    )}

                    {/* Skipped specific column */}
                    {type === "skipped" && isSkippedRecord(record) && (
                      <TableCell>
                        <span className="text-sm text-amber-600">
                          {record.reason || "-"}
                        </span>
                      </TableCell>
                    )}

                    {/* Problematic specific column */}
                    {type === "problematic" && isProblematicRecord(record) && (
                      <TableCell>
                        <div className="space-y-1">
                          {getIssueTypeBadge(record.issue_type)}
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {record.issue}
                          </p>
                        </div>
                      </TableCell>
                    )}

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[100px]" title={sourceFile}>
                          {sourceSheet || sourceFile || "-"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Button for Onboarded/Skipped */}
                        {(type === "onboarded" || type === "skipped") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isOnboardedRecord(record) || isSkippedRecord(record)) {
                                onViewRecord?.(record);
                              }
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#00594C] hover:bg-[#00594C]/10"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {/* Actions for Problematic Records */}
                        {type === "problematic" && isProblematicRecord(record) && (
                          <>
                            {/* Edit Button */}
                            {editable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditRecord?.(record);
                                }}
                                disabled={!!recordAction}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-[#00594C] hover:bg-[#00594C]/10"
                                title="Edit record"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            {/* More Actions Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!!recordAction}
                                  className="h-8 w-8 p-0 text-gray-500"
                                >
                                  {recordAction ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="w-4 h-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {onRetryRecord && (
                                  <DropdownMenuItem
                                    onClick={() => handleRetryRecord(record)}
                                    className="text-blue-600"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Retry Record
                                  </DropdownMenuItem>
                                )}
                                {onSkipRecord && (
                                  <DropdownMenuItem
                                    onClick={() => handleSkipRecord(record)}
                                    className="text-amber-600"
                                  >
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    Skip Record
                                  </DropdownMenuItem>
                                )}
                                {(onRetryRecord || onSkipRecord) && onDeleteRecord && (
                                  <DropdownMenuSeparator />
                                )}
                                {onDeleteRecord && (
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteRecord(record)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Record
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && (pagination.pages ?? 0) > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500">
            Page {pagination.page ?? 1} of {pagination.pages ?? 1}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(pagination.page ?? 1) <= 1}
              onClick={() => onPageChange?.((pagination.page ?? 1) - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(pagination.page ?? 1) >= (pagination.pages ?? 1)}
              onClick={() => onPageChange?.((pagination.page ?? 1) + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
