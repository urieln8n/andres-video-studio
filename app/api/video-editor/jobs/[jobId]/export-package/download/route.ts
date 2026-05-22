import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { resolveExportPackageZip } from "@/lib/video-editor/export-package-engine";
import { readJob } from "@/lib/video-editor/job-store";
import { apiError } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return apiError("Job no encontrado.", 404);
  }

  const zip = await resolveExportPackageZip(job);

  if (!zip) {
    return apiError("El ZIP no está disponible para descargar.", 404);
  }

  const zipStat = await stat(zip.absolutePath).catch(() => null);
  if (!zipStat) {
    return apiError("El archivo ZIP no está disponible.", 404);
  }

  const stream = createReadStream(zip.absolutePath);
  const body = Readable.toWeb(stream) as ReadableStream;

  return new Response(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${zip.fileName.replace(/[\r\n"]/g, "_")}"`,
      "Content-Length": String(zipStat.size),
      "Content-Type": "application/zip",
    },
  });
}
