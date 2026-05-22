import {
  createMp4Response,
  resolveFinalVideoFile,
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
    return apiError("El vídeo final todavía no está disponible.", 404);
  }

  return createMp4Response({
    disposition: "inline",
    file: video,
    rangeHeader: request.headers.get("range"),
  });
}
