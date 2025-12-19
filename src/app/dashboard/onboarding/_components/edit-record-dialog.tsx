"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  Loader2,
  Save,
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileSpreadsheet,
  RotateCcw,
  SkipForward,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOnboardStore } from "@/stores/useOnboardStore";
import type { ProblematicRecord, IssueType, RetryResult } from "@/lib/api/types";

interface EditRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: ProblematicRecord | null;
  jobId: string;
  onSave?: (updatedRecord: ProblematicRecord) => void;
  onRetrySuccess?: (result: RetryResult) => void;
  onSkip?: () => void;
  onDelete?: () => void;
}

const issueTypeLabels: Record<IssueType, string> = {
  missing_phone: "Missing Phone Number",
  invalid_phone: "Invalid Phone Format",
  missing_name: "Missing Name",
  unknown_type: "Unknown Participant Type",
  duplicate_phone: "Duplicate Phone Number",
  duplicate_id: "Duplicate ID Number",
  creation_error: "Creation Error",
  validation_error: "Validation Error",
};

const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

// Map form fields to Excel column names (backend expects these)
const FIELD_TO_EXCEL_COLUMN: Record<string, string> = {
  full_name: "Name of Participant",
  phone_number: "Telephone Number",
  region: "Region/State",
  district: "District",
  community: "Community",
  ghana_card_number: "Ghana Card Number",
  gender: "Gender",
  activity: "Activity",
};

interface FormData {
  full_name: string;
  phone_number: string;
  region: string;
  district: string;
  community: string;
  ghana_card_number: string;
  gender: string;
  activity: string;
}

