import { EmptyText, formatDateTime, PanelHeader } from "@/components/video-editor/RecentActivityList";
import type { DashboardSystemStatus } from "@/lib/video-editor/dashboard-analytics";

export function SystemStatusPanel({
  status,
}: {
  status: DashboardSystemStatus;
}) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <PanelHeader
        description="Lectura local de storage sin comprobaciones externas."
        title="Estado del sistema"
      />
      {status.storageAvailable ? (
        <dl className="mt-5 grid gap-2 sm:grid-cols-2">
          <Status label="Modo" value="Sistema local activo" tone="success" />
          <Status label="Jobs cargados" value={String(status.jobsLoaded)} />
          <Status label="Storage jobs" value={status.jobsStorageLabel} />
          <Status label="Storage output" value={status.outputStorageLabel} />
          <Status label="Storage exports" value={status.exportsStorageLabel} />
          <Status
            label="Último error"
            tone={status.latestErrorAt ? "danger" : "success"}
            value={status.latestErrorAt ? formatDateTime(status.latestErrorAt) : "Sin fallos"}
          />
        </dl>
      ) : (
        <EmptyText text="Storage local no disponible para métricas." />
      )}
    </section>
  );
}

function Status({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "neutral" | "success" | "danger";
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-3">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className={`mt-1 break-words text-sm font-semibold ${statusStyles[tone]}`}>
        {value}
      </dd>
    </div>
  );
}

const statusStyles = {
  neutral: "text-zinc-100",
  success: "text-emerald-100",
  danger: "text-rose-100",
};
