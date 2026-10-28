import { api } from "@/lib/api";
import { useOnboardStore } from "@/stores/useOnboardStore";

jest.mock("@/lib/api", () => ({
  api: {
    uploadBulkOnboard: jest.fn(),
    confirmOnboardJob: jest.fn(),
  },
}));

describe("bulk onboarding failures", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("clears the simulated progress timer and retains the current upload error on rejection", async () => {
    jest.useFakeTimers();
    jest.mocked(api.uploadBulkOnboard).mockRejectedValue(new Error("Network unavailable"));

    const result = await useOnboardStore.getState().uploadFile(new File(["data"], "data.xlsx"));

    expect(result).toBeNull();
    expect(useOnboardStore.getState()).toMatchObject({
      isUploading: false,
      uploadProgress: 0,
      uploadError: "Network unavailable",
    });
    expect(jest.getTimerCount()).toBe(0);
    jest.advanceTimersByTime(1000);
    expect(useOnboardStore.getState().uploadProgress).toBe(0);
  });

  it("exposes confirmation failures", async () => {
    jest.mocked(api.confirmOnboardJob).mockRejectedValue(new Error("Confirmation failed"));

    expect(await useOnboardStore.getState().confirmJob("job-1")).toBeNull();
    expect(useOnboardStore.getState()).toMatchObject({
      isConfirming: false,
      error: "Confirmation failed",
    });
  });
});
