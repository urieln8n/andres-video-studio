import { resolveFinalVideoFile } from "@/lib/video-editor/file-response";
import { listJobs } from "@/lib/video-editor/job-store";
import type { VideoEditorLibraryJob } from "@/lib/video-editor/types";
import { apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = await listJobs();
  const libraryJobs = await Promise.all(
    jobs.map(async (job) => ({
      ...job,
      hasFinalVideo: Boolean(await resolveFinalVideoFile(job)),
    })),
  );

  return apiOk({ jobs: libraryJobs satisfies VideoEditorLibraryJob[] });
}
