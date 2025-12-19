"use client";

import React, { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
];

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export function UploadDropzone({
  onFileSelect,
  accept = ".xlsx,.xls,.csv",
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      const isValidType =
        ACCEPTED_TYPES.includes(file.type) ||
        ACCEPTED_EXTENSIONS.includes(extension);

      if (!isValidType) {
        return `Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file.`;
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return `File is too large. Maximum size is ${maxSizeMB}MB.`;
      }

      return null;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[280px] p-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
          isDragOver && !disabled
            ? "border-[#00594C] bg-[#00594C]/5 scale-[1.02]"
            : "border-gray-300 hover:border-[#00594C]/50 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          error && "border-red-300 bg-red-50",
          selectedFile && !error && "border-[#00594C] bg-[#00594C]/5"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {selectedFile && !error ? (
          // File Selected State
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#00594C]/10 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-[#00594C]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#00594C] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {formatFileSize(selectedFile.size)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Remove file
            </Button>
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-medium text-red-700 mb-2">Upload Error</p>
            <p className="text-sm text-red-600 mb-4 max-w-md">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setError(null);
              }}
              className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              Try again
            </Button>
          </div>
        ) : (
          // Default State
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-200",
                isDragOver ? "bg-[#00594C] scale-110" : "bg-gray-100"
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8 transition-colors duration-200",
                  isDragOver ? "text-white" : "text-gray-400"
                )}
              />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragOver ? "Drop your file here" : "Drag and drop your file"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse from your computer
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Supports Excel (.xlsx, .xls) and CSV files up to {Math.round(maxSize / (1024 * 1024))}MB</span>
            </div>
          </div>
        )}
      </div>

      {/* File Type Hints */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>.xlsx</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>.xls</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>.csv</span>
        </div>
      </div>
    </div>
  );
}
