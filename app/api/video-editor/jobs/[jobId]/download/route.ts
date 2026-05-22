import {
  createMp4Response,
  resolveFinalVideoFile,
  withDownloadName,
} from "@/lib/video-editor/file-response";
import { readJob } from "@/lib/video-editor/job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return Response.json({ error: "Job no encontrado." }, { status: 404 });
  }

  const video = await resolveFinalVideoFile(job);

  if (!video) {
    return Response.json(
      { error: "No existe un vídeo final descargable para este job." },
      { status: 404 },
    );
  }

  return createMp4Response({
    disposition: "attachment",
    file: withDownloadName(video, jobId),
    rangeHeader: request.headers.get("range"),
  });
}
