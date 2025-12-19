/**
 * MechAfrica Bulk Onboarding API - TypeScript Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the
 * Bulk Onboarding API integration.
 *
 * @version 1.0.0
 * @author MechAfrica Backend Team
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Status of an onboarding job
 */
export type OnboardJobStatus =
  | 'pending'      // Job created, waiting to start processing
  | 'processing'   // Job is currently processing rows
  | 'analyzing'    // Job is analyzing the file
  | 'completed'    // Job finished successfully
  | 'failed'       // Job failed with an error
  | 'confirmed'    // Dry-run job was confirmed for actual import
  | 'cancelled';   // Job was cancelled by user

/**
 * Type of participant based on activity analysis
 */
export type ParticipantType =
  | 'farmer_only'           // Person is only a farmer
  | 'service_provider_only' // Person is only a service provider
  | 'farmer_and_provider'   // Person is both farmer and service provider
  | 'unknown';              // Could not determine type from activity

/**
 * Type of issue/error for problematic records
 */
export type IssueType =
  | 'missing_phone'     // Phone number field is empty
  | 'invalid_phone'     // Phone number format is invalid
  | 'missing_name'      // Name field is empty
  | 'unknown_type'      // Cannot determine participant type
  | 'duplicate_phone'   // Phone number already exists in database
  | 'duplicate_id'      // ID number already exists in database
  | 'creation_error'    // Failed to create record in database
  | 'validation_error'; // Other validation failure

/**
 * WebSocket event types for progress updates
 */
export type OnboardEventType =
  | 'processing_started'    // Job processing has begun
  | 'counting_complete'     // Finished counting total rows
  | 'progress_update'       // Regular progress update (every 50 rows)
  | 'processing_completed'  // Job completed successfully
  | 'processing_failed'     // Job failed with error
  | 'job_cancelled';        // Job was cancelled

/**
 * Role type for mixed role handling
 */
export type RoleType = 'farmer' | 'provider';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for an onboarding job
 */
