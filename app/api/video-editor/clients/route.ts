import { createClient, listClients } from "@/lib/video-editor/client-store";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return apiOk({ clients: await listClients() });
}

export async function POST(request: Request) {
  try {
    const client = await createClient(await request.json());

    return apiOk({ client }, { status: 201 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "No se pudo crear el cliente.",
    );
  }
}
