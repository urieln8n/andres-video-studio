import { runHealthCheck } from "@/lib/video-editor/health-check";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await runHealthCheck();
  return Response.json(result, { status: result.ok ? 200 : 503 });
}
