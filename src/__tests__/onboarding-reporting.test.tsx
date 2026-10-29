import React from "react";
import { act, render, screen } from "@testing-library/react";
import { JobCard } from "@/app/dashboard/onboarding/_components/job-card";
import JobDetailsPage from "@/app/dashboard/onboarding/jobs/[id]/page";
import { useOnboardStore } from "@/stores/useOnboardStore";
import type { FrontendOnboardJob } from "@/lib/api/types";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/lib/api", () => ({ api: {} }));
jest.mock("@/app/dashboard/onboarding/_components/records-table", () => ({ RecordsTable: () => null }));
jest.mock("@/app/dashboard/onboarding/_components/edit-record-dialog", () => ({ EditRecordDialog: () => null }));
jest.mock("@/app/dashboard/onboarding/_components/view-record-dialog", () => ({ ViewRecordDialog: () => null }));

const job = { id: "job-1", status: "completed", fileName: "farmers.xlsx", createdAt: "2026-01-01T00:00:00Z", config: { dry_run: true }, progress: { farmers_created: 5, providers_created: 4 }, result: { processed: 7 } } as FrontendOnboardJob;

test("list prefers current staged count including zero and labels its source", () => {
  render(<JobCard job={{ ...job, participantCount: 0 }} />);
  expect(screen.getByText("Current staged count").parentElement).toHaveTextContent("0");
  expect(screen.getByText("Current staged count")).toBeInTheDocument();
  expect(screen.getByText("Ready to import")).toBeInTheDocument();
});

test("list falls back to stored distinct count rather than adding roles", () => {
  render(<JobCard job={job} />);
  expect(screen.getByText("7")).toBeInTheDocument();
  expect(screen.getByText("Stored result count")).toBeInTheDocument();
});

test("list uses current skipped and attention counts even when zero", () => {
  render(<JobCard job={{ ...job, skippedCount: 0, problematicCount: 2, progress: { ...job.progress, skipped: 9, errors: 8 } }} />);
  expect(screen.getByText("Current records").parentElement).toHaveTextContent("0");
  expect(screen.getByText("Current records, including edited awaiting retry").parentElement).toHaveTextContent("2");
});

test("list identifies historical fallback counts", () => {
  render(<JobCard job={{ ...job, progress: { ...job.progress, skipped: 3, errors: 4 } }} />);
  expect(screen.getByText("Historical count").parentElement).toHaveTextContent("3");
  expect(screen.getByText("Historical error count").parentElement).toHaveTextContent("4");
});

test("detail ignores pagination belonging to a previous job when summary fails", async () => {
  const noop = jest.fn();
  useOnboardStore.setState({ currentJob: { ...job, status: "processing", progress: { ...job.progress, skipped: 3, errors: 4 } }, recordsJobId: "other-job", recordsPagination: { onboarded: null, skipped: { count: 80, page: 1, limit: 1, pages: 80 }, problematic: { count: 90, page: 1, limit: 1, pages: 90 } }, error: null, isLoadingJob: false, isPolling: true, fetchJob: noop, stopPolling: noop, fetchOnboardedRecords: noop, fetchSkippedRecords: noop, fetchProblematicRecords: noop, fetchJobSummary: async () => null });
  await act(async () => { render(<React.Suspense fallback={null}><JobDetailsPage params={Promise.resolve({ id: "job-1" })} /></React.Suspense>); });
  expect(screen.getByText("Historical count").parentElement).toHaveTextContent("3");
  expect(screen.getByText("Historical error count").parentElement).toHaveTextContent("4");
  expect(screen.queryByText("80")).not.toBeInTheDocument();
  expect(screen.queryByText("90")).not.toBeInTheDocument();
});

test("detail uses current distinct summary and reports discrepancy and role overlap", async () => {
  const noop = jest.fn();
  useOnboardStore.setState({ currentJob: job, error: null, isLoadingJob: false, isPolling: false, fetchJob: noop, stopPolling: noop, fetchOnboardedRecords: noop, fetchSkippedRecords: noop, fetchProblematicRecords: noop, fetchJobSummary: async () => ({ onboarded: { count: 6 }, skipped: { count: 0 }, errors: { count: 2 }, result_summary: { farmers_created: 5, providers_created: 4 } }) as never });
  await act(async () => { render(<React.Suspense fallback={null}><JobDetailsPage params={Promise.resolve({ id: "job-1" })} /></React.Suspense>); });
  expect(await screen.findByText(/6 participants are ready to import/)).toBeInTheDocument();
  expect(screen.getByText(/Stored result reports 7 participants, while the current staged summary reports 6/)).toBeInTheDocument();
  expect(screen.getByText(/role counts may overlap/)).toBeInTheDocument();
  expect(screen.getByText("Current records").parentElement).toHaveTextContent("0");
  expect(screen.getByText("Current records, including edited awaiting retry").parentElement).toHaveTextContent("2");
});
