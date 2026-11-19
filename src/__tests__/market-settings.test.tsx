import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MarketManagementPage from "@/app/dashboard/market/page";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    getMarketSettings: jest.fn(),
    getEffectiveMarketPolicy: jest.fn(),
    getMarketSettingsHistory: jest.fn(),
    createMarketSettingsVersion: jest.fn(),
    cancelMarketSettingsVersion: jest.fn(),
    getMarketAgentPolicies: jest.fn(),
    createMarketAgentPolicyVersion: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const baseSettings = {
  current: {
    id: "ver-1",
    version: 3,
    scope: {},
    effective_from: "2026-11-19T00:00:00Z",
    values: {
      enabled: true,
      ussd_enabled: true,
      purchase_enabled: true,
      consignment_enabled: false,
      commission_cap_enabled: true,
      commission_rate_bps: 750,
    },
  },
  scheduled: [
    {
      id: "sched-1",
      version: 4,
      scope: { region_id: "reg-1" },
      effective_from: "2026-11-25T00:00:00Z",
      values: { enabled: true },
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  mockedApi.getMarketSettings.mockResolvedValue(baseSettings);
  mockedApi.getEffectiveMarketPolicy.mockResolvedValue(baseSettings);
  mockedApi.getMarketSettingsHistory.mockResolvedValue({
    items: [
      {
        id: "aud-1",
        actor_id: "admin-1",
        permission: "market.manage_master_toggle",
        scope: {},
        reason: "Initial pilot activation",
        effective_from: "2026-11-19T00:00:00Z",
        created_at: "2026-11-19T00:00:00Z",
      },
    ],
  });
  mockedApi.getMarketAgentPolicies.mockResolvedValue({
    items: [
      {
        agent_id: "agent-101",
        version: 2,
        eligibility: "aggregator",
        permitted_modes: ["agent_purchase", "agent_consignment"],
        exposure_cap_minor: 250000,
        commission_participant: true,
        suspended: false,
      },
    ],
  });
});

test("renders effective policy overview, scheduled changes, and audit history", async () => {
  useAuthStore.setState({
    user: { id: "u-1", role: "super_admin" } as never,
    isAuthenticated: true,
  });

  render(<MarketManagementPage />);

  expect(await screen.findByText("v3")).toBeInTheDocument();
  expect(screen.getByText(/Version v4/)).toBeInTheDocument();
  expect(screen.getByText("Initial pilot activation")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("tab", { name: "Audit History" }));
  expect(await screen.findByText("Immutable Policy Audit History")).toBeInTheDocument();
  expect(screen.getByText("Initial pilot activation")).toBeInTheDocument();
});

test("enforces read-only controls when delegated admin lacks write permissions", async () => {
  useAuthStore.setState({
    user: { id: "u-2", role: "admin", permissions: ["market.view"] } as never,
    isAuthenticated: true,
  });

  render(<MarketManagementPage />);
  await screen.findByText("v3");

  fireEvent.click(screen.getByRole("tab", { name: "Global Controls" }));
  expect(await screen.findByText(/Read-only: missing global management permission/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Save Global Policy" })).not.toBeInTheDocument();
});

test("validates required reason, UTC dates, saves new version, and handles stale version conflict", async () => {
  useAuthStore.setState({
    user: { id: "u-1", role: "super_admin" } as never,
    isAuthenticated: true,
  });

  render(<MarketManagementPage />);
  await screen.findByText("v3");

  fireEvent.click(screen.getByRole("tab", { name: "Global Controls" }));
  const saveBtn = await screen.findByRole("button", { name: "Save Global Policy" });

  // Missing reason
  fireEvent.click(saveBtn);
  expect(await screen.findByRole("alert")).toHaveTextContent("Administrative reason is required.");
  expect(mockedApi.createMarketSettingsVersion).not.toHaveBeenCalled();

  // Non-UTC date
  fireEvent.change(screen.getByLabelText("Administrative Reason"), {
    target: { value: "Board approved commission update" },
  });
  fireEvent.change(screen.getByLabelText("Effective From (UTC)"), {
    target: { value: "2026-11-19T12:00:00+01:00" },
  });
  fireEvent.click(saveBtn);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Effective from date must be a valid UTC timestamp ending with Z."
  );

  // Stale version conflict
  fireEvent.change(screen.getByLabelText("Effective From (UTC)"), {
    target: { value: "2026-11-19T12:00:00Z" },
  });
  mockedApi.createMarketSettingsVersion.mockRejectedValueOnce(new Error("stale_version"));
  fireEvent.click(saveBtn);
  expect(await screen.findByRole("alert")).toHaveTextContent(/Version conflict/);

  // Successful save
  mockedApi.createMarketSettingsVersion.mockResolvedValueOnce({
    version: {
      id: "ver-2",
      version: 4,
      scope: {},
      effective_from: "2026-11-19T12:00:00Z",
      values: { enabled: true },
    },
    effective: baseSettings,
  });
  fireEvent.click(saveBtn);

  await waitFor(() => expect(mockedApi.createMarketSettingsVersion).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole("status")).toHaveTextContent("Global market policy version saved.");
});
