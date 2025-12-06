// Re-export RequestItem from the store for backward compatibility
// This file previously contained mock data but now the app uses real API data
export type { RequestItem } from "@/stores/useRequestsStore";

// Legacy mock data - kept for reference or fallback testing
// The application now fetches real data from the backend API
export const mockRequests: import("@/stores/useRequestsStore").RequestItem[] = [];
