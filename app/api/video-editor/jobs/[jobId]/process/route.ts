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
  markJobProcessing,
} from "@/lib/video-editor/progress";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return apiError("Job no encontrado.", 404);
  }

  if (
    job.status === "completed" &&
    (await fileHasContent(getOutputAbsolutePath(job.id)))
  ) {
    return apiOk({
      job,
      message: "El vídeo ya fue procesado",
    });
  }

  if (job.status === "awaiting_copy_review") {
    return apiOk({
      job,
      nextUrl: `/video-editor/copy?jobId=${encodeURIComponent(job.id)}`,
      message: "El copy espera revisión",
    });
  }

  if (job.status === "copy_approved") {
    return apiOk({
      job,
      nextUrl: `/video-editor/copy?jobId=${encodeURIComponent(job.id)}`,
      message: "El copy ya está aprobado. Lanza el render final desde revisión.",
    });
  }

  if (job.status === "processing" || job.status === "rendering_final") {
    return apiOk(
      {
        job,
        message: "El vídeo ya se está procesando",
      },
      { status: 202 },
    );
  }

  const body = await readProcessBody(request);
  const mode =
    body.mode === "full" || body.mode === "prepare_copy"
      ? body.mode
      : job.config?.copyReviewEnabled === true
          ? "prepare_copy"
          : "full";

  if (!(await acquireProcessingLock(job.id))) {
    return apiOk(
      {
        job: await readJob(job.id),
        message: "El vídeo ya se está procesando",
      },
      { status: 202 },
    );
  }

  await markJobProcessing(job.id);
  await appendJobLog(
    job.id,
    mode === "prepare_copy"
      ? "Preparación de copy iniciada."
      : "Procesamiento iniciado.",
  );

  // Fire-and-forget: processing runs in the background and manages its own
  // state (markJobCompleted / markJobFailed). The lock is released when done.
  processVideoEditorJob(job.id, mode)
    .catch(() => {
      // Errors are already persisted by markJobFailed inside the pipeline.
    })
    .finally(() => {
      releaseProcessingLock(job.id);
    });

  return apiOk(
    {
      job: await readJob(job.id),
      message:
        mode === "prepare_copy"
          ? "Preparación de copy iniciada"
          : "Procesamiento iniciado",
    },
    { status: 202 },
  );
}

async function readProcessBody(request: Request) {
  try {
    return (await request.json()) as { mode?: unknown };
  } catch {
    return {};
  }
}
