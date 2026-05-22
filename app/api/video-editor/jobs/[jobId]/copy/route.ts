import {
  loadCopyPack,
  saveFinalCopy,
} from "@/lib/video-editor/copy-review";
import { readJob } from "@/lib/video-editor/job-store";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return apiError("Job no encontrado.", 404);
  }

  return apiOk({
    copyPack: await loadCopyPack(job),
    finalCopy: job.finalCopy ?? null,
    job,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return apiError("Job no encontrado.", 404);
  }

  const copyPack = await loadCopyPack(job);
  const { finalCopy, job: savedJob } = await saveFinalCopy(
    job,
    await readCopyBody(request),
    copyPack,
  );

  return apiOk({ copyPack, finalCopy, job: savedJob });
}

async function readCopyBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
