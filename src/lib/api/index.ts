// =============================================================================
// MechAfrica API - Main Export File
// =============================================================================

// Export the API client singleton and class
export { api, MechAfricaAPIClient } from "./client";

// Export all types
export type {
  // Backend types
  ApiResponse,
  BackendLoginRequest,
  BackendLoginResponse,
  BackendUser,
  BackendPaginatedUsers,
  BackendUserFilters,
  BackendDashboardData,
  BackendDashboardOverview,
  BackendUserStats,
  BackendServiceStats,
  BackendRecentActivity,
  BackendTopRegion,
  BackendServiceRequest,
  BackendRequestStatus,
  BackendServiceRequestFarmer,
  BackendServiceRequestProvider,
  BackendPaginatedServiceRequests,
  BackendPaymentSummary,
  BackendWeatherData,
  BackendCurrentWeather,
  BackendHourlyWeather,
  BackendDailyWeather,
  BackendDailyTemp,
  BackendWeatherCondition,
  BackendRegisterRequest,
  BackendManageUserRequest,
  BackendUpdateProfileRequest,
  // Frontend types
  FrontendUser,
  FrontendLoginResponse,
  FrontendContact,
  FrontendContactsResponse,
  FrontendPagination,
  FrontendRequestItem,
  FrontendRequestsResponse,
  FrontendAdmin,
  FrontendAdminsResponse,
  FrontendFinanceSummaryItem,
  FrontendFinancesResponse,
  FrontendStatistics,
  FrontendStatisticsResponse,
} from "./types";

// Export all transformers
export {
  // Utility functions
  formatDate,
  formatISODate,
  generateInitials,
  mapRoleToType,
  mapTypeToRole,
  mapRequestStatus,
  mapStatusToBackend,
  formatCurrency,
  calculateDemandSupplyRatio,
  // Response transformers
  transformLoginResponse,
  transformBackendUser,
  transformUserToContact,
  transformUsersToContacts,
  transformServiceRequest,
  transformServiceRequests,
  transformUserToAdmin,
  transformUsersToAdmins,
  transformPaymentSummary,
  transformDashboardToStatistics,
  // Request transformers
  transformContactToBackendUser,
  transformAdminToBackendUser,
} from "./transformers";
