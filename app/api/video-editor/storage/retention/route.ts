import { auditRetention } from "@/lib/video-editor/retention-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = await auditRetention();
  return Response.json({ ok: true, ...report });
}
