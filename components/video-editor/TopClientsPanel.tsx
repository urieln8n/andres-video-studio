import Link from "next/link";

import { EmptyText, formatDateTime, PanelHeader } from "@/components/video-editor/RecentActivityList";
import { clientSectorLabels } from "@/lib/video-editor/client-utils";
import type { DashboardTopClient } from "@/lib/video-editor/dashboard-analytics";

export function TopClientsPanel({ clients }: { clients: DashboardTopClient[] }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <PanelHeader
        description="Ranking por número de jobs asociados a clientes."
        title="Clientes más activos"
      />
      {clients.length ? (
        <div className="mt-5 grid gap-3">
          {clients.map((client) => (
            <article
              className="grid gap-4 rounded-[8px] border border-white/[0.08] bg-black/20 p-4 md:grid-cols-[1fr_auto] md:items-center"
              key={client.id}
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {client.businessName}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {clientSectorLabels[client.sector]} · Último vídeo{" "}
                  {formatDateTime(client.lastVideoAt)}
                </p>
                <dl className="mt-3 flex flex-wrap gap-2 text-sm">
                  <Metric label="Vídeos" value={client.totalJobs} />
                  <Metric label="Completados" value={client.completedJobs} />
                </dl>
              </div>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-4 text-sm font-semibold text-white transition hover:border-[#efd8ad]/30 hover:text-[#efd8ad]"
                href={`/video-editor/clients/${encodeURIComponent(client.id)}`}
              >
                Ver cliente
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyText text="Aún no hay jobs asociados a clientes para ordenar." />
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-white/[0.06] px-3 py-1.5">
      <dt className="inline text-zinc-500">{label}: </dt>
      <dd className="inline font-semibold text-zinc-100">{value}</dd>
    </div>
  );
}