export interface OnboardJobConfig {
  /** If true, only analyze without creating records */
  dry_run: boolean;
  /** If true, skip records with duplicate phone/ID */
  skip_duplicates: boolean;
  /** If true, process farmer records */
  onboard_farmers: boolean;
  /** If true, process service provider records */
  onboard_providers: boolean;
  /** If true, process mixed role records */
  onboard_mixed_roles: boolean;
  /** Create mixed roles as this type */
  mixed_role_as_type: RoleType;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: OnboardJobConfig = {
  dry_run: true,
  skip_duplicates: true,
  onboard_farmers: true,
  onboard_providers: false,
  onboard_mixed_roles: true,
  mixed_role_as_type: 'farmer',
};

// ============================================================================
// PROGRESS & RESULT TYPES
// ============================================================================

/**
 * Progress tracking for an onboarding job
 */
export interface OnboardJobProgress {
  /** Total rows in file (excluding header) */
  total_rows: number;
  /** Rows processed so far */
  processed_rows: number;
  /** Farmers created (or would be created if dry run) */
  farmers_created: number;
  /** Providers created */
  providers_created: number;
  /** Records skipped (duplicates, filtered) */
  skipped: number;
  /** Records with errors */
  errors: number;
  /** 0-100 percentage */
  percent_complete: number;
  /** Current file being processed */
  current_file?: string;
  /** Current sheet being processed */
  current_sheet?: string;
  /** Count by participant type */
  type_breakdown?: Record<ParticipantType, number>;
  /** Count by region */
  region_breakdown?: Record<string, number>;
}

/**
 * Summary of results (numbers only, no record arrays)
 */
export interface OnboardResultSummary {
  total_rows: number;
  processed: number;
  farmers_created: number;
  providers_created: number;
  skipped: number;
  errors: number;
}

/**
 * A successfully onboarded record
 */
export interface OnboardedRecord {
  /** Original row number in Excel file */
  row_number: number;
  /** Name of the source Excel file */
  source_file: string;
  /** Name of the sheet in the Excel file */
  source_sheet: string;
  /** Full name of the participant */
  full_name: string;
  /** Formatted phone number (e.g., +233XXXXXXXXX) */
  phone_number: string;
  /** Region name */
  region: string;
  /** District name */
  district: string;
  /** Type of participant */
  participant_type: ParticipantType;
  /** What they were created as */
  created_as: RoleType;
  /** UUID of created user (empty string if dry run) */
  user_id: string;
}

/**
 * A skipped record (not an error, intentionally skipped)
 */
export interface SkippedRecord {
  /** Original row number in Excel file */
  row_number: number;
  /** Name of the source Excel file */
  source_file: string;
  /** Name of the sheet in the Excel file */
  source_sheet: string;
  /** Full name of the participant */
  full_name: string;
  /** Phone number */
  phone_number: string;
  /** Why the record was skipped */
  reason: string;
  /** Type of participant */
  participant_type: ParticipantType;
}

/**
 * A problematic/error record
 */
export interface ProblematicRecord {
  /** Original row number in Excel file */
  row_number: number;
  /** Name of the source Excel file */
  source_file: string;
  /** Name of the sheet in the Excel file */
  source_sheet: string;
  /** Description of the issue */
  issue: string;
  /** Category of issue */
  issue_type: IssueType;
  /** Original data from Excel row (key-value pairs) */
  raw_data: Record<string, string>;
}

/**
 * Result of retrying a single record
 */
export interface RetryResult {
  /** Row number that was retried */
  row_number: number;
  /** Whether the retry was successful */
  success: boolean;
  /** Human-readable message */
  message: string;
  /** User ID if created (empty if dry run or failed) */
  user_id?: string;
  /** What the record was created as */
  created_as?: RoleType;
  /** Issue type if failed */
  issue_type?: IssueType;
  /** Issue description if failed */
  issue?: string;
}

/**
 * Result of bulk retrying multiple records
 */
export interface BulkRetryResult {
  /** Total number of records attempted */
  total_attempted: number;
  /** Number of successful retries */
  successful: number;
  /** Number of failed retries */
  failed: number;
  /** Individual results for each record */
  results: RetryResult[];
}

/**
 * Complete result of an onboarding job
 */
export interface OnboardJobResult {
  total_rows: number;
  processed: number;
  farmers_created: number;
  providers_created: number;
  skipped: number;
  errors: number;
  duplicate_phones?: string[];
  duplicate_ids?: string[];
  error_details?: string[];
  type_breakdown?: Record<ParticipantType, number>;
  region_breakdown?: Record<string, number>;
  onboarded_records?: OnboardedRecord[];
  skipped_records?: SkippedRecord[];
  problematic_records?: ProblematicRecord[];
}

// ============================================================================
// JOB TYPES
// ============================================================================

/**
 * Complete onboarding job object
 */
export interface OnboardJob {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by: string;
  status: OnboardJobStatus;
  file_name: string;
  file_url: string;
  file_path?: string;
  file_bucket?: string;
  file_size: number;
  config: OnboardJobConfig;
  progress: OnboardJobProgress;
  result?: OnboardJobResult;
  problematic_file_url?: string;
  problematic_file_path?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  final_import_farmers: number;
  final_import_providers: number;
}

/**
 * Job summary for list views
 */
export interface OnboardJobSummary {
  id: string;
  status: OnboardJobStatus;
  file_name: string;
  config: OnboardJobConfig;
  progress: OnboardJobProgress;
  result_summary?: OnboardResultSummary;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/**
 * Upload request configuration (form data fields)
 */
export interface UploadConfig {
  /** Excel file to upload */
  file: File;
  /** If true, only analyze without creating records */
  dry_run?: boolean;
  /** If true, skip records with duplicate phone/ID */
  skip_duplicates?: boolean;
  /** If true, process farmer records */
  onboard_farmers?: boolean;
  /** If true, process service provider records */
  onboard_providers?: boolean;
  /** If true, process mixed role records */
  onboard_mixed_roles?: boolean;
  /** Create mixed roles as this type */
  mixed_role_as_type?: RoleType;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Request to update a problematic record
 */
export interface UpdateRecordRequest {
  /** Key-value pairs of fields to update */
  updated_data: Record<string, string>;
}

/**
 * Request to retry multiple records
 */
export interface BulkRetryRequest {
  /** List of row numbers to retry */
  row_numbers: number[];
}

/**
 * Request to skip a record
 */
export interface SkipRecordRequest {
  /** Optional reason for skipping */
  reason?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Paginated response data
 */
export interface PaginatedData<T> {
  records: T[];
  count: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Upload response data
 */
export interface UploadResponseData {
  job_id: string;
  status: OnboardJobStatus;
  file_name: string;
  file_url: string;
  file_size: number;
  config: OnboardJobConfig;
  message: string;
}

/**
 * List jobs response data
 */
export interface ListJobsResponseData {
  jobs: OnboardJobSummary[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Progress response data
 */
export interface ProgressResponseData {
  job_id: string;
  status: OnboardJobStatus;
  file_name: string;
  progress: OnboardJobProgress;
  started_at?: string;
  is_final: boolean;
}

/**
 * Job summary response data
 */
export interface SummaryResponseData {
  job_id: string;
  status: OnboardJobStatus;
  file_name: string;
  config: OnboardJobConfig;
  progress: OnboardJobProgress;
  started_at?: string;
  completed_at?: string;
  can_confirm: boolean;
  is_dry_run: boolean;
  result_summary?: OnboardResultSummary;
  onboarded?: {
    count: number;
    by_type: Record<RoleType, number>;
    by_region: Record<string, number>;
  };
  skipped?: {
    count: number;
    by_reason: Record<string, number>;
  };
  errors?: {
    count: number;
    by_type: Record<IssueType, number>;
  };
  type_breakdown?: Record<ParticipantType, number>;
  region_breakdown?: Record<string, number>;
  problematic_download_url?: string;
}

/**
 * Onboarded records response data
 */
export interface OnboardedRecordsResponseData extends PaginatedData<OnboardedRecord> {
  by_type: Record<RoleType, number>;
  by_region: Record<string, number>;
}

/**
 * Skipped records response data
 */
export interface SkippedRecordsResponseData extends PaginatedData<SkippedRecord> {
  by_reason: Record<string, number>;
}

/**
 * Problematic records response data
 */
export interface ProblematicRecordsResponseData extends PaginatedData<ProblematicRecord> {
  by_type: Record<IssueType, number>;
  download_url?: string;
}

/**
 * Result response data
 */
export interface ResultResponseData {
  job_id: string;
  status: OnboardJobStatus;
  file_name: string;
  config: OnboardJobConfig;
  result: OnboardJobResult;
  started_at?: string;
  completed_at?: string;
  can_confirm: boolean;
}

/**
 * Confirm job response data
 */
export interface ConfirmResponseData {
  original_job_id: string;
  new_job_id: string;
  status: OnboardJobStatus;
  message: string;
}

/**
 * Cancel job response data
 */
export interface CancelResponseData {
  job_id: string;
  status: OnboardJobStatus;
}

/**
 * Edited records count response data
 */
export interface EditedCountResponseData {
  count: number;
}

/**
 * Retry result response data (single record)
 */
export interface RetryResponseData extends RetryResult { }

/**
 * Bulk retry response data
 */
export interface BulkRetryResponseData extends BulkRetryResult { }

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

/**
 * WebSocket message wrapper
 */
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  message_id: string;
}

/**
 * Onboard progress WebSocket payload
 */
export interface OnboardProgressPayload {
  job_id: string;
  event_type: OnboardEventType;
  status: OnboardJobStatus;
  file_name: string;
  progress: OnboardJobProgress;
  result_summary?: OnboardResultSummary;
  error_message?: string;
}

/**
 * Onboard progress WebSocket message
 */
export type OnboardProgressMessage = WebSocketMessage<OnboardProgressPayload>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for form data conversion
 */
export type UploadFormData = {
  [K in keyof UploadConfig]: K extends 'file' ? File : string;
};

/**
 * Create form data from upload config
 */
export function createUploadFormData(config: UploadConfig): FormData {
  const formData = new FormData();
  formData.append('file', config.file);
  formData.append('dry_run', (config.dry_run ?? true).toString());
  formData.append('skip_duplicates', (config.skip_duplicates ?? true).toString());
  formData.append('onboard_farmers', (config.onboard_farmers ?? true).toString());
  formData.append('onboard_providers', (config.onboard_providers ?? false).toString());
  formData.append('onboard_mixed_roles', (config.onboard_mixed_roles ?? true).toString());
  formData.append('mixed_role_as_type', config.mixed_role_as_type ?? 'farmer');
  return formData;
}

// ============================================================================
// API CLIENT INTERFACE
// ============================================================================

/**
 * Interface for the Bulk Onboarding API client
 */
export interface IBulkOnboardingApi {
  /**
   * Upload an Excel file and start processing
   */
  upload(config: UploadConfig): Promise<ApiResponse<UploadResponseData>>;

