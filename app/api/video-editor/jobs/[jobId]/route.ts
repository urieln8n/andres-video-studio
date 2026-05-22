import {
  deleteJobArtifacts,
  readJob,
} from "@/lib/video-editor/job-store";
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

  return apiOk({ job });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const deleted = await deleteJobArtifacts(jobId);

  if (!deleted) {
    return apiError("Job no encontrado.", 404);
  }

  return apiOk({
    deletedFiles: deleted.deletedFiles,
    jobId: deleted.job.id,
    message: "Job y artefactos locales borrados.",
  });
}
