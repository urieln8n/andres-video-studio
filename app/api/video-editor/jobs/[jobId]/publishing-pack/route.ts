import { readJob } from "@/lib/video-editor/job-store";
import { loadPublishingPack } from "@/lib/video-editor/publishing-pack-engine";
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

  const publishingPack = await loadPublishingPack(job.id);

  if (!publishingPack) {
    return apiError(
      "El paquete de publicación todavía no está disponible.",
      404,
    );
  }

  return apiOk({ publishingPack });
}
