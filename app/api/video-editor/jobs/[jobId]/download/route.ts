import {
  createMp4Response,
  resolveFinalVideoFile,
  withDownloadName,
} from "@/lib/video-editor/file-response";
import { readJob } from "@/lib/video-editor/job-store";
import { apiError } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return apiError("Job no encontrado.", 404);
  }

  const video = await resolveFinalVideoFile(job);

  if (!video) {
    return apiError("No existe un vídeo final descargable para este job.", 404);
  }

  return createMp4Response({
    disposition: "attachment",
    file: withDownloadName(video, jobId),
    rangeHeader: request.headers.get("range"),
  });
}
