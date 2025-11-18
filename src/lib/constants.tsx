import { Cloud, Home, ListTodo, Users, Wallet } from "lucide-react";

type NavTab = { title: string; path: string };
type ActionTab = { title: string; type: "action"; action: string };
type TabItem = NavTab | ActionTab;

export const SidebarTabs = [
  { title: "Dashboard", url: "/dashboard/dashboard/maps-page", icon: Home },
  { title: "Weather", url: "/dashboard/weather/weather-data", icon: Cloud },
  {
    title: "Requests",
    url: "/dashboard/requests/request-management",
    icon: ListTodo,
  },
  {
    title: "Finances",
    url: "/dashboard/finances/revenue-payment",
    icon: Wallet,
  },
  { title: "Admin", url: "/dashboard/admin", icon: Users },
];

export const SECTION_TABS: Record<string, TabItem[]> = {
  "/dashboard": [
    { title: "Maps", path: "/dashboard/dashboard/maps-page" },
    { title: "Database", path: "/dashboard/dashboard/database-page" },
    { title: "Agent Dashboard Report", path: "/dashboard/dashboard/reports" },
    {
      title: "Service Provider Verification",
      path: "/dashboard/dashboard/provider-verification",
    },
  ],
  "/weather": [
    { title: "Weather Data", path: "/dashboard/weather/weather-data" },
    {
      title: "Weather Broadcast",
      path: "/dashboard/weather/weather-broadcast",
    },
  ],
  "/requests": [
    {
      title: "Request Management",
      path: "/dashboard/requests/request-management",
    },
    { title: "Assignment", path: "/dashboard/requests/assignment" },
  ],
  "/finances": [
    {
      title: "Revenue & Payments",
      path: "/dashboard/finances/revenue-payment",
    },
    {
      title: "Withdrawal Requests",
      path: "/dashboard/finances/withdrawal-requests",
    },
  ],
  "/admin": [
    {
      title: "Add Control Agent",
      type: "action",
      action: "open-agent-modal",
    },
  ],
};

export const ROUTES = {
  admin: "/dashboard/admin/users",
  dashboard: "/dashboard/dashboard/maps-page",
};
