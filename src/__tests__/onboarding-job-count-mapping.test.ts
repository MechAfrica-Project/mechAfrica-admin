import { MechAfricaAPIClient } from "@/lib/api/client";
import type { BackendOnboardJob, FrontendOnboardJob } from "@/lib/api/types";

test("maps optional current counts without losing zeros", () => {
  const client = new MechAfricaAPIClient() as unknown as { transformOnboardJob: (job: BackendOnboardJob) => FrontendOnboardJob };
  const transform = (counts: Partial<BackendOnboardJob>) => client.transformOnboardJob(counts as BackendOnboardJob);
  expect(transform({ skipped_count: 0, problematic_count: 3 })).toMatchObject({ skippedCount: 0, problematicCount: 3 });
  expect(transform({})).toMatchObject({ skippedCount: undefined, problematicCount: undefined });
});
