import { cleanupOldFiles } from "@/lib/video-editor/retention-policy";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Body JSON inválido.", 400);
  }

  const confirm = (body as Record<string, unknown>)?.confirm;

  if (typeof confirm !== "string") {
    return apiError('Se requiere el campo "confirm" como string.', 400);
  }

  try {
    const result = await cleanupOldFiles(confirm);
    return apiOk(result);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Error al ejecutar la limpieza.",
      400,
    );
  }
}
