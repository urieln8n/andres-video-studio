import {
  deleteClient,
  readClient,
  updateClient,
} from "@/lib/video-editor/client-store";
import { listJobs } from "@/lib/video-editor/job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;
  const client = await readClient(clientId);

  if (!client) {
    return Response.json({ error: "Cliente no encontrado." }, { status: 404 });
  }

  return Response.json({ ok: true, client });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const { clientId } = await params;

  try {
    const client = await updateClient(clientId, await request.json());

    if (!client) {
      return Response.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    return Response.json({ ok: true, client });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el cliente." },
      { status: 400 },
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
    return Response.json(
      { error: "Este cliente tiene vídeos asociados. No se borró." },
      { status: 409 },
    );
  }

  const client = await deleteClient(clientId);

  if (!client) {
    return Response.json({ error: "Cliente no encontrado." }, { status: 404 });
  }

  return Response.json({ ok: true, clientId: client.id });
}