export function EditRecordDialog({
  isOpen,
  onOpenChange,
  record,
  jobId,
  onSave,
  onRetrySuccess,
  onSkip,
  onDelete,
}: EditRecordDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone_number: "",
    region: "",
    district: "",
    community: "",
    ghana_card_number: "",
    gender: "",
    activity: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { updateProblematicRecord, retryRecord, skipRecord, deleteRecord } = useOnboardStore();

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      const rawData = record.raw_data || {};
      setFormData({
        full_name: rawData["Name of Participant"] || rawData["full_name"] || "",
        phone_number: rawData["Telephone Number"] || rawData["phone_number"] || "",
        region: rawData["Region/State"] || rawData["region"] || "",
        district: rawData["District"] || rawData["district"] || "",
        community: rawData["Community"] || rawData["community"] || "",
        ghana_card_number: rawData["Ghana Card Number"] || rawData["ghana_card_number"] || "",
        gender: rawData["Gender"] || rawData["gender"] || "",
        activity: rawData["Activity"] || rawData["activity"] || "",
      });
      setValidationErrors({});
    }
  }, [record]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      errors.full_name = "Name is required";
    }

    if (!formData.phone_number?.trim()) {
      errors.phone_number = "Phone number is required";
    } else {
      // Basic phone validation for Ghana numbers
      const phoneClean = formData.phone_number.replace(/\D/g, "");
      if (phoneClean.length < 9 || phoneClean.length > 12) {
        errors.phone_number = "Invalid phone number format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Convert form data to backend format (Excel column names)
  const formDataToBackendFormat = (): Record<string, string> => {
    const backendData: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        const backendKey = FIELD_TO_EXCEL_COLUMN[key] || key;
        backendData[backendKey] = value;
      }
    });

    return backendData;
  };

  const handleSave = async () => {
    if (!record) return;

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const backendData = formDataToBackendFormat();
      const updatedRecord = await updateProblematicRecord(jobId, record.row_number, backendData);

      if (updatedRecord) {
        toast.success("Record updated successfully");
        onSave?.(updatedRecord);
      } else {
        toast.error("Failed to update record");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update record";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndRetry = async () => {
    if (!record) return;

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsRetrying(true);
    try {
      // First save the changes
      const backendData = formDataToBackendFormat();
      const updatedRecord = await updateProblematicRecord(jobId, record.row_number, backendData);

      if (!updatedRecord) {
        toast.error("Failed to update record");
        return;
      }

      // Then retry processing
      const result = await retryRecord(jobId, record.row_number);

      if (result) {
        if (result.success) {
          toast.success(
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Record processed successfully as {result.created_as}</span>
            </div>
          );
          onRetrySuccess?.(result);
          onOpenChange(false);
        } else {
          toast.error(result.message || "Record still has issues");
          if (result.issue) {
            setValidationErrors({ general: result.issue });
          }
        }
      } else {
        toast.error("Failed to retry record");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process record";
      toast.error(message);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetryOnly = async () => {
    if (!record) return;

    setIsRetrying(true);
    try {
      const result = await retryRecord(jobId, record.row_number);

      if (result) {
        if (result.success) {
          toast.success(`Record processed successfully as ${result.created_as}`);
          onRetrySuccess?.(result);
          onOpenChange(false);
        } else {
          toast.error(result.message || "Record still has issues");
          if (result.issue) {
            setValidationErrors({ general: result.issue });
          }
        }
      } else {
        toast.error("Failed to retry record");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retry record";
      toast.error(message);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSkip = async () => {
    if (!record) return;

    setIsSkipping(true);
    try {
      const success = await skipRecord(jobId, record.row_number, "Manually skipped by admin");

      if (success) {
        toast.success("Record moved to skipped list");
        onSkip?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to skip record");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to skip record";
      toast.error(message);
    } finally {
      setIsSkipping(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;

    if (!window.confirm("Are you sure you want to permanently delete this record?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteRecord(jobId, record.row_number);

      if (success) {
        toast.success("Record deleted successfully");
        onDelete?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete record";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const isEdited = record?.raw_data?.["_edited"] === "true";
  const isLoading = isSaving || isRetrying || isSkipping || isDeleting;

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <User className="w-5 h-5 text-[#00594C]" />
            <span>Edit Record - Row {record.row_number}</span>
            {isEdited && (
              <Badge className="bg-blue-100 text-blue-700 border-0">Edited</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Correct the data below to resolve the issue and reprocess this record.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-4">
            {/* Issue Banner */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-red-700">Issue:</span>
                  <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                    {issueTypeLabels[record.issue_type] || record.issue_type}
                  </Badge>
                </div>
                <p className="text-sm text-red-600 break-words">{record.issue}</p>
              </div>
            </div>

            {/* Source Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[200px]" title={record.source_file}>
                {record.source_file}
              </span>
              <span>•</span>
              <span>Sheet: {record.source_sheet}</span>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Enter full name"
                  className={cn(validationErrors.full_name && "border-red-500")}
                  disabled={isLoading}
                />
                {validationErrors.full_name && (
                  <p className="text-sm text-red-500">{validationErrors.full_name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  placeholder="e.g., 0241234567 or +233241234567"
                  className={cn(validationErrors.phone_number && "border-red-500")}
                  disabled={isLoading}
                />
                {validationErrors.phone_number && (
                  <p className="text-sm text-red-500">{validationErrors.phone_number}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter a valid Ghana phone number (10 digits starting with 0, or with +233)
                </p>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Region
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleInputChange("region", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {GHANA_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="Enter district"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Community */}
              <div className="space-y-2">
                <Label htmlFor="community">Community</Label>
                <Input
                  id="community"
                  value={formData.community}
                  onChange={(e) => handleInputChange("community", e.target.value)}
                  placeholder="Enter community name"
                  disabled={isLoading}
                />
              </div>

              {/* Ghana Card & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ghana_card_number" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    Ghana Card Number
                  </Label>
                  <Input
                    id="ghana_card_number"
                    value={formData.ghana_card_number}
                    onChange={(e) => handleInputChange("ghana_card_number", e.target.value)}
                    placeholder="e.g., GHA-XXXXXXXXX-X"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activity */}
              <div className="space-y-2">
                <Label htmlFor="activity">Activity / Role</Label>
                <Input
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => handleInputChange("activity", e.target.value)}
                  placeholder="e.g., Producer (Farmer), Service Provider, Both"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  This determines if the person is a farmer, service provider, or both.
                </p>
              </div>
            </div>

            {/* Original Data Reference */}
            {record.raw_data && Object.keys(record.raw_data).length > 0 && (
              <div className="border-t pt-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
                    View Original Data
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(record.raw_data)
                        .filter(([key]) => !key.startsWith("_"))
                        .map(([key, value]) => (
                          <div key={key} className="min-w-0">
                            <dt className="text-gray-500 truncate">{key}:</dt>
                            <dd className="font-medium text-gray-700 break-words">{value || "-"}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                </details>
              </div>
            )}

            {/* General Error */}
            {validationErrors.general && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{validationErrors.general}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
          {/* Mobile: Stack buttons vertically */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Primary Action */}
            <Button
              onClick={handleSaveAndRetry}
              disabled={isLoading}
              className="w-full bg-[#00594C] hover:bg-[#00594C]/90"
            >
              {isRetrying && !isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Save & Retry
            </Button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                variant="outline"
                className="text-[#00594C] border-[#00594C]/30"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleRetryOnly}
                disabled={isLoading}
                className="text-blue-600 border-blue-200"
              >
                {isRetrying && !isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Retry
              </Button>
            </div>

            {/* Tertiary Actions */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  {isSkipping ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <SkipForward className="w-4 h-4 mr-1" />
                  )}
                  Skip
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            {/* Destructive Actions - Left */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={isLoading}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                {isSkipping ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <SkipForward className="w-4 h-4 mr-1" />
                )}
                Skip
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                Delete
              </Button>
            </div>

            {/* Main Actions - Right */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryOnly}
                disabled={isLoading}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {isRetrying && !isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                )}
                Retry Only
              </Button>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="text-[#00594C] border-[#00594C]/30 hover:bg-[#00594C]/10"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Save Only
              </Button>

              <Button
                onClick={handleSaveAndRetry}
                disabled={isLoading}
                size="sm"
                className="bg-[#00594C] hover:bg-[#00594C]/90"
              >
                {isRetrying && !isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                )}
                Save & Retry
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
