// =============================================================================
// API Data Transformers
// Converts backend snake_case responses to frontend camelCase format
// =============================================================================

import type {
  BackendUser,
  BackendLoginResponse,
  BackendPaginatedUsers,
  BackendDashboardData,
  BackendServiceRequest,
  BackendRequestStatus,
  BackendPaymentSummary,
  FrontendUser,
  FrontendLoginResponse,
  FrontendContact,
  FrontendContactsResponse,
  FrontendRequestItem,
  FrontendRequestsResponse,
  FrontendAdmin,
  FrontendAdminsResponse,
  FrontendFinancesResponse,
  FrontendStatisticsResponse,
} from "./types";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Formats a date string to MM/DD/YY format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

/**
 * Formats a date string to ISO date format (YYYY-MM-DD)
 */
export function formatISODate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

/**
 * Generates initials from first and last name
 */
export function generateInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";
  return `${first}${last}`.toUpperCase();
}

/**
 * Maps backend role to frontend type
 */
export function mapRoleToType(
  role: string
): "Admin" | "Agent" | "Farmer" | "Provider" {
  const mapping: Record<string, "Admin" | "Agent" | "Farmer" | "Provider"> = {
    admin: "Admin",
    agent: "Agent",
    farmer: "Farmer",
    service_provider: "Provider",
  };
  return mapping[role] || "Farmer";
}

/**
 * Maps frontend type to backend role
 */
export function mapTypeToRole(
  type: string
): "admin" | "agent" | "farmer" | "service_provider" {
  const mapping: Record<
    string,
    "admin" | "agent" | "farmer" | "service_provider"
  > = {
    Admin: "admin",
    Agent: "agent",
    Farmer: "farmer",
    Provider: "service_provider",
  };
  return mapping[type] || "farmer";
}

/**
 * Maps backend service request status to frontend status
 */
