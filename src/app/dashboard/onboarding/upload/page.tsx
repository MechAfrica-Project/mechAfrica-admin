"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOnboardStore } from "@/stores/useOnboardStore";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { toast } from "sonner";
import { UploadDropzone } from "../_components/upload-dropzone";
import { UploadOptionsForm, UploadOptions } from "../_components/upload-options";

export default function UploadPage() {
  const router = useRouter();
  const { setTitle } = useHeaderStore();

  // Store state
  const isUploading = useOnboardStore((s) => s.isUploading);
  const uploadProgress = useOnboardStore((s) => s.uploadProgress);
  const uploadError = useOnboardStore((s) => s.uploadError);
  const uploadFile = useOnboardStore((s) => s.uploadFile);
  const clearUploadError = useOnboardStore((s) => s.clearUploadError);

  // Local state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<UploadOptions>({
    dryRun: true,
    skipDuplicates: true,
    onboardFarmers: true,
    onboardProviders: false,
    onboardMixedRoles: true,
    mixedRoleAsType: "farmer",
  });

  // Set page title
  useEffect(() => {
    setTitle("Upload");
  }, [setTitle]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    clearUploadError();
  }, [clearUploadError]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const jobId = await uploadFile(selectedFile, {
      dryRun: options.dryRun,
      skipDuplicates: options.skipDuplicates,
      onboardFarmers: options.onboardFarmers,
      onboardProviders: options.onboardProviders,
      onboardMixedRoles: options.onboardMixedRoles,
      mixedRoleAsType: options.mixedRoleAsType,
    });

    if (jobId) {
      toast.success("File uploaded successfully! Processing started.");
      router.push(`/dashboard/onboarding/jobs/${jobId}`);
    } else if (uploadError) {
      toast.error(uploadError);
    }
  };

  return (
    <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00594C] flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bulk User Onboarding
              </h1>
              <p className="text-gray-500">
                Import farmers and service providers from Excel files
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Upload Section - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#00594C]" />
                  Upload Excel File
                </CardTitle>
                <CardDescription>
                  Drag and drop your Excel file or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadDropzone
                  onFileSelect={handleFileSelect}
                  disabled={isUploading}
                />
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
              <Card className="border-[#00594C]/20 bg-[#00594C]/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#00594C] flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Uploading File...
                      </h3>
                      <p className="text-sm text-gray-500">
                        Please wait while we upload your file
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-[#00594C]">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Upload Error */}
            {uploadError && !isUploading && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-700">Upload Failed</p>
                    <p className="text-sm text-red-600">{uploadError}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearUploadError}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* File Selected Confirmation */}
            {selectedFile && !isUploading && !uploadError && (
              <Card className="border-[#00594C]/20 bg-[#00594C]/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00594C]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ready to upload •{" "}
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Options Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Options Form */}
            <UploadOptionsForm
              options={options}
              onChange={setOptions}
              disabled={isUploading}
            />

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full h-12 bg-[#00594C] hover:bg-[#00594C]/90 gap-2 text-base"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Start Import
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 space-y-2">
                    <p className="font-medium">Tips for successful import:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>Use the provided template for best results</li>
                      <li>Ensure phone numbers are in valid format</li>
                      <li>Required: First Name, Phone Number</li>
                      <li>
                        Enable &quot;Dry Run&quot; to preview before importing
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dry Run Notice */}
            {options.dryRun && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Dry Run Mode Enabled</p>
                    <p className="text-amber-600">
                      No users will be created. You can review the results and
                      confirm to perform the actual import.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
