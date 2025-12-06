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
