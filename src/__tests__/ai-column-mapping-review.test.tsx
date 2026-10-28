import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AIColumnMappingReview } from "@/app/dashboard/onboarding/_components/ai-column-mapping-review";
import type { ColumnAnalysisResult } from "@/lib/api/types";

jest.mock("@/components/ui/select", () => {
  return {
    Select: ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => (
      <select value={value} onChange={(event) => onValueChange(event.target.value)}>{children}</select>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{value === "__skip__" ? "Skip" : children}</option>,
  };
});

const analysis: ColumnAnalysisResult = {
  file_name: "farmers.xlsx", sheet_name: "Sheet1", headers: ["Name", "Phone", "Region", "Activity", "Gender"],
  sample_rows: [], unmapped_headers: [], missing_fields: ["first_name"], ai_powered: true,
  mappings: [
    { field_name: "first_name", mapped_to: "Missing", confidence: 0.8, reasoning: "Suggestion" },
    { field_name: "phone_number", mapped_to: "Phone", confidence: 0.9, reasoning: "Phone suggestion" },
    { field_name: "region_id", mapped_to: "Region", confidence: 0.9, reasoning: "Region suggestion" },
    { field_name: "activity", mapped_to: "Activity", confidence: 0.9, reasoning: "Activity suggestion" },
    { field_name: "gender", mapped_to: "Old gender", confidence: 0.9, reasoning: "Stale" },
  ],
};

function selector(label: string) {
  const row = screen.getByText(label, { selector: "span.text-sm.font-medium" }).closest("div.flex.items-center.gap-4");
  if (!row) throw new Error(`Missing row: ${label}`);
  return within(row as HTMLElement).getByRole("combobox");
}

test("corrects required mappings, omits stale optional mappings, and confirms current choices", () => {
  const onConfirm = jest.fn();
  render(<AIColumnMappingReview analysis={analysis} onConfirm={onConfirm} onCancel={jest.fn()} />);
  expect(screen.getByRole("button", { name: /Missing:/ })).toBeDisabled();
  expect(selector("Gender")).toHaveValue("__skip__");
  fireEvent.change(selector("Full / First Name"), { target: { value: "Name" } });
  expect(screen.queryByText(/Missing required fields:/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Confirm Mapping & Start Import" }));
  expect(onConfirm).toHaveBeenCalledWith(expect.arrayContaining([
    expect.objectContaining({ field_name: "first_name", mapped_to: "Name", reasoning: "Manually confirmed by admin" }),
    expect.objectContaining({ field_name: "phone_number", mapped_to: "Phone", reasoning: "Phone suggestion" }),
  ]));
  expect(onConfirm.mock.calls[0][0]).toHaveLength(4);
  fireEvent.change(selector("Gender"), { target: { value: "Gender" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm Mapping & Start Import" }));
  expect(onConfirm.mock.calls[1][0]).toEqual(expect.arrayContaining([expect.objectContaining({ field_name: "gender", mapped_to: "Gender" })]));
  fireEvent.change(selector("Phone Number"), { target: { value: "__skip__" } });
  expect(screen.getByRole("button", { name: /Missing: Phone Number/ })).toBeDisabled();
});

test("cancels without confirming", () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  render(<AIColumnMappingReview analysis={analysis} onConfirm={onConfirm} onCancel={onCancel} />);
  fireEvent.click(screen.getByRole("button", { name: "Back to Upload" }));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();
});