export function mapRequestStatus(
  status: BackendRequestStatus
): FrontendRequestItem["status"] {
  const mapping: Record<BackendRequestStatus, FrontendRequestItem["status"]> = {
    pending: "Wait",
    accepted: "Active",
    declined: "Cancelled",
    in_progress: "Ongoing",
    work_started: "Ongoing",
    work_paused: "Wait",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return mapping[status] || "Wait";
}

/**
 * Maps frontend status to backend status
 */
export function mapStatusToBackend(
  status: FrontendRequestItem["status"]
): BackendRequestStatus {
  const mapping: Record<FrontendRequestItem["status"], BackendRequestStatus> = {
    Active: "accepted",
    Offline: "pending",
    Wait: "pending",
    Cancelled: "cancelled",
    Completed: "completed",
    Ongoing: "in_progress",
  };
  return mapping[status] || "pending";
}

/**
 * Formats currency in Ghana Cedis
 */
export function formatCurrency(amount: number): string {
  return `¢${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Calculates demand to supply ratio
 */
export function calculateDemandSupplyRatio(
  farmers: number,
  providers: number
): string {
  if (providers === 0) return "N/A";
  const ratio = (farmers / providers).toFixed(1);
  return `${ratio} : 1`;
}

// =============================================================================
// Authentication Transformers
// =============================================================================

/**
 * Transforms backend login response to frontend format
 */
export function transformLoginResponse(
  backendResponse: BackendLoginResponse
): FrontendLoginResponse {
  const { user, token } = backendResponse;

  return {
    success: true,
    message: "Login successful",
    data: {
      token,
      user: transformBackendUser(user),
    },
  };
}

/**
 * Transforms a backend user to frontend user format
 */
export function transformBackendUser(user: BackendUser): FrontendUser {
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email || "",
    type: mapRoleToType(user.role),
    avatar: generateInitials(user.first_name, user.last_name),
  };
}

// =============================================================================
// Contact/User Transformers
// =============================================================================

/**
 * Transforms backend user to frontend contact format
 */
export function transformUserToContact(
  user: BackendUser,
  type: "Farmer" | "Provider" | "Agent"
): FrontendContact {
  return {
    id: user.id,
    firstName: user.first_name,
    otherNames: user.last_name,
    gender: "Male", // Backend doesn't provide gender in list response
    phone: user.phone_number,
    region: user.region_name || "",
    registrationDate: formatDate(user.created_at),
    initials: generateInitials(user.first_name, user.last_name),
    profileImage: null,
    type,
    district: user.community_name || "",
    // Type-specific fields with defaults
    ...(type === "Farmer" && {
      farmName: "",
      farmSize: 0,
      farmSizeUnit: "Acre" as const,
      crops: [],
      formLocation: user.community_name || "",
    }),
    ...(type === "Provider" && {
      services: [],
    }),
    ...(type === "Agent" && {
      assignedRegion: user.region_name || "",
    }),
  };
}

/**
 * Transforms paginated backend users to frontend contacts response
 */
export function transformUsersToContacts(
  response: BackendPaginatedUsers,
  type: "Farmer" | "Provider" | "Agent"
): FrontendContactsResponse {
  return {
    success: true,
    data: response.users.map((user) => transformUserToContact(user, type)),
    pagination: {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.total_pages,
    },
  };
}

// =============================================================================
// Service Request Transformers
// =============================================================================

/**
 * Transforms backend service request to frontend request item
 */
export function transformServiceRequest(
  request: BackendServiceRequest
): FrontendRequestItem {
  // Safely extract farmer name with proper null/undefined handling
  const farmerFirstName = request.farmer?.user?.first_name || "";
  const farmerLastName = request.farmer?.user?.last_name || "";
  const farmerName = farmerFirstName || farmerLastName
    ? `${farmerFirstName} ${farmerLastName}`.trim()
    : "Unknown Farmer";

  // Safely extract provider name
  const providerName = request.service_provider?.business_name || "Unassigned";

  // Generate handle from request_id or fallback to id
  const handle = request.request_id
    ? `@${request.request_id.toLowerCase()}`
    : request.id
      ? `@${request.id.slice(0, 8)}`
      : "@unknown";

  return {
    id: request.id || "",
    name: farmerName,
    handle,
    status: mapRequestStatus(request.status),
    email: "", // Not provided in service requests
    date: formatDate(request.start_date || request.created_at),
    // Extended fields
    requestId: request.request_id || "",
    farmerId: request.farmer_id || "",
    serviceProviderId: request.service_provider_id || "",
    serviceType: request.service_type || "N/A",
    farmSize: request.farm_size || 0,
    cropType: request.crop_type || "N/A",
    startDate: formatDate(request.start_date),
    endDate: formatDate(request.end_date),
    providerName,
    farmerFirstName,
    farmerLastName,
    createdAt: formatDate(request.created_at),
    updatedAt: formatDate(request.updated_at),
  };
}

/**
 * Transforms backend service requests array to frontend format
 */
export function transformServiceRequests(
  requests: BackendServiceRequest[]
): FrontendRequestsResponse {
  return {
    success: true,
    data: requests.map(transformServiceRequest),
  };
}

// =============================================================================
// Admin Transformers
// =============================================================================

/**
 * Transforms backend user to frontend admin format
 */
/**
 * Maps backend role to frontend admin type for the admin page
 */
function mapRoleToAdminType(
  role: string
): "Admin" | "Agent" | "Accounting" | "Farmer" | "Provider" {
  const mapping: Record<string, "Admin" | "Agent" | "Accounting" | "Farmer" | "Provider"> = {
    admin: "Admin",
    agent: "Agent",
    accounts: "Accounting",
    accounting: "Accounting",
    farmer: "Farmer",
    service_provider: "Provider",
  };
  return mapping[role] || "Admin";
}

export function transformUserToAdmin(user: BackendUser): FrontendAdmin {
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email || "",
    avatar: generateInitials(user.first_name, user.last_name),
    type: mapRoleToAdminType(user.role),
    phoneNumber: user.phone_number,
    dateOfRegistration: formatDate(user.created_at),
  };
}

/**
 * Transforms paginated backend users to frontend admins response
 */
export function transformUsersToAdmins(
  response: BackendPaginatedUsers
): FrontendAdminsResponse {
  return {
    success: true,
    data: response.users.map(transformUserToAdmin),
    pagination: {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.total_pages,
    },
  };
}

// =============================================================================
// Finance Transformers
// =============================================================================

/**
 * Transforms backend payment summary to frontend finances format
 */
export function transformPaymentSummary(
  summary: BackendPaymentSummary
): FrontendFinancesResponse {
  return {
    summary: {
      revenue: {
        value: formatCurrency(summary.total_revenue),
        delta: "+0%", // Not tracked in backend yet
      },
      withdrawals: {
        value: formatCurrency(0), // Not tracked in backend yet
        delta: "+0%",
      },
      payments: {
        value: formatCurrency(summary.pending_payments),
        delta: "+0%",
      },
      commission: {
        value: formatCurrency(summary.commission_earned),
        delta: "+0%",
      },
    },
    chart: [], // Backend doesn't provide chart data yet
  };
}

// =============================================================================
// Dashboard/Statistics Transformers
// =============================================================================

/**
 * Transforms backend dashboard data to frontend statistics format
 */
export function transformDashboardToStatistics(
  dashboard: BackendDashboardData
): FrontendStatisticsResponse {
  const { user_stats } = dashboard;

  const totalFarmers = user_stats?.farmers?.total || 0;
  const totalServiceProviders = user_stats?.service_providers?.total || 0;

  return {
    success: true,
    data: {
      totalFarmers,
      totalServiceProviders,
      totalAcres: 0, // Not tracked in backend
      demandToSupply: calculateDemandSupplyRatio(
        totalFarmers,
        totalServiceProviders
      ),
      farmersGrowth: "+0%", // Not tracked in backend
      providersGrowth: "+0%", // Not tracked in backend
      acresGrowth: "+0%", // Not tracked in backend
    },
  };
}

// =============================================================================
// Request Payload Transformers (Frontend -> Backend)
// =============================================================================

/**
 * Transforms frontend contact data to backend user creation format
 */
export function transformContactToBackendUser(
  contact: Partial<FrontendContact> & {
    password?: string;
    idNumber?: string;
    idType?: string;
  }
) {
  return {
    first_name: contact.firstName || "",
    last_name: contact.otherNames || "",
    phone_number: contact.phone || "",
    email: undefined, // Optional
    password: contact.password || "",
    community_name: contact.district || contact.formLocation || "",
    id_number: contact.idNumber || "",
    id_type: contact.idType || "ghana_card",
    gender: contact.gender?.toLowerCase() || "male",
  };
}

/**
 * Transforms frontend admin data to backend admin creation format
 */
export function transformAdminToBackendUser(
  admin: Partial<FrontendAdmin> & {
    password?: string;
    idNumber?: string;
    idType?: string;
    communityName?: string;
    gender?: string;
  }
) {
  const nameParts = (admin.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    first_name: firstName,
    last_name: lastName,
    phone_number: admin.phoneNumber || "",
    email: admin.email || "",
    password: admin.password || "",
    community_name: admin.communityName || "",
    id_number: admin.idNumber || "",
    id_type: admin.idType || "ghana_card",
    gender: admin.gender?.toLowerCase() || "male",
  };
}
