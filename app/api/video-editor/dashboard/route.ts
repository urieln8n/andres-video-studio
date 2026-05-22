import {
  getDashboardStats,
  getRecentActivity,
  getRecentErrors,
  getSystemStatus,
  getTopClients,
  getWeeklyProduction,
} from "@/lib/video-editor/dashboard-analytics";
import { listClients } from "@/lib/video-editor/client-store";
import { listJobs } from "@/lib/video-editor/job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [jobs, clients] = await Promise.all([listJobs(), listClients()]);
  const [stats, recentActivity, topClients, weeklyProduction, recentErrors, systemStatus] =
    await Promise.all([
      getDashboardStats(jobs, clients),
      getRecentActivity(jobs, clients),
      getTopClients(jobs, clients),
      getWeeklyProduction(jobs),
      getRecentErrors(jobs, clients),
      getSystemStatus(jobs),
    ]);

  return Response.json({
    ok: true,
    stats,
    recentActivity,
    topClients,
    weeklyProduction,
    recentErrors,
    systemStatus,
  });
}
