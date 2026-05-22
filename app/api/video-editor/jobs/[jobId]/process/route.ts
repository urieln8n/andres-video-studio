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
      ok: true,
      job,
      message: "El vídeo ya fue procesado",
    });
  }

  if (job.status === "processing") {
    return Response.json(
      {
        ok: true,
        job,
        message: "El vídeo ya se está procesando",
      },
      { status: 202 },
    );
  }

  if (!(await acquireProcessingLock(job.id))) {
    return Response.json(
      {
        ok: true,
        job: await readJob(job.id),
        message: "El vídeo ya se está procesando",
      },
      { status: 202 },
    );
  }

  await markJobProcessing(job.id);
  await appendJobLog(job.id, "Procesamiento iniciado.");

  // Fire-and-forget: processing runs in the background and manages its own
  // state (markJobCompleted / markJobFailed). The lock is released when done.
  processVideoEditorJob(job.id)
    .catch(() => {
      // Errors are already persisted by markJobFailed inside the pipeline.
    })
    .finally(() => {
      releaseProcessingLock(job.id);
    });

  return Response.json(
    {
      ok: true,
      job: await readJob(job.id),
      message: "Procesamiento iniciado",
    },
    { status: 202 },
  );
}
