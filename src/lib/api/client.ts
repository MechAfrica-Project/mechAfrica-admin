// =============================================================================
// MechAfrica API Client
// Handles all backend API communications with data transformation
// =============================================================================

import {
  transformLoginResponse,
  transformUsersToContacts,
  transformUsersToAdmins,
  transformServiceRequests,
  transformPaymentSummary,
  transformDashboardToStatistics,
  transformAdminToBackendUser,
} from "./transformers";

import type {
  ApiResponse,
  BackendLoginRequest,
  BackendLoginResponse,
  BackendPaginatedUsers,
  BackendDashboardData,
  BackendServiceRequest,
  BackendPaymentSummary,
  BackendRegisterRequest,
  BackendManageUserRequest,
  BackendUpdateProfileRequest,
  FrontendLoginResponse,
  FrontendContactsResponse,
  FrontendAdminsResponse,
  FrontendRequestsResponse,
  FrontendFinancesResponse,
  FrontendStatisticsResponse,
  FrontendAdmin,
  BackendOnboardJob,
  FrontendOnboardJob,
  OnboardUploadResponse,
  OnboardProgressResponse,
  OnboardedRecordsResponse,
  SkippedRecordsResponse,
  ProblematicRecordsResponse,
  OnboardConfirmResponse,
  OnboardCancelResponse,
  RoleType,
  ProblematicRecord,
  OnboardSummaryResponseData,
  OnboardResultResponseData,
  RetryResult,
  BulkRetryResult,
} from "./types";

import { ONBOARD_ENDPOINTS } from "./types";

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

// =============================================================================
// API Client Class
// =============================================================================

class MechAfricaAPIClient {
  private token: string | null = null;

  // ---------------------------------------------------------------------------
  // Token Management
  // ---------------------------------------------------------------------------

  /**
   * Sets the authentication token for subsequent requests
   */
  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  /**
   * Gets the current authentication token
   */
  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  /**
   * Clears the authentication token (logout)
   */
  clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  // ---------------------------------------------------------------------------
  // Request Helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Makes a GET request to the API
   */
  private async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Makes a POST request to the API
   */
  private async post<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Makes a PUT request to the API
   */
  private async put<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Makes a DELETE request to the API
   */
  private async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Authentication Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Login with email or phone number
   */
  async login(
    identifier: string,
    password: string
  ): Promise<FrontendLoginResponse> {
    // Determine if identifier is email or phone
    const isEmail = identifier.includes("@");

    const payload: BackendLoginRequest = {
      password,
      ...(isEmail ? { email: identifier } : { phone_number: identifier }),
    };

    const response = await this.post<BackendLoginResponse>(
      "/admin/login",
      payload as unknown as Record<string, unknown>
    );

    const transformedResponse = transformLoginResponse(response.data);

    // Store the token
    this.setToken(transformedResponse.data.token);

    return transformedResponse;
  }

