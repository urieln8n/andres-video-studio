import { createClient, listClients } from "@/lib/video-editor/client-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, clients: await listClients() });
}

export async function POST(request: Request) {
  try {
    const client = await createClient(await request.json());

    return Response.json({ ok: true, client }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el cliente." },
      { status: 400 },
    );
  }
}
