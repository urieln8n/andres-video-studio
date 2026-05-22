import {
  deleteClient,
  readClient,
  updateClient,
} from "@/lib/video-editor/client-store";
import { listJobs } from "@/lib/video-editor/job-store";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;
  const client = await readClient(clientId);

  if (!client) {
    return apiError("Cliente no encontrado.", 404);
  }

  return apiOk({ client });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;

  try {
    const client = await updateClient(clientId, await request.json());

    if (!client) {
      return apiError("Cliente no encontrado.", 404);
    }

    return apiOk({ client });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el cliente.",
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;
  const jobs = await listJobs();

  if (jobs.some((job) => job.config?.clientId === clientId)) {
    return apiError("Este cliente tiene vídeos asociados. No se borró.", 409);
  }

  const client = await deleteClient(clientId);

  if (!client) {
    return apiError("Cliente no encontrado.", 404);
  }

  return apiOk({ clientId: client.id });
}