  /**
   * Register a new admin
   */
  async registerAdmin(data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    communityName: string;
    idNumber: string;
    idType: string;
    gender: string;
  }): Promise<FrontendLoginResponse> {
    const payload: BackendRegisterRequest = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber,
      email: data.email,
      password: data.password,
      community_name: data.communityName,
      id_number: data.idNumber,
      id_type: data.idType as BackendRegisterRequest["id_type"],
      gender: data.gender as BackendRegisterRequest["gender"],
    };

    const response = await this.post<BackendLoginResponse>(
      "/admin/register",
      payload as unknown as Record<string, unknown>
    );

    const transformedResponse = transformLoginResponse(response.data);
    this.setToken(transformedResponse.data.token);

    return transformedResponse;
  }

  /**
   * Logout - clears the token
   */
  logout(): void {
    this.clearToken();
  }

  // ---------------------------------------------------------------------------
  // User/Contact Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get farmers list
   */
  async getFarmers(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<FrontendContactsResponse> {
    let endpoint = `/admin/users?role=farmer&page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }

    const response = await this.get<BackendPaginatedUsers>(endpoint);
    return transformUsersToContacts(response.data, "Farmer");
  }

  /**
   * Get service providers list
   */
  async getServiceProviders(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<FrontendContactsResponse> {
    let endpoint = `/admin/manage-providers?page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }

    try {
      const response = await this.get<BackendPaginatedUsers>(endpoint);
      return transformUsersToContacts(response.data, "Provider");
    } catch {
      // Fallback to users endpoint if manage-providers fails
      const fallbackEndpoint = `/admin/users?role=service_provider&page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const response = await this.get<BackendPaginatedUsers>(fallbackEndpoint);
      return transformUsersToContacts(response.data, "Provider");
    }
  }

  /**
   * Get agents list
   */
  async getAgents(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<FrontendContactsResponse> {
    let endpoint = `/admin/manage-agents?page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }

    try {
      const response = await this.get<BackendPaginatedUsers>(endpoint);
      return transformUsersToContacts(response.data, "Agent");
    } catch {
      // Fallback to users endpoint if manage-agents fails
      const fallbackEndpoint = `/admin/users?role=agent&page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const response = await this.get<BackendPaginatedUsers>(fallbackEndpoint);
      return transformUsersToContacts(response.data, "Agent");
    }
  }

  /**
   * Get all users with optional filters
   */
  async getUsers(
    filters: {
      role?: string;
      page?: number;
      limit?: number;
      search?: string;
      isVerified?: boolean;
      isActive?: boolean;
    } = {}
  ): Promise<FrontendContactsResponse> {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.isVerified !== undefined)
      params.append("is_verified", filters.isVerified.toString());
    if (filters.isActive !== undefined)
      params.append("is_active", filters.isActive.toString());

    const response = await this.get<BackendPaginatedUsers>(
      `/admin/users?${params.toString()}`
    );

    // Determine type based on role filter
    const type =
      filters.role === "farmer"
        ? "Farmer"
        : filters.role === "service_provider"
          ? "Provider"
          : filters.role === "agent"
            ? "Agent"
            : "Farmer";

    return transformUsersToContacts(response.data, type);
  }

  /**
   * Manage user (verify, activate, deactivate, etc.)
   */
  async manageUser(
    userId: string,
    action: BackendManageUserRequest["action"]
  ): Promise<ApiResponse<unknown>> {
    const payload = {
      user_id: userId,
      action,
    };

    return this.post("/admin/manage-user", payload);
  }

  // ---------------------------------------------------------------------------
  // Admin Management Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get admins list
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @param role - Optional role filter (e.g., "farmer", "provider", "admin", "agent", "accounting")
   */
  async getAdmins(page = 1, limit = 20, role?: string): Promise<FrontendAdminsResponse> {
    let url = `/admin/users?limit=${limit}&page=${page}`;
    if (role && role !== "all") {
      url += `&role=${role.toLowerCase()}`;
    }
    const response = await this.get<BackendPaginatedUsers>(url);
    return transformUsersToAdmins(response.data);
  }

  /**
   * Create a new admin
   */
  async createAdmin(
    admin: Partial<FrontendAdmin> & {
      password: string;
      idNumber: string;
      idType: string;
      communityName: string;
      gender: string;
    }
  ): Promise<FrontendLoginResponse> {
    const payload = transformAdminToBackendUser(admin);
    const response = await this.post<BackendLoginResponse>(
      "/admin/register",
      payload as unknown as Record<string, unknown>
    );
    return transformLoginResponse(response.data);
  }

  /**
   * Update admin profile (self)
   */
  async updateProfile(
    data: Partial<BackendUpdateProfileRequest>
  ): Promise<ApiResponse<unknown>> {
    return this.put("/admin/profile", data);
  }

  /**
   * Deactivate/delete an admin
   */
  async deleteAdmin(adminId: string): Promise<ApiResponse<unknown>> {
    return this.manageUser(adminId, "deactivate");
  }

  // ---------------------------------------------------------------------------
  // Service Request Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get all service requests
   */
  async getServiceRequests(
    page = 1,
    limit = 20
  ): Promise<FrontendRequestsResponse> {
    const response = await this.get<BackendServiceRequest[]>(
      `/admin/service-requests?page=${page}&limit=${limit}`
    );
    console.log(response.data)
    return transformServiceRequests(response.data);
  }

  /**
   * Get service request by ID
   */
  async getServiceRequestById(
    requestId: string
  ): Promise<ApiResponse<BackendServiceRequest>> {
    return this.get(`/admin/service-requests/${requestId}`);
  }

  // ---------------------------------------------------------------------------
  // Dashboard & Statistics Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<ApiResponse<BackendDashboardData>> {
    return this.get("/admin/dashboard");
  }

  /**
   * Get statistics (transformed from dashboard)
   */
  async getStatistics(): Promise<FrontendStatisticsResponse> {
    const response = await this.getDashboard();
    return transformDashboardToStatistics(response.data);
  }

  // ---------------------------------------------------------------------------
  // Finance Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get payment summary
   */
  async getFinances(
    period: "day" | "week" | "month" | "year" = "month"
  ): Promise<FrontendFinancesResponse> {
    const response = await this.get<BackendPaymentSummary>(
      `/admin/payment-summary?period=${period}`
    );
    return transformPaymentSummary(response.data);
  }

  // ---------------------------------------------------------------------------
  // Weather Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get weather data from backend API
   * Uses the backend weather endpoint which proxies to OpenWeatherMap
   * No authentication required for this endpoint
   */
  async getWeather(lat: number = 6.69, lon: number = -1.62): Promise<unknown> {
    const params = new URLSearchParams();
    params.append("lat", lat.toString());
    params.append("lon", lon.toString());

    // Use the backend weather endpoint directly (no auth required)
    const response = await fetch(`${API_BASE_URL}/weather?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch weather data");
    }

    return response.json();
  }

  // ---------------------------------------------------------------------------
  // Weather Broadcast Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Send weather broadcast
   */
  async sendWeatherBroadcast(data: {
    aiNotifications: boolean;
    region: string;
    district: string;
    message: string;
  }): Promise<ApiResponse<unknown>> {
    return this.post("/admin/weather-broadcast", {
      ai_notifications: data.aiNotifications,
      region: data.region,
      district: data.district,
      message: data.message,
    });
  }

  // ---------------------------------------------------------------------------
  // Bulk Onboarding Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Transform backend onboard job to frontend format
   */
  private transformOnboardJob(job: BackendOnboardJob): FrontendOnboardJob {
    return {
      id: job.id,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      createdBy: job.created_by,
      status: job.status,
      fileName: job.file_name,
      fileUrl: job.file_url,
      fileSize: job.file_size,
      config: job.config,
      progress: job.progress,
      result: job.result,
      resultSummary: job.result_summary,
      problematicFileUrl: job.problematic_file_url,
      errorMessage: job.error_message,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      confirmedAt: job.confirmed_at,
      confirmedBy: job.confirmed_by,
      finalImportFarmers: job.final_import_farmers,
      finalImportProviders: job.final_import_providers,
    };
  }

  /**
   * Upload Excel file for bulk onboarding
   */
  async uploadBulkOnboard(
    file: File,
    options: {
      dryRun?: boolean;
      skipDuplicates?: boolean;
      onboardFarmers?: boolean;
      onboardProviders?: boolean;
      onboardMixedRoles?: boolean;
      mixedRoleAsType?: RoleType;
    } = {}
  ): Promise<OnboardUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dry_run", String(options.dryRun ?? true));
    formData.append("skip_duplicates", String(options.skipDuplicates ?? true));
    formData.append("onboard_farmers", String(options.onboardFarmers ?? true));
    formData.append("onboard_providers", String(options.onboardProviders ?? false));
    formData.append("onboard_mixed_roles", String(options.onboardMixedRoles ?? true));
    formData.append("mixed_role_as_type", options.mixedRoleAsType ?? "farmer");

    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/onboard/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get list of onboarding jobs
   */
  async getOnboardJobs(
    page = 1,
    limit = 20
  ): Promise<{ jobs: FrontendOnboardJob[]; total: number; page: number; limit: number; pages: number }> {
    const response = await this.get<{
      jobs: BackendOnboardJob[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(`/admin/onboard/jobs?page=${page}&limit=${limit}`);

    return {
      jobs: response.data.jobs.map((job) => this.transformOnboardJob(job)),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      pages: response.data.pages,
    };
  }

  /**
   * Get onboarding job by ID
   */
  async getOnboardJob(jobId: string): Promise<FrontendOnboardJob> {
    const response = await this.get<BackendOnboardJob>(
      `/admin/onboard/jobs/${jobId}`
    );
    return this.transformOnboardJob(response.data);
  }

  /**
   * Get job progress (for polling)
   */
  async getOnboardJobProgress(jobId: string): Promise<OnboardProgressResponse["data"]> {
    const response = await this.get<OnboardProgressResponse["data"]>(
      `/admin/onboard/jobs/${jobId}/progress`
    );
    return response.data;
  }

  /**
   * Confirm a dry-run job to perform actual import
   */
  async confirmOnboardJob(jobId: string): Promise<OnboardConfirmResponse["data"]> {
    const response = await this.post<OnboardConfirmResponse["data"]>(
      `/admin/onboard/jobs/${jobId}/confirm`
    );
    return response.data;
  }

  /**
   * Cancel an onboarding job
   */
  async cancelOnboardJob(jobId: string): Promise<OnboardCancelResponse["data"]> {
    const response = await this.post<OnboardCancelResponse["data"]>(
      `/admin/onboard/jobs/${jobId}/cancel`
    );
    return response.data;
  }

  /**
   * Get onboarded records from a job
   */
  async getOnboardedRecords(
    jobId: string,
    page = 1,
    limit = 50
  ): Promise<OnboardedRecordsResponse["data"]> {
    const response = await this.get<OnboardedRecordsResponse["data"]>(
      `/admin/onboard/jobs/${jobId}/onboarded?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get skipped records from a job
   */
  async getSkippedRecords(
    jobId: string,
    page = 1,
    limit = 50
  ): Promise<SkippedRecordsResponse["data"]> {
    const response = await this.get<SkippedRecordsResponse["data"]>(
      `/admin/onboard/jobs/${jobId}/skipped?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get problematic records from a job
   */
  async getProblematicRecords(
    jobId: string,
    page = 1,
    limit = 50
  ): Promise<ProblematicRecordsResponse["data"]> {
    const response = await this.get<ProblematicRecordsResponse["data"]>(
      `/admin/onboard/jobs/${jobId}/problematic?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Download problematic records as Excel file
   * Uses the download_url from the problematic records response
   */
  async downloadProblematicRecords(downloadUrl: string): Promise<void> {
    // Open the download URL in a new tab/window
    if (typeof window !== "undefined") {
      window.open(downloadUrl, "_blank");
    }
  }

  // ---------------------------------------------------------------------------
  // Job Summary & Result Endpoints
  // ---------------------------------------------------------------------------

  /**
   * Get job summary with breakdowns (ideal for dashboard display)
   */
  async getOnboardJobSummary(jobId: string): Promise<OnboardSummaryResponseData> {
    const response = await this.get<OnboardSummaryResponseData>(
      ONBOARD_ENDPOINTS.SUMMARY(jobId)
    );
    return response.data;
  }

  /**
   * Get complete job result
   */
  async getOnboardJobResult(jobId: string): Promise<OnboardResultResponseData> {
    const response = await this.get<OnboardResultResponseData>(
      ONBOARD_ENDPOINTS.RESULT(jobId)
    );
    return response.data;
  }

  // ---------------------------------------------------------------------------
  // Problematic Record Editing Endpoints (matching backend API spec)
  // ---------------------------------------------------------------------------

  /**
   * Get a single problematic record by row number
   */
  async getProblematicRecord(
    jobId: string,
    rowNumber: number
  ): Promise<ProblematicRecord> {
    const response = await this.get<ProblematicRecord>(
      ONBOARD_ENDPOINTS.PROBLEMATIC_RECORD(jobId, rowNumber)
    );
    return response.data;
  }

  /**
   * Update/correct a problematic record with new data
   * This marks the record as "edited" for later retry
   */
  async updateProblematicRecord(
    jobId: string,
    rowNumber: number,
    updatedData: Record<string, string>
  ): Promise<ProblematicRecord> {
    const response = await this.put<ProblematicRecord>(
      ONBOARD_ENDPOINTS.PROBLEMATIC_RECORD(jobId, rowNumber),
      { updated_data: updatedData }
    );
    return response.data;
  }

  /**
   * Retry a single problematic record after editing
   */
  async retryProblematicRecord(
    jobId: string,
    rowNumber: number
  ): Promise<RetryResult> {
    const response = await this.post<RetryResult>(
      ONBOARD_ENDPOINTS.RETRY_RECORD(jobId, rowNumber)
    );
    return response.data;
  }

  /**
   * Bulk retry multiple problematic records
   */
  async bulkRetryRecords(
    jobId: string,
    rowNumbers: number[]
  ): Promise<BulkRetryResult> {
    const response = await this.post<BulkRetryResult>(
      ONBOARD_ENDPOINTS.BULK_RETRY(jobId),
      { row_numbers: rowNumbers }
    );
    return response.data;
  }

  /**
   * Retry all edited records (records marked with _edited: true)
   */
  async retryAllEditedRecords(jobId: string): Promise<BulkRetryResult> {
    const response = await this.post<BulkRetryResult>(
      ONBOARD_ENDPOINTS.RETRY_EDITED(jobId)
    );
    return response.data;
  }

  /**
   * Skip a problematic record (move to skipped list)
   */
  async skipProblematicRecord(
    jobId: string,
    rowNumber: number,
    reason?: string
  ): Promise<void> {
    await this.post<null>(
      ONBOARD_ENDPOINTS.SKIP_RECORD(jobId, rowNumber),
      reason ? { reason } : {}
    );
  }

  /**
   * Delete a problematic record permanently
   */
  async deleteProblematicRecord(
    jobId: string,
    rowNumber: number
  ): Promise<void> {
    await this.delete<null>(
      ONBOARD_ENDPOINTS.PROBLEMATIC_RECORD(jobId, rowNumber)
    );
  }

  /**
   * Get count of edited records ready for retry
   */
  async getEditedRecordsCount(jobId: string): Promise<number> {
    const response = await this.get<{ count: number }>(
      ONBOARD_ENDPOINTS.EDITED_COUNT(jobId)
    );
    return response.data.count;
  }

  /**
   * Export edited records as JSON file
   * Returns a Blob for download
   */
  async exportEditedRecords(jobId: string): Promise<Blob> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}${ONBOARD_ENDPOINTS.EXPORT_EDITED(jobId)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.blob();
  }

  // ---------------------------------------------------------------------------
  // Legacy Methods (kept for backwards compatibility, will be removed)
  // ---------------------------------------------------------------------------

  /**
   * @deprecated Use updateProblematicRecord instead
   */
  async updateRecord(
    jobId: string,
    rowNumber: number,
    data: Record<string, string | undefined>
  ): Promise<{ success: boolean; message: string; data: ProblematicRecord }> {
    // Convert to the new format
    const cleanData: Record<string, string> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Map frontend field names to backend field names
        const backendKey = this.mapFieldToBackend(key);
        cleanData[backendKey] = value;
      }
    });

    const record = await this.updateProblematicRecord(jobId, rowNumber, cleanData);
    return {
      success: true,
      message: "Record updated successfully",
      data: record,
    };
  }

  /**
   * @deprecated Use bulkRetryRecords or retryAllEditedRecords instead
   */
  async reprocessRecords(
    jobId: string,
    rowNumbers?: number[]
  ): Promise<{ success: boolean; message: string; data: { success_count: number; still_problematic_count: number } }> {
    const result = rowNumbers
      ? await this.bulkRetryRecords(jobId, rowNumbers)
      : await this.retryAllEditedRecords(jobId);

    return {
      success: true,
      message: `Reprocessed ${result.total_attempted} records`,
      data: {
        success_count: result.successful,
        still_problematic_count: result.failed,
      },
    };
  }

  /**
   * Map frontend field names to backend Excel column names
   */
  private mapFieldToBackend(field: string): string {
    const mapping: Record<string, string> = {
      full_name: "Name of Participant",
      phone_number: "Telephone Number",
      region: "Region/State",
      district: "District",
      community: "Community",
      ghana_card_number: "Ghana Card Number",
      gender: "Gender",
      activity: "Activity",
    };
    return mapping[field] || field;
  }
}

// =============================================================================
// Export Singleton Instance
// =============================================================================

export const api = new MechAfricaAPIClient();

// Also export the class for testing or multiple instances
export { MechAfricaAPIClient };
