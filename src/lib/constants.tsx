import { Cloud, Home, ListTodo, Users, Wallet } from "lucide-react";

export const SidebarTabs = [
  { title: "Dashboard", url: "/dashboard/dashboard/maps-page", icon: Home },
  { title: "Weather", url: "/dashboard/weather/weather-data", icon: Cloud },
  { title: "Requests", url: "/dashboard/requests", icon: ListTodo },
  { title: "Finances", url: "/dashboard/finances", icon: Wallet },
  { title: "Admin", url: "/dashboard/admin", icon: Users },
];

export const SECTION_TABS = {
  "/dashboard": [
    { title: "Maps", path: "/dashboard/dashboard/maps-page" },
    { title: "Database", path: "/dashboard/dashboard/database-page" },
    {title:"Reports", path:"/dashboard/dashboard/reports"},
    {title:"Provider Verification", path:"/dashboard/dashboard/provider-verification"}
  ],
  "/weather": [
    { title: "Weather Data", path: "/dashboard/weather/weather-data" },
    { title: "Forecast", path: "/dashboard/weather/forecast" },
  ],
  "/requests": [
    { title: "Active", path: "/dashboard/requests/active" },
    { title: "Completed", path: "/dashboard/requests/completed" },
    { title: "Archived", path: "/dashboard/requests/archived" },
  ],
  "/finances": [
    { title: "Summary", path: "/dashboard/finances/summary" },
    { title: "Transactions", path: "/dashboard/finances/transactions" },
    { title: "Invoices", path: "/dashboard/finances/invoices" },
  ],
  "/admin": [
    { title: "Users", path: "/dashboard/admin/users" },
    { title: "Roles", path: "/dashboard/admin/roles" },
    { title: "Settings", path: "/dashboard/admin/settings" },
  ],
};

// lib/routes.ts
export const ROUTES = {
    admin: "/dashboard/admin/users",
    dashboard: "/dashboard/dashboard/map",
  };
  