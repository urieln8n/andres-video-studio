import { readJob } from "@/lib/video-editor/job-store";
import { loadPublishingPack } from "@/lib/video-editor/publishing-pack-engine";

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

  const publishingPack = await loadPublishingPack(job.id);

  if (!publishingPack) {
    return Response.json(
      { error: "El paquete de publicación todavía no está disponible." },
      { status: 404 },
    );
  }

  return Response.json({ ok: true, publishingPack });
}
