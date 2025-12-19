// =============================================================================
// Backend API Response Types
// =============================================================================

// Standard API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

// =============================================================================
// Authentication Types
// =============================================================================

export interface BackendLoginRequest {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  role: "admin" | "agent" | "farmer" | "service_provider";
  community_name?: string;
  region_name?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendLoginResponse {
  user: BackendUser;
  token: string;
}

export interface BackendRegisterRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  password: string;
  community_name: string;
  id_number: string;
  id_type: "ghana_card" | "passport" | "voter_id" | "drivers_license";
  gender: "male" | "female";
}

// =============================================================================
// User Management Types
// =============================================================================

export interface BackendPaginatedUsers {
  users: BackendUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BackendUserFilters {
  role?: string;
  page?: number;
  limit?: number;
  search?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

// =============================================================================
// Dashboard Types
// =============================================================================

export interface BackendUserStats {
  total: number;
  active: number;
  verified: number;
  pending: number;
  inactive: number;
}

export interface BackendServiceStats {
  total_requests: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  completion_rate: number;
}

export interface BackendRecentActivity {
  id: string;
  type: string;
  description: string;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface BackendTopRegion {
  region_name: string;
  user_count: number;
  request_count: number;
}

export interface BackendDashboardOverview {
  total_users: number;
  active_users: number;
  total_service_requests: number;
  pending_verifications: number;
  system_health: string;
  revenue: number;
}

export interface BackendDashboardData {
  overview: BackendDashboardOverview;
  user_stats: {
    farmers: BackendUserStats;
    service_providers: BackendUserStats;
    agents: BackendUserStats;
    admins: BackendUserStats;
  };
  service_stats: BackendServiceStats;
  recent_activity: BackendRecentActivity[];
  top_regions: BackendTopRegion[];
}

// =============================================================================
// Service Request Types
// =============================================================================

export type BackendRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "work_started"
  | "work_paused"
  | "completed"
  | "cancelled";

export interface BackendServiceRequestFarmer {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  }
}

export interface BackendServiceRequestProvider {
  id: string;
  business_name: string;
}

export interface BackendServiceRequest {
  id: string;
  request_id: string;
  farmer_id: string;
  service_provider_id: string;
  service_type: string;
  farm_size: number;
  crop_type: string;
  start_date: string;
  end_date: string;
  status: BackendRequestStatus;
  farmer?: BackendServiceRequestFarmer;
  service_provider?: BackendServiceRequestProvider;
  created_at: string;
  updated_at: string;
}

export interface BackendPaginatedServiceRequests {
  requests: BackendServiceRequest[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =============================================================================
// Payment/Finance Types
// =============================================================================

export interface BackendPaymentSummary {
  period: string;
  total_transactions: number;
  total_revenue: number;
  commission_earned: number;
  pending_payments: number;
  message?: string;
}

// =============================================================================
// Weather Types (from OpenWeatherMap via backend)
// =============================================================================

export interface BackendWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface BackendCurrentWeather {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  uvi: number;
  wind_speed: number;
  weather: BackendWeatherCondition[];
}

export interface BackendHourlyWeather extends BackendCurrentWeather {
  pop: number;
}

export interface BackendDailyTemp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface BackendDailyWeather {
  dt: number;
  temp: BackendDailyTemp;
  pop: number;
  weather: BackendWeatherCondition[];
}

export interface BackendWeatherData {
  lat: number;
  lon: number;
  timezone: string;
  current: BackendCurrentWeather;
  hourly: BackendHourlyWeather[];
  daily: BackendDailyWeather[];
}

// =============================================================================
// Admin Management Types
// =============================================================================

export interface BackendManageUserRequest {
  user_id: string;
  action: "verify" | "unverify" | "activate" | "deactivate" | "delete";
}

export interface BackendUpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  community_name?: string;
}

// =============================================================================
// Frontend Transformed Types (what the UI expects)
// =============================================================================

export interface FrontendUser {
  id: string;
  name: string;
  email: string;
  type: "Admin" | "Agent" | "Farmer" | "Provider";
  avatar: string;
}

export interface FrontendLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: FrontendUser;
  };
}

export interface FrontendContact {
  id: string;
  firstName: string;
  otherNames: string;
  gender: "Male" | "Female";
  phone: string;
  region: string;
  registrationDate: string;
  initials: string;
  profileImage: string | null;
  type: "Farmer" | "Provider" | "Agent";
  district: string;
  // Farmer specific
  farmName?: string;
  farmSize?: number;
  farmSizeUnit?: "Acre" | "Hectare";
  crops?: string[];
  formLocation?: string;
  // Provider specific
  services?: string[];
  // Agent specific
  assignedRegion?: string;
}

export interface FrontendPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FrontendContactsResponse {
  success: boolean;
  data: FrontendContact[];
  pagination: FrontendPagination;
}

export interface FrontendRequestItem {
  id: string;
  name: string;
  handle?: string;
  status: "Active" | "Offline" | "Wait" | "Cancelled" | "Completed" | "Ongoing";
  email: string;
  date: string;
  // Extended fields from backend
  requestId: string;
  farmerId: string;
  serviceProviderId: string;
  serviceType: string;
  farmSize: number;
  cropType: string;
  startDate: string;
  endDate: string;
  providerName: string;
  farmerFirstName: string;
  farmerLastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrontendRequestsResponse {
  success: boolean;
  data: FrontendRequestItem[];
  pagination?: FrontendPagination;
}

export interface FrontendAdmin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: "Admin" | "Agent" | "Accounting" | "Farmer" | "Provider";
  phoneNumber: string;
  dateOfRegistration: string;
}

export interface FrontendAdminsResponse {
  success: boolean;
  data: FrontendAdmin[];
  pagination?: FrontendPagination;
}

export interface FrontendFinanceSummaryItem {
  value: string;
  delta: string;
}

export interface FrontendFinancesResponse {
  summary: {
    revenue: FrontendFinanceSummaryItem;
    withdrawals: FrontendFinanceSummaryItem;
    payments: FrontendFinanceSummaryItem;
    commission: FrontendFinanceSummaryItem;
  };
  chart: {
    month: string;
    thisYear: number;
    lastYear: number;
    overTime: number;
  }[];
}

export interface FrontendStatistics {
  totalFarmers: number;
  totalServiceProviders: number;
  totalAcres: number;
  demandToSupply: string;
  farmersGrowth: string;
  providersGrowth: string;
  acresGrowth: string;
}

export interface FrontendStatisticsResponse {
  success: boolean;
  data: FrontendStatistics;
}

// =============================================================================
// Bulk Onboarding Types (matching backend API spec exactly)
// =============================================================================

/**
 * Status of an onboarding job
 */
export type OnboardJobStatus =
  | "pending"      // Job created, waiting to start processing
  | "processing"   // Job is currently processing rows
  | "analyzing"    // Job is analyzing the file
  | "completed"    // Job finished successfully
  | "failed"       // Job failed with an error
  | "confirmed"    // Dry-run job was confirmed for actual import
  | "cancelled";   // Job was cancelled by user

/**
 * Type of participant based on activity analysis
 */
export type ParticipantType =
  | "farmer_only"           // Person is only a farmer
  | "service_provider_only" // Person is only a service provider
  | "farmer_and_provider"   // Person is both farmer and service provider
  | "unknown";              // Could not determine type from activity

/**
 * Type of issue/error for problematic records
 */
export type IssueType =
  | "missing_phone"     // Phone number field is empty
  | "invalid_phone"     // Phone number format is invalid
  | "missing_name"      // Name field is empty
  | "unknown_type"      // Cannot determine participant type
  | "duplicate_phone"   // Phone number already exists in database
  | "duplicate_id"      // ID number already exists in database
  | "creation_error"    // Failed to create record in database
  | "validation_error"; // Other validation failure

/**
 * WebSocket event types for progress updates
 */
export type OnboardEventType =
  | "processing_started"    // Job processing has begun
  | "counting_complete"     // Finished counting total rows
  | "progress_update"       // Regular progress update (every 50 rows)
  | "processing_completed"  // Job completed successfully
  | "processing_failed"     // Job failed with error
  | "job_cancelled";        // Job was cancelled

/**
 * Role type for mixed role handling
 */
export type RoleType = "farmer" | "provider";

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

/**
 * Complete onboarding job object from backend
 */
export interface BackendOnboardJob {
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
  result_summary?: OnboardResultSummary;
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
 * Frontend-friendly job model
 */
export interface FrontendOnboardJob {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: OnboardJobStatus;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  config: OnboardJobConfig;
  progress: OnboardJobProgress;
  result?: OnboardJobResult;
  resultSummary?: OnboardResultSummary;
  problematicFileUrl?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  finalImportFarmers: number;
  finalImportProviders: number;
}

// =============================================================================
// Bulk Onboarding API Response Types
// =============================================================================

/**
 * Response data for file upload
 */
export interface OnboardUploadResponseData {
  job_id: string;
  status: OnboardJobStatus;
  file_name: string;
  file_url: string;
  file_size: number;
  config: OnboardJobConfig;
  message: string;
}

/**
 * Response for upload endpoint
 */
export interface OnboardUploadResponse {
  success: boolean;
  message: string;
  data: OnboardUploadResponseData;
}

/**
 * Response data for list jobs
 */
export interface OnboardListJobsResponseData {
  jobs: BackendOnboardJob[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Response for list jobs endpoint
 */
export interface OnboardJobsListResponse {
  success: boolean;
  message: string;
  data: OnboardListJobsResponseData;
}

/**
 * Response for single job endpoint
 */
export interface OnboardJobResponse {
  success: boolean;
  message: string;
  data: BackendOnboardJob;
}

/**
 * Response data for progress endpoint
 */
export interface OnboardProgressResponseData {
  job_id: string;
  status: OnboardJobStatus;
  file_name: string;
  progress: OnboardJobProgress;
  started_at?: string;
  is_final: boolean;
}

/**
 * Response for progress endpoint
 */
export interface OnboardProgressResponse {
  success: boolean;
  message: string;
  data: OnboardProgressResponseData;
}

/**
 * Response data for onboarded records
 */
export interface OnboardedRecordsResponseData {
  count: number;
  page: number;
  limit: number;
  pages: number;
  records: OnboardedRecord[];
  by_type?: Record<RoleType, number>;
  by_region?: Record<string, number>;
}

/**
 * Response for onboarded records endpoint
 */
export interface OnboardedRecordsResponse {
  success: boolean;
  message: string;
  data: OnboardedRecordsResponseData;
}

/**
 * Response data for skipped records
 */
export interface SkippedRecordsResponseData {
  count: number;
  page: number;
  limit: number;
  pages: number;
  records: SkippedRecord[];
  by_reason?: Record<string, number>;
}

/**
 * Response for skipped records endpoint
 */
export interface SkippedRecordsResponse {
  success: boolean;
  message: string;
  data: SkippedRecordsResponseData;
}

/**
 * Response data for problematic records
 */
export interface ProblematicRecordsResponseData {
  count: number;
  page: number;
  limit: number;
  pages: number;
  records: ProblematicRecord[];
  by_type?: Record<IssueType, number>;
  download_url?: string;
}

/**
 * Response for problematic records endpoint
 */
export interface ProblematicRecordsResponse {
  success: boolean;
  message: string;
  data: ProblematicRecordsResponseData;
}

/**
 * Response data for confirm endpoint
 */
export interface OnboardConfirmResponseData {
  original_job_id: string;
  new_job_id: string;
  status: OnboardJobStatus;
  message: string;
}

/**
 * Response for confirm endpoint
 */
export interface OnboardConfirmResponse {
  success: boolean;
  message: string;
  data: OnboardConfirmResponseData;
}

/**
 * Response data for cancel endpoint
 */
export interface OnboardCancelResponseData {
  job_id: string;
  status: OnboardJobStatus;
}

/**
 * Response for cancel endpoint
 */
export interface OnboardCancelResponse {
  success: boolean;
  message: string;
  data: OnboardCancelResponseData;
}

// =============================================================================
// WebSocket Types
// =============================================================================

/**
 * WebSocket message for onboard progress
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
 * WebSocket message structure
 */
export interface OnboardWebSocketMessage {
  type: "onboard_progress";
  payload: OnboardProgressPayload;
  timestamp: string;
  message_id: string;
}

// =============================================================================
// Frontend Pagination for Records (transformed)
// =============================================================================

export interface OnboardRecordsPagination {
  count: number;
  page: number;
  limit: number;
  pages: number;
}

// =============================================================================
// Record Editing Types (for correcting problematic records)
// =============================================================================

// =============================================================================
// Retry & Edit Types (matching backend API spec exactly)
// =============================================================================

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
 * Request to update a problematic record (matching backend spec)
 */
export interface UpdateRecordRequest {
  /** Key-value pairs of fields to update */
  updated_data: Record<string, string>;
}

/**
 * Response after updating a record
 */
export interface UpdateRecordResponse {
  success: boolean;
  message: string;
  data: ProblematicRecord;
}

/**
 * Request to retry multiple records
 */
export interface BulkRetryRequest {
  /** List of row numbers to retry */
  row_numbers: number[];
}

/**
 * Response for bulk retry
 */
export interface BulkRetryResponse {
  success: boolean;
  message: string;
  data: BulkRetryResult;
}

/**
 * Request to skip a record
 */
export interface SkipRecordRequest {
  /** Optional reason for skipping */
  reason?: string;
}

/**
 * Response for skip/delete operations
 */
export interface SkipDeleteResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * Response for edited count
 */
export interface EditedCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

/**
 * Response for single retry
 */
export interface RetryRecordResponse {
  success: boolean;
  message: string;
  data: RetryResult;
}

// =============================================================================
// Job Summary Types (matching backend API spec)
// =============================================================================

/**
 * Job summary response data (for dashboard display)
 */
export interface OnboardSummaryResponseData {
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
    by_type: Record<string, number>;
  };
  type_breakdown?: Record<ParticipantType, number>;
  region_breakdown?: Record<string, number>;
  problematic_download_url?: string;
}

/**
 * Response for job summary endpoint
 */
export interface OnboardSummaryResponse {
  success: boolean;
  message: string;
  data: OnboardSummaryResponseData;
}

// =============================================================================
// Job Result Types
// =============================================================================

/**
 * Response data for job result endpoint
 */
export interface OnboardResultResponseData {
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
 * Response for job result endpoint
 */
export interface OnboardResultResponse {
  success: boolean;
  message: string;
  data: OnboardResultResponseData;
}

// =============================================================================
// Legacy Types (for backwards compatibility)
// =============================================================================

/**
 * @deprecated Use UpdateRecordRequest instead
 */
export interface LegacyUpdateRecordRequest {
  /** The row number of the record to update */
  row_number: number;
  /** Updated record data */
  data: {
    full_name?: string;
    phone_number?: string;
    region?: string;
    district?: string;
    community?: string;
    ghana_card_number?: string;
    gender?: string;
    activity?: string;
  };
}

/**
 * @deprecated Use BulkRetryRequest instead
 */
export interface ReprocessRecordsRequest {
  /** Job ID to reprocess */
  job_id: string;
  /** Specific row numbers to reprocess, or empty for all problematic */
  row_numbers?: number[];
}

/**
 * @deprecated Use BulkRetryResponse instead
 */
export interface ReprocessRecordsResponse {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    reprocessed_count: number;
    success_count: number;
    still_problematic_count: number;
  };
}

/**
 * Editable record for UI display
 */
export interface EditableRecord {
  row_number: number;
  source_file: string;
  source_sheet: string;
  full_name: string;
  phone_number: string;
  region: string;
  district: string;
  community?: string;
  ghana_card_number?: string;
  gender?: string;
  activity?: string;
  issue?: string;
  issue_type?: IssueType;
  raw_data?: Record<string, string>;
}

// =============================================================================
// API Endpoints Constants
// =============================================================================

/**
 * API endpoints for bulk onboarding
 */
export const ONBOARD_ENDPOINTS = {
  UPLOAD: "/admin/onboard/upload",
  JOBS: "/admin/onboard/jobs",
  JOB: (jobId: string) => `/admin/onboard/jobs/${jobId}`,
  PROGRESS: (jobId: string) => `/admin/onboard/jobs/${jobId}/progress`,
  SUMMARY: (jobId: string) => `/admin/onboard/jobs/${jobId}/summary`,
  RESULT: (jobId: string) => `/admin/onboard/jobs/${jobId}/result`,
  CONFIRM: (jobId: string) => `/admin/onboard/jobs/${jobId}/confirm`,
  CANCEL: (jobId: string) => `/admin/onboard/jobs/${jobId}/cancel`,
  ONBOARDED: (jobId: string) => `/admin/onboard/jobs/${jobId}/onboarded`,
  SKIPPED: (jobId: string) => `/admin/onboard/jobs/${jobId}/skipped`,
  PROBLEMATIC: (jobId: string) => `/admin/onboard/jobs/${jobId}/problematic`,
  PROBLEMATIC_RECORD: (jobId: string, rowNumber: number) =>
    `/admin/onboard/jobs/${jobId}/problematic/${rowNumber}`,
  RETRY_RECORD: (jobId: string, rowNumber: number) =>
    `/admin/onboard/jobs/${jobId}/problematic/${rowNumber}/retry`,
  SKIP_RECORD: (jobId: string, rowNumber: number) =>
    `/admin/onboard/jobs/${jobId}/problematic/${rowNumber}/skip`,
  BULK_RETRY: (jobId: string) => `/admin/onboard/jobs/${jobId}/problematic/bulk-retry`,
  RETRY_EDITED: (jobId: string) => `/admin/onboard/jobs/${jobId}/problematic/retry-edited`,
  EDITED_COUNT: (jobId: string) => `/admin/onboard/jobs/${jobId}/problematic/edited-count`,
  EXPORT_EDITED: (jobId: string) => `/admin/onboard/jobs/${jobId}/problematic/export-edited`,
} as const;

// =============================================================================
// Status & Issue Type Display Config
// =============================================================================

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<OnboardJobStatus, { label: string; color: string; icon: string }> = {
  pending: { label: "Pending", color: "gray", icon: "⏳" },
  processing: { label: "Processing", color: "blue", icon: "🔄" },
  analyzing: { label: "Analyzing", color: "blue", icon: "🔍" },
  completed: { label: "Completed", color: "green", icon: "✅" },
  failed: { label: "Failed", color: "red", icon: "❌" },
  confirmed: { label: "Confirmed", color: "purple", icon: "🚀" },
  cancelled: { label: "Cancelled", color: "gray", icon: "🚫" },
};

/**
 * Issue type display configuration
 */
export const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; color: string }> = {
  missing_phone: { label: "Missing Phone", color: "red" },
  invalid_phone: { label: "Invalid Phone", color: "orange" },
  missing_name: { label: "Missing Name", color: "red" },
  unknown_type: { label: "Unknown Type", color: "yellow" },
  duplicate_phone: { label: "Duplicate Phone", color: "orange" },
  duplicate_id: { label: "Duplicate ID", color: "orange" },
  creation_error: { label: "Creation Error", color: "red" },
  validation_error: { label: "Validation Error", color: "red" },
};

/**
 * Participant type display configuration
 */
export const PARTICIPANT_TYPE_CONFIG: Record<ParticipantType, { label: string; color: string }> = {
  farmer_only: { label: "Farmer", color: "green" },
  service_provider_only: { label: "Provider", color: "blue" },
  farmer_and_provider: { label: "Both", color: "purple" },
  unknown: { label: "Unknown", color: "gray" },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a problematic record has been edited
 */
export function isRecordEdited(record: ProblematicRecord): boolean {
  return record.raw_data?.["_edited"] === "true";
}

/**
 * Get the edited timestamp from a record
 */
export function getRecordEditedAt(record: ProblematicRecord): Date | null {
  const editedAt = record.raw_data?.["_edited_at"];
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
  return records.map((r) => r.row_number);
}

/**
 * Group retry results by success/failure
 */
export function groupRetryResults(results: RetryResult[]): {
  successful: RetryResult[];
  failed: RetryResult[];
} {
  return {
    successful: results.filter((r) => r.success),
    failed: results.filter((r) => !r.success),
  };
}
