import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import JobDetailsPage from "@/app/dashboard/onboarding/jobs/[id]/page";
import { useOnboardStore } from "@/stores/useOnboardStore";
import { toast } from "sonner";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock("@/lib/api", () => ({ api: {} }));
jest.mock("@/app/dashboard/onboarding/_components/records-table", () => ({ RecordsTable: () => null }));
jest.mock("@/app/dashboard/onboarding/_components/edit-record-dialog", () => ({ EditRecordDialog: () => null }));
jest.mock("@/app/dashboard/onboarding/_components/view-record-dialog", () => ({ ViewRecordDialog: () => null }));

const confirmJob = jest.fn();
const noop = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  useOnboardStore.setState({
    currentJob: { id: "job-1", status: "completed", fileName: "farmers.xlsx", createdAt: "2026-01-01T00:00:00Z", config: { dry_run: true }, progress: {} } as never,
    error: null, isLoadingJob: false, isConfirming: false, isPolling: false,
    confirmJob, fetchJob: noop, stopPolling: noop, fetchJobSummary: async () => null,
    fetchOnboardedRecords: noop, fetchSkippedRecords: noop, fetchProblematicRecords: noop,
  });
});

test("confirmation shows the current failure and can subsequently succeed", async () => {
  confirmJob.mockImplementationOnce(async () => { useOnboardStore.setState({ error: "Current confirmation error" }); return null; }).mockResolvedValueOnce({ newJobId: "job-2" });
  const params = Promise.resolve({ id: "job-1" });
  await act(async () => { render(<React.Suspense fallback={null}><JobDetailsPage params={params} /></React.Suspense>); });
  fireEvent.click(await screen.findByRole("button", { name: "Confirm Import" }));
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Current confirmation error"));
  expect(mockPush).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirm Import" }));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard/onboarding/jobs/job-2"));
  expect(toast.success).toHaveBeenCalledWith("Import confirmed! Processing started.");
});
