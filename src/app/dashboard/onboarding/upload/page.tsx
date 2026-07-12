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
  Brain,
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { useOnboardStore } from "@/stores/useOnboardStore";
import { useHeaderStore } from "@/stores/useHeaderStore";
import { toast } from "sonner";
import { UploadDropzone } from "../_components/upload-dropzone";
import { UploadOptionsForm, UploadOptions } from "../_components/upload-options";
import { AIColumnMappingReview } from "../_components/ai-column-mapping-review";
import { api } from "@/lib/api";
import type { ColumnAnalysisResult, ColumnMapping } from "@/lib/api/types";

// Step IDs
type WizardStep = "select" | "analyzing" | "review" | "uploading";

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
  const [step, setStep] = useState<WizardStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ColumnAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [confirmedMappings, setConfirmedMappings] = useState<ColumnMapping[] | null>(null);
  const [options, setOptions] = useState<UploadOptions>({
    dryRun: true,
    skipDuplicates: true,
    onboardFarmers: true,
    onboardProviders: false,
    onboardMixedRoles: true,
    mixedRoleAsType: "farmer",
  });

  useEffect(() => {
    setTitle("Upload");
  }, [setTitle]);

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setAnalysisResult(null);
      setAnalysisError(null);
      setConfirmedMappings(null);
      clearUploadError();
      setStep("select");
    },
    [clearUploadError]
  );

  // Step 1: AI Column Analysis
  const handleAnalyzeColumns = async () => {
    if (!selectedFile) return;
    setStep("analyzing");
    setAnalysisError(null);

    try {
      const result = await api.analyzeColumns(selectedFile);
      setAnalysisResult(result);
      setStep("review");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(message);
      // If AI analysis fails, fall back to direct upload
      toast.error(`AI analysis failed: ${message}. You can still proceed with direct upload.`);
      setStep("select");
    }
  };

  // Step 2: Mapping Confirmed — trigger actual upload
  const handleMappingConfirmed = async (mappings: ColumnMapping[]) => {
    if (!selectedFile) return;
    setConfirmedMappings(mappings);
    setStep("uploading");

    const jobId = await uploadFile(selectedFile, {
      dryRun: options.dryRun,
      skipDuplicates: options.skipDuplicates,
      onboardFarmers: options.onboardFarmers,
      onboardProviders: options.onboardProviders,
      onboardMixedRoles: options.onboardMixedRoles,
      mixedRoleAsType: options.mixedRoleAsType,
    });

    if (jobId) {
      toast.success("File uploaded! Processing started.");
      router.push(`/dashboard/onboarding/jobs/${jobId}`);
    } else {
      toast.error(uploadError || "Upload failed. Please try again.");
      setStep("review");
    }
  };

  // Skip AI review and go directly
  const handleDirectUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setStep("uploading");
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
      setStep("select");
    }
  };

  // --- RENDER ---

  // AI Review Step
  if (step === "review" && analysisResult) {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00594C] flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Step 2: Review AI Mapping
                  </h1>
                  <Badge className="bg-[#00594C]/10 text-[#00594C] border-[#00594C]/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gemini AI
                  </Badge>
                </div>
                <p className="text-gray-500">
                  Confirm or adjust the column mappings before importing
                </p>
              </div>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-2 mt-4">
              {(["select", "review", "uploading"] as WizardStep[]).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${
                    s === step ? "text-[#00594C]" : i < 1 ? "text-gray-400" : "text-gray-300"
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      i === 0
                        ? "bg-[#00594C] text-white"
                        : s === step
                        ? "bg-[#00594C] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {i === 0 ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                    </div>
                    {s === "select" ? "Upload" : s === "review" ? "Review Mapping" : "Import"}
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Options side panel + mapping review */}
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <AIColumnMappingReview
                analysis={analysisResult}
                onConfirm={handleMappingConfirmed}
                onCancel={() => setStep("select")}
              />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <UploadOptionsForm
                options={options}
                onChange={setOptions}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analyzing step
  if (step === "analyzing") {
    return (
      <div className="min-h-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 overflow-y-auto flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#00594C] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            AI is analyzing your file...
          </h2>
          <p className="text-gray-500 mb-6">
            Gemini is reading your column headers and suggesting the best
            mappings to our database schema
          </p>
          <Progress value={undefined} className="h-1.5 [&>div]:animate-pulse" />
          <p className="text-xs text-gray-400 mt-2">
            {selectedFile?.name}
          </p>
        </div>
      </div>
    );
  }

  // Default: File select + upload step
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
                  Step 1: Upload Excel File
                </CardTitle>
                <CardDescription>
                  Drag and drop your Excel file or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadDropzone
                  onFileSelect={handleFileSelect}
                  disabled={step === "uploading"}
                />
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {step === "uploading" && (
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
            {uploadError && step !== "uploading" && (
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
            {selectedFile && step === "select" && !uploadError && (
              <Card className="border-[#00594C]/20 bg-[#00594C]/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00594C]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ready to analyze •{" "}
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis Banner */}
            {selectedFile && step === "select" && (
              <Card className="border-[#00594C]/20 bg-gradient-to-br from-[#00594C]/5 to-emerald-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00594C]/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#00594C]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        AI-Assisted Import
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Click <strong>"Analyze with AI"</strong> to let Gemini
                        automatically map your file's columns to the correct
                        database fields, even if your headers don't match our
                        template exactly. Zero data loss guaranteed.
                      </p>
                    </div>
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
              disabled={step === "uploading"}
            />

            {/* Primary CTA: AI Analyze */}
            <Button
              onClick={handleAnalyzeColumns}
              disabled={!selectedFile || step === "uploading"}
              className="w-full h-12 bg-[#00594C] hover:bg-[#00594C]/90 gap-2 text-base"
            >
              {step === "uploading" && !isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze with AI
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            {/* Secondary: Skip AI */}
            <Button
              variant="outline"
              onClick={handleDirectUpload}
              disabled={!selectedFile || step === "uploading"}
              className="w-full gap-2 text-sm text-gray-600"
            >
              <Upload className="w-4 h-4" />
              Skip AI — Import Directly
            </Button>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 space-y-2">
                    <p className="font-medium">Tips for successful import:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>Use AI Analysis for non-standard files (AGRA, SAMA)</li>
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
