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
} from "./types";

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
   */
  async getAdmins(page = 1, limit = 20): Promise<FrontendAdminsResponse> {
    const response = await this.get<BackendPaginatedUsers>(
      `/admin/users`
    );
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
}

// =============================================================================
// Export Singleton Instance
// =============================================================================

export const api = new MechAfricaAPIClient();

// Also export the class for testing or multiple instances
export { MechAfricaAPIClient };
