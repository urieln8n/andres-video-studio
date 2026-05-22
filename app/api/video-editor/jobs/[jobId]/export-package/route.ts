import {
  createExportPackage,
  resolveExportPackageZip,
} from "@/lib/video-editor/export-package-engine";
import { readJob } from "@/lib/video-editor/job-store";

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

  try {
    const exportPackage = await createExportPackage(job);

    return Response.json({ ok: true, exportPackage });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo generar el paquete ZIP.",
      },
      { status: 400 },
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
    return Response.json({ error: "Job no encontrado." }, { status: 404 });
  }

  const zip = await resolveExportPackageZip(job);

  if (!zip) {
    return Response.json(
      { error: "El paquete ZIP todavía no está disponible." },
      { status: 404 },
    );
  }

  return Response.json({
    ok: true,
    exportPackage: {
      jobId: job.id,
      zipPath: job.exportPackagePath,
      sizeBytes: zip.size,
      sizeLabel: job.exportPackageSizeLabel ?? null,
    },
  });
}
