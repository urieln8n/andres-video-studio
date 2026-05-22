import { loadCopyPack, saveFinalCopy } from "@/lib/video-editor/copy-review";
import { processVideoEditorJob } from "@/lib/video-editor/ffmpeg-engine";
import {
  acquireProcessingLock,
  readJob,
  releaseProcessingLock,
  updateJob,
} from "@/lib/video-editor/job-store";
import { touchJob } from "@/lib/video-editor/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  let job = await readJob(jobId);

  if (!job) {
    return Response.json({ error: "Job no encontrado." }, { status: 404 });
  }

  if (job.status === "processing" || job.status === "rendering_final") {
    return Response.json(
      { ok: true, job, message: "El render final ya está en curso" },
      { status: 202 },
    );
  }

  if (!job.finalCopy) {
    const copyPack = await loadCopyPack(job);
    const approved = await saveFinalCopy(
      job,
      {
        selectedHook: copyPack.hooks[0],
        selectedCta: copyPack.ctas[0],
        title: copyPack.title,
        description: copyPack.description,
        hashtags: copyPack.hashtags,
        source: "generated",
      },
      copyPack,
    );

    job = approved.job ?? job;
  }

  if (!(await acquireProcessingLock(job.id))) {
    return Response.json(
      {
        ok: true,
        job: await readJob(job.id),
        message: "El render final ya está en curso",
      },
      { status: 202 },
    );
  }

  await updateJob(job.id, (currentJob) =>
    touchJob({
      ...currentJob,
      status: "rendering_final",
      progress: Math.max(5, currentJob.progress),
      currentStep: "starting",
      currentStepLabel: "Render final",
      logs: [...currentJob.logs, "Render final iniciado con copy aprobado"],
      errorMessage: undefined,
    }),
  );

  processVideoEditorJob(job.id, "full")
    .catch(() => {
      // The pipeline persists its own failure state.
    })
    .finally(() => {
      releaseProcessingLock(job.id);
    });

  return Response.json(
    {
      ok: true,
      job: await readJob(job.id),
      message: "Render final iniciado",
    },
    { status: 202 },
  );
}
