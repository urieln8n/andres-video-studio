import { readFile } from "node:fs/promises";

import { resolveExportPackageZip } from "@/lib/video-editor/export-package-engine";
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

  const zip = await resolveExportPackageZip(job);

  if (!zip) {
    return Response.json(
      { error: "El ZIP no está disponible para descargar." },
      { status: 404 },
    );
  }

  const body = await readFile(zip.absolutePath);

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${zip.fileName.replace(/[\r\n"]/g, "_")}"`,
      "Content-Length": String(body.byteLength),
      "Content-Type": "application/zip",
    },
  });
}
