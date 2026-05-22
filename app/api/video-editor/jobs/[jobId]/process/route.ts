import { processVideoEditorJob } from "@/lib/video-editor/ffmpeg-engine";
import {
  acquireProcessingLock,
  fileHasContent,
  getOutputAbsolutePath,
  readJob,
  releaseProcessingLock,
} from "@/lib/video-editor/job-store";
import {
  appendJobLog,
  markJobFailed,
  markJobProcessing,
} from "@/lib/video-editor/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return Response.json({ error: "Job no encontrado." }, { status: 404 });
  }

  if (
    job.status === "completed" &&
    (await fileHasContent(getOutputAbsolutePath(job.id)))
  ) {
    return Response.json({
      job,
      message: "El vídeo ya fue procesado",
    });
  }

  if (job.status === "processing") {
    return Response.json(
      {
        job,
        message: "El vídeo ya se está procesando",
      },
      { status: 202 },
    );
  }

  if (!(await acquireProcessingLock(job.id))) {
    return Response.json(
      {
        job: await readJob(job.id),
        message: "El vídeo ya se está procesando",
      },
      { status: 202 },
    );
  }

  try {
    await markJobProcessing(job.id);
    await appendJobLog(job.id, "Procesamiento iniciado.");
    const processedJob = await processVideoEditorJob(job.id);

    if (!processedJob) {
      return Response.json({ error: "Job no encontrado." }, { status: 404 });
    }

    return Response.json({ job: processedJob });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo procesar el vídeo subtitulado con FFmpeg.";

    await markJobFailed(job.id, message);

    return Response.json(
      {
        error: message,
        job: await readJob(job.id),
      },
      { status: 500 },
    );
  } finally {
    await releaseProcessingLock(job.id);
  }
}
