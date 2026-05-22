import {
  createExportPackage,
  resolveExportPackageZip,
} from "@/lib/video-editor/export-package-engine";
import { readJob } from "@/lib/video-editor/job-store";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = await readJob(jobId);

  if (!job) {
    return apiError("Job no encontrado.", 404);
  }

  try {
    const exportPackage = await createExportPackage(job);

    return apiOk({ exportPackage });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "No se pudo generar el paquete ZIP.",
    );
  }
}

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
    return apiError("El paquete ZIP todavía no está disponible.", 404);
  }

  return apiOk({
    exportPackage: {
      jobId: job.id,
      zipPath: job.exportPackagePath,
      sizeBytes: zip.size,
      sizeLabel: job.exportPackageSizeLabel ?? null,
    },
  });
}
