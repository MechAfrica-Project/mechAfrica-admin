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

test("detail uses current distinct summary and reports discrepancy and role overlap", async () => {
  const noop = jest.fn();
  useOnboardStore.setState({ currentJob: job, error: null, isLoadingJob: false, isPolling: false, fetchJob: noop, stopPolling: noop, fetchOnboardedRecords: noop, fetchSkippedRecords: noop, fetchProblematicRecords: noop, fetchJobSummary: async () => ({ onboarded: { count: 6 }, result_summary: { farmers_created: 5, providers_created: 4 } }) as never });
  await act(async () => { render(<React.Suspense fallback={null}><JobDetailsPage params={Promise.resolve({ id: "job-1" })} /></React.Suspense>); });
  expect(await screen.findByText(/6 participants are ready to import/)).toBeInTheDocument();
  expect(screen.getByText(/Stored result reports 7 participants, while the current staged summary reports 6/)).toBeInTheDocument();
  expect(screen.getByText(/role counts may overlap/)).toBeInTheDocument();
});
