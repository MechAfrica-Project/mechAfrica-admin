import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UploadPage from "@/app/dashboard/onboarding/upload/page";
import { useOnboardStore } from "@/stores/useOnboardStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));
jest.mock("@/lib/api", () => ({ api: { analyzeColumns: jest.fn() } }));
jest.mock("@/stores/useHeaderStore", () => ({ useHeaderStore: () => ({ setTitle: jest.fn() }) }));
jest.mock("@/app/dashboard/onboarding/_components/upload-dropzone", () => ({
  UploadDropzone: ({ onFileSelect }: { onFileSelect: (file: File) => void }) => <button onClick={() => onFileSelect(new File(["data"], "farmers.xlsx"))}>Choose file</button>,
}));
jest.mock("@/app/dashboard/onboarding/_components/upload-options", () => ({ UploadOptionsForm: () => null }));
jest.mock("@/app/dashboard/onboarding/_components/ai-column-mapping-review", () => ({
  AIColumnMappingReview: ({ onConfirm, onCancel }: { onConfirm: (mapping: unknown[]) => void; onCancel: () => void }) => <><button onClick={() => onConfirm([])}>Confirm mapping</button><button onClick={onCancel}>Cancel review</button></>,
}));

const uploadFile = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  useOnboardStore.setState({ uploadFile, uploadError: null, isUploading: false, uploadProgress: 0 });
});

async function chooseFile() {
  fireEvent.click(screen.getByRole("button", { name: "Choose file" }));
}

test("direct upload reports the latest failure and returns to selection", async () => {
  uploadFile.mockImplementation(async () => { useOnboardStore.setState({ uploadError: "Current upload failure" }); return null; });
  render(<UploadPage />);
  await chooseFile();
  fireEvent.click(screen.getByRole("button", { name: /Skip AI/ }));
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Current upload failure"));
  expect(screen.getByRole("button", { name: /Skip AI/ })).toBeEnabled();
  expect(mockPush).not.toHaveBeenCalled();
});

test("review failure returns to review, cancellation works, and direct success navigates", async () => {
  jest.mocked(api.analyzeColumns).mockResolvedValue({} as never);
  uploadFile.mockImplementationOnce(async () => { useOnboardStore.setState({ uploadError: "Mapping upload failed" }); return null; }).mockResolvedValueOnce("job-42");
  render(<UploadPage />);
  await chooseFile();
  fireEvent.click(screen.getByRole("button", { name: /Analyze with AI/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Confirm mapping" }));
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Mapping upload failed"));
  fireEvent.click(await screen.findByRole("button", { name: "Cancel review" }));
  fireEvent.click(screen.getByRole("button", { name: /Skip AI/ }));
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard/onboarding/jobs/job-42"));
  expect(toast.success).toHaveBeenCalledWith("File uploaded successfully! Processing started.");
});
