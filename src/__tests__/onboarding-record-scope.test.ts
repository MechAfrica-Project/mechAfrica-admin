import { api } from "@/lib/api";
import { useOnboardStore } from "@/stores/useOnboardStore";

jest.mock("@/lib/api", () => ({ api: { getOnboardJob: jest.fn(), getSkippedRecords: jest.fn() } }));

const job = (id: string) => ({ id, status: "processing" });
const page = (count: number) => ({ records: [], count, page: 1, limit: 1, pages: 1 });

beforeEach(() => { useOnboardStore.getState().reset(); jest.resetAllMocks(); });

test("navigation clears counts and ignores a late response from the previous job", async () => {
  jest.mocked(api.getOnboardJob).mockImplementation(async (id) => job(id) as never);
  let resolve!: (value: never) => void;
  jest.mocked(api.getSkippedRecords).mockReturnValue(new Promise((r) => { resolve = r; }));
  await useOnboardStore.getState().fetchJob("a");
  const pending = useOnboardStore.getState().fetchSkippedRecords("a");
  await useOnboardStore.getState().fetchJob("b");
  resolve(page(42) as never);
  await pending;
  expect(useOnboardStore.getState().recordsJobId).toBe("b");
  expect(useOnboardStore.getState().recordsPagination.skipped).toBeNull();
});

test("failed refresh clears previously loaded pagination", async () => {
  jest.mocked(api.getOnboardJob).mockResolvedValue(job("a") as never);
  jest.mocked(api.getSkippedRecords).mockResolvedValueOnce(page(7) as never).mockRejectedValueOnce(new Error("offline"));
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  await useOnboardStore.getState().fetchJob("a");
  await useOnboardStore.getState().fetchSkippedRecords("a");
  expect(useOnboardStore.getState().recordsPagination.skipped?.count).toBe(7);
  await useOnboardStore.getState().fetchSkippedRecords("a");
  expect(useOnboardStore.getState().recordsPagination.skipped).toBeNull();
  log.mockRestore();
});
