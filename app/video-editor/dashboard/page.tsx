import Link from "next/link";

import { AgencyDashboardHeader } from "@/components/video-editor/AgencyDashboardHeader";
import { AgencyMetricCard } from "@/components/video-editor/AgencyMetricCard";
import { QuickActionsGrid } from "@/components/video-editor/QuickActionsGrid";
import { RecentActivityList } from "@/components/video-editor/RecentActivityList";
import { RecentErrorsPanel } from "@/components/video-editor/RecentErrorsPanel";
import { SystemStatusPanel } from "@/components/video-editor/SystemStatusPanel";
import { TopClientsPanel } from "@/components/video-editor/TopClientsPanel";
import { WeeklyProductionChart } from "@/components/video-editor/WeeklyProductionChart";
import { listClients } from "@/lib/video-editor/client-store";
import {
  getDashboardStats,
  getJobClientId,
  getRecentActivity,
  getRecentErrors,
  getSystemStatus,
  getTopClients,
  getWeeklyProduction,
  isBarberiaOSJob,
} from "@/lib/video-editor/dashboard-analytics";
import { listJobs } from "@/lib/video-editor/job-store";
import type { VideoEditorJob } from "@/lib/video-editor/types";

export const dynamic = "force-dynamic";

type DashboardFilter =
  | "all"
  | "barberiaos"
  | "agency"
  | "client_errors"
  | "unassigned";

const filters: { id: DashboardFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "barberiaos", label: "BarberíaOS" },
  { id: "agency", label: "Agencia" },
  { id: "client_errors", label: "Clientes con errores" },
  { id: "unassigned", label: "Jobs sin cliente" },
];

export default async function AgencyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const [jobs, clients] = await Promise.all([listJobs(), listClients()]);
  const filter = getFilter((await searchParams).filter);
  const filteredJobs = filterJobs(jobs, filter);
  const [stats, recentActivity, topClients, weeklyProduction, recentErrors, systemStatus] =
    await Promise.all([
      getDashboardStats(filteredJobs, clients),
      getRecentActivity(filteredJobs, filter === "all" ? clients : []),
      getTopClients(filteredJobs, clients),
      getWeeklyProduction(filteredJobs),
      getRecentErrors(filteredJobs, clients),
      getSystemStatus(filteredJobs),
    ]);

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AgencyDashboardHeader />
        <DashboardFilters activeFilter={filter} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <AgencyMetricCard label="Total de clientes" tone="gold" value={stats.totalClients} />
          <AgencyMetricCard label="Vídeos totales" value={stats.totalJobs} />
          <AgencyMetricCard
            label="Vídeos completados"
            tone="success"
            value={stats.completedJobs}
          />
          <AgencyMetricCard label="Vídeos fallidos" tone="danger" value={stats.failedJobs} />
          <AgencyMetricCard label="Vídeos en proceso" value={stats.processingJobs} />
          <AgencyMetricCard label="Packs ZIP generados" tone="success" value={stats.exportPackages} />
          <AgencyMetricCard
            label="Publishing packs generados"
            tone="gold"
            value={stats.publishingPacks}
          />
          <AgencyMetricCard label="Vídeos BarberíaOS" tone="gold" value={stats.barberiaosJobs} />
          <AgencyMetricCard
            detail="Tiempo estimado ahorrado"
            label="Ahorro de producción"
            tone="success"
            value={`${stats.estimatedTimeSavedMinutes} min`}
          />
          <AgencyMetricCard label="Espacio usado en storage" value={stats.storageUsageLabel} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <RecentActivityList activity={recentActivity} />
          <TopClientsPanel clients={topClients} />
        </div>
        <WeeklyProductionChart production={weeklyProduction} />
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <SystemStatusPanel status={systemStatus} />
          <RecentErrorsPanel errors={recentErrors} />
        </div>
        <QuickActionsGrid />
      </section>
    </main>
  );
}

function DashboardFilters({ activeFilter }: { activeFilter: DashboardFilter }) {
  return (
    <nav
      aria-label="Filtros rápidos del dashboard"
      className="flex flex-wrap gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl"
    >
      {filters.map((filter) => (
        <Link
          aria-current={activeFilter === filter.id ? "page" : undefined}
          className={
            activeFilter === filter.id
              ? "inline-flex min-h-10 items-center rounded-[8px] border border-[#efd8ad]/30 bg-[#d6b26e]/16 px-4 text-sm font-semibold text-[#efd8ad]"
              : "inline-flex min-h-10 items-center rounded-[8px] border border-white/10 bg-black/20 px-4 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
          }
          href={
            filter.id === "all"
              ? "/video-editor/dashboard"
              : `/video-editor/dashboard?filter=${filter.id}`
          }
          key={filter.id}
        >
          {filter.label}
        </Link>
      ))}
    </nav>
  );
}

function filterJobs(jobs: VideoEditorJob[], filter: DashboardFilter) {
  if (filter === "barberiaos") {
    return jobs.filter(isBarberiaOSJob);
  }

  if (filter === "agency") {
    return jobs.filter((job) => Boolean(getJobClientId(job)));
  }

  if (filter === "client_errors") {
    return jobs.filter((job) => job.status === "failed" && Boolean(getJobClientId(job)));
  }

  if (filter === "unassigned") {
    return jobs.filter((job) => !getJobClientId(job));
  }

  return jobs;
}

function getFilter(value: string | string[] | undefined): DashboardFilter {
  const selected = Array.isArray(value) ? value[0] : value;

  return filters.some((filter) => filter.id === selected)
    ? (selected as DashboardFilter)
    : "all";
}