  /**
   * List all onboarding jobs
   */
  listJobs(params?: PaginationParams): Promise<ApiResponse<ListJobsResponseData>>;

  /**
   * Get a specific job by ID
   */
  getJob(jobId: string): Promise<ApiResponse<OnboardJob>>;

  /**
   * Get job progress (for polling)
   */
  getProgress(jobId: string): Promise<ApiResponse<ProgressResponseData>>;

  /**
   * Get job summary with breakdowns
   */
  getSummary(jobId: string): Promise<ApiResponse<SummaryResponseData>>;

  /**
   * Get onboarded records
   */
  getOnboardedRecords(
    jobId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<OnboardedRecordsResponseData>>;

  /**
   * Get skipped records
   */
  getSkippedRecords(
    jobId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<SkippedRecordsResponseData>>;

  /**
   * Get problematic/error records
   */
  getProblematicRecords(
    jobId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<ProblematicRecordsResponseData>>;

  /**
   * Get full job result
   */
  getResult(jobId: string): Promise<ApiResponse<ResultResponseData>>;

  /**
   * Confirm a dry-run job for actual import
   */
  confirmJob(jobId: string): Promise<ApiResponse<ConfirmResponseData>>;

  /**
   * Cancel a pending or processing job
   */
  cancelJob(jobId: string): Promise<ApiResponse<CancelResponseData>>;

  /**
   * Get a single problematic record by row number
   */
  getProblematicRecord(
    jobId: string,
    rowNumber: number
  ): Promise<ApiResponse<ProblematicRecord>>;

  /**
   * Update a problematic record with corrected data
   */
  updateProblematicRecord(
    jobId: string,
    rowNumber: number,
    data: UpdateRecordRequest
  ): Promise<ApiResponse<ProblematicRecord>>;

  /**
   * Retry a single problematic record
   */
  retryRecord(
    jobId: string,
    rowNumber: number
  ): Promise<ApiResponse<RetryResponseData>>;

  /**
   * Retry multiple problematic records
   */
  bulkRetryRecords(
    jobId: string,
    data: BulkRetryRequest
  ): Promise<ApiResponse<BulkRetryResponseData>>;

  /**
   * Retry all edited records
   */
  retryAllEdited(jobId: string): Promise<ApiResponse<BulkRetryResponseData>>;

  /**
   * Skip a problematic record
   */
  skipRecord(
    jobId: string,
    rowNumber: number,
    data?: SkipRecordRequest
  ): Promise<ApiResponse<null>>;

  /**
   * Delete a problematic record
   */
  deleteRecord(jobId: string, rowNumber: number): Promise<ApiResponse<null>>;

  /**
   * Get count of edited records
   */
  getEditedCount(jobId: string): Promise<ApiResponse<EditedCountResponseData>>;

  /**
   * Export edited records as JSON
   */
  exportEditedRecords(jobId: string): Promise<Blob>;
}

// ============================================================================
// REACT HOOK TYPES (for reference)
// ============================================================================

/**
 * State for upload component
 */
export interface UploadState {
  file: File | null;
  config: OnboardJobConfig;
  jobId: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: OnboardJobProgress | null;
  error: string | null;
}

/**
 * WebSocket connection options
 */
export interface WebSocketOptions {
  url: string;
  token: string;
  onProgress?: (data: OnboardProgressPayload) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * WebSocket hook return type
 */
export interface UseOnboardingWebSocketReturn {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  UPLOAD: '/api/v1/admin/onboard/upload',
  JOBS: '/api/v1/admin/onboard/jobs',
  JOB: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}`,
  PROGRESS: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/progress`,
  SUMMARY: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/summary`,
  ONBOARDED: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/onboarded`,
  SKIPPED: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/skipped`,
  PROBLEMATIC: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/problematic`,
  PROBLEMATIC_RECORD: (jobId: string, rowNumber: number) =>
    `/api/v1/admin/onboard/jobs/${jobId}/problematic/${rowNumber}`,
  RETRY_RECORD: (jobId: string, rowNumber: number) =>
    `/api/v1/admin/onboard/jobs/${jobId}/problematic/${rowNumber}/retry`,
  SKIP_RECORD: (jobId: string, rowNumber: number) =>
    `/api/v1/admin/onboard/jobs/${jobId}/problematic/${rowNumber}/skip`,
  BULK_RETRY: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/problematic/bulk-retry`,
  RETRY_EDITED: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/problematic/retry-edited`,
  EDITED_COUNT: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/problematic/edited-count`,
  EXPORT_EDITED: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/problematic/export-edited`,
  RESULT: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/result`,
  CONFIRM: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/confirm`,
  CANCEL: (jobId: string) => `/api/v1/admin/onboard/jobs/${jobId}/cancel`,
} as const;

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<OnboardJobStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'gray', icon: '⏳' },
  processing: { label: 'Processing', color: 'blue', icon: '🔄' },
  analyzing: { label: 'Analyzing', color: 'blue', icon: '🔍' },
  completed: { label: 'Completed', color: 'green', icon: '✅' },
  failed: { label: 'Failed', color: 'red', icon: '❌' },
  confirmed: { label: 'Confirmed', color: 'purple', icon: '🚀' },
  cancelled: { label: 'Cancelled', color: 'gray', icon: '🚫' },
};

/**
 * Issue type display configuration
 */
export const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; color: string }> = {
  missing_phone: { label: 'Missing Phone', color: 'red' },
  invalid_phone: { label: 'Invalid Phone', color: 'orange' },
  missing_name: { label: 'Missing Name', color: 'red' },
  unknown_type: { label: 'Unknown Type', color: 'yellow' },
  duplicate_phone: { label: 'Duplicate Phone', color: 'orange' },
  duplicate_id: { label: 'Duplicate ID', color: 'orange' },
  creation_error: { label: 'Creation Error', color: 'red' },
  validation_error: { label: 'Validation Error', color: 'red' },
};

/**
 * Participant type display configuration
 */
export const PARTICIPANT_TYPE_CONFIG: Record<ParticipantType, { label: string; color: string }> = {
  farmer_only: { label: 'Farmer', color: 'green' },
  service_provider_only: { label: 'Provider', color: 'blue' },
  farmer_and_provider: { label: 'Both', color: 'purple' },
  unknown: { label: 'Unknown', color: 'gray' },
};

// ============================================================================
// EDIT & RETRY HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a problematic record has been edited
 */
export function isRecordEdited(record: ProblematicRecord): boolean {
  return record.raw_data?.['_edited'] === 'true';
}

/**
 * Get the edited timestamp from a record
 */
export function getRecordEditedAt(record: ProblematicRecord): Date | null {
  const editedAt = record.raw_data?.['_edited_at'];
  if (!editedAt) return null;
  return new Date(editedAt);
}

/**
 * Filter problematic records to only edited ones
 */
export function getEditedRecords(records: ProblematicRecord[]): ProblematicRecord[] {
  return records.filter(isRecordEdited);
}

/**
 * Get row numbers from a list of problematic records
 */
export function getRowNumbers(records: ProblematicRecord[]): number[] {
  return records.map(r => r.row_number);
}

/**
 * Group retry results by success/failure
 */
export function groupRetryResults(results: RetryResult[]): {
  successful: RetryResult[];
  failed: RetryResult[];
} {
  return {
    successful: results.filter(r => r.success),
    failed: results.filter(r => !r.success),
  };
}
