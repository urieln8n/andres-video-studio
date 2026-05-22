import {
  loadCopyPack,
  saveFinalCopy,
} from "@/lib/video-editor/copy-review";
import { readJob } from "@/lib/video-editor/job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return Response.json({ error: "Job no encontrado." }, { status: 404 });
  }

  return Response.json({
    ok: true,
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
    return Response.json({ error: "Job no encontrado." }, { status: 404 });
  }

  const copyPack = await loadCopyPack(job);
  const { finalCopy, job: savedJob } = await saveFinalCopy(
    job,
    await readCopyBody(request),
    copyPack,
  );

  return Response.json({ ok: true, copyPack, finalCopy, job: savedJob });
}

async function readCopyBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
