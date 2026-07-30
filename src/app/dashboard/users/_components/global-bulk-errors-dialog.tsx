"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Download, UploadCloud, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { OnboardProblematicRecord } from "@/lib/api/types";
import { RecordsTable } from "../../onboarding/_components/records-table";
import { EditRecordDialog } from "../../onboarding/_components/edit-record-dialog";

interface GlobalBulkErrorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalBulkErrorsDialog({ open, onOpenChange }: GlobalBulkErrorsDialogProps) {
  const [records, setRecords] = useState<OnboardProblematicRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Edit / Retry state
  const [editingRecord, setEditingRecord] = useState<OnboardProblematicRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllProblematicRecords(1, 100);
      setRecords(response.records || []);
      setTotalRecords(response.count || 0);
    } catch (error) {
      toast.error("Failed to load problematic records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRecords();
    }
  }, [open]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await api.downloadAllProblematicExcel();
    } catch (error) {
      toast.error("Could not download the errors file.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await api.uploadGlobalCorrections(file);
      toast.success(
        `Successfully applied ${result.updated} corrections. Auto-retried ${result.auto_retried}, ${result.retry_successful} successful.`
      );
      fetchRecords(); // Refresh the list
    } catch (error) {
      toast.error("Failed to upload and apply corrections.");
    } finally {
      setIsUploading(false);
      // clear the file input
      event.target.value = '';
    }
  };

  const handleBulkRetryAll = async () => {
    // Only attempt to auto-retry records that failed due to a system error (e.g. database lock)
    // Issues requiring user correction (invalid phone, missing name) cannot be auto-resolved
    const systemResolvableRecords = records.filter(r => r.issue_type === 'creation_error' || r.issue_type === 'validation_error');
    
    if (systemResolvableRecords.length === 0) {
      toast.info("No system-resolvable errors found. Other errors require manual correction.");
      return;
    }
    
    setIsRetryingAll(true);
    toast.info(`Attempting to auto-resolve ${systemResolvableRecords.length} system error(s)...`);
    
    // Group by Job ID to use the bulk retry endpoint efficiently
    const groupedByJob = systemResolvableRecords.reduce((acc, record) => {
      const jid = record.job_id || 'unknown';
      if (!acc[jid]) acc[jid] = [];
      acc[jid].push(record.row_number);
      return acc;
    }, {} as Record<string, number[]>);

    let successCount = 0;
    let failCount = 0;

    try {
      for (const [jobId, rowNumbers] of Object.entries(groupedByJob)) {
        if (jobId === 'unknown') continue;
        const result = await api.bulkRetryRecords(jobId, rowNumbers);
        const succ = result.results.filter(r => r.success).length;
        successCount += succ;
        failCount += (result.results.length - succ);
      }
      
      if (successCount > 0) {
        toast.success(`Bulk retry finished! ${successCount} successfully resolved.`);
      } else if (failCount > 0) {
        toast.error(`Bulk retry finished. ${failCount} failed.`);
      } else {
        toast.info("No records could be processed.");
      }
      fetchRecords();
    } catch (error) {
      toast.error("An error occurred during bulk retry.");
    } finally {
      setIsRetryingAll(false);
    }
  };

  const handleEditRecord = (record: OnboardProblematicRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleRecordActionSuccess = () => {
    // Refresh the list whenever a record is successfully edited, retried, skipped or deleted
    fetchRecords();
  };

  const handleRetryRecord = async (record: OnboardProblematicRecord) => {
    try {
      if (!record.job_id) throw new Error("Missing job_id");
      await api.retryProblematicRecord(record.job_id, record.row_number);
      toast.success("Record successfully retried and resolved.");
      handleRecordActionSuccess();
    } catch (error) {
      toast.error("Failed to retry record.");
      throw error;
    }
  };

  const handleSkipRecord = async (record: OnboardProblematicRecord) => {
    try {
      if (!record.job_id) throw new Error("Missing job_id");
      await api.skipProblematicRecord(record.job_id, record.row_number, "Skipped from global bulk errors");
      toast.success("Record skipped.");
      handleRecordActionSuccess();
    } catch (error) {
      toast.error("Failed to skip record.");
      throw error;
    }
  };

  const handleDeleteRecord = async (record: OnboardProblematicRecord) => {
    // Deleting is technically skipping in this context since we don't have a hard delete endpoint
    return handleSkipRecord(record);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle>Global Bulk Upload Errors</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-2 justify-between items-center bg-gray-50 p-4 rounded-md flex-wrap mt-4">
          <div className="text-sm w-full md:w-auto mb-2 md:mb-0">
            Found <strong>{totalRecords}</strong> unresolved error(s) across all jobs.
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={fetchRecords} disabled={isLoading || isRetryingAll}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} disabled={isDownloading || totalRecords === 0 || isRetryingAll}>
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
            {records.some(r => r.issue_type === 'creation_error' || r.issue_type === 'validation_error') && (
              <Button 
                size="sm" 
                variant="default" 
                onClick={handleBulkRetryAll} 
                disabled={isRetryingAll || isLoading}
                className="bg-[#00594C] hover:bg-[#004a40]"
              >
                {isRetryingAll ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><RotateCcw className="w-4 h-4 mr-2" /> Auto-Fix System Errors</>
                )}
              </Button>
            )}
            <div className="relative">
              <Button size="sm" variant="secondary" disabled={isUploading || isRetryingAll}>
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Corrections
              </Button>
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
                disabled={isUploading || isRetryingAll}
              />
            </div>
          </div>
        </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50/50">
          <RecordsTable
            records={records}
            type="problematic"
            isLoading={isLoading}
            editable={true}
            onEditRecord={handleEditRecord}
            onRetryRecord={handleRetryRecord}
            onSkipRecord={handleSkipRecord}
            onDeleteRecord={handleDeleteRecord}
            emptyMessage="No problematic records found. All good!"
          />
        </div>

        <EditRecordDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          record={editingRecord}
          jobId={editingRecord?.job_id || ""}
          onSave={handleRecordActionSuccess}
          onRetrySuccess={handleRecordActionSuccess}
          onSkip={handleRecordActionSuccess}
          onDelete={handleRecordActionSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
