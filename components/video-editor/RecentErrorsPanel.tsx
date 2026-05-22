import Link from "next/link";

import {
  EmptyText,
  formatDateTime,
  PanelHeader,
} from "@/components/video-editor/RecentActivityList";
import type { DashboardRecentError } from "@/lib/video-editor/dashboard-analytics";

export function RecentErrorsPanel({
  errors,
}: {
  errors: DashboardRecentError[];
}) {
  return (
    <section className="rounded-[8px] border border-rose-100/15 bg-rose-100/[0.055] p-5 shadow-[0_32px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <PanelHeader
        description="Jobs fallidos listos para revisar o volver a procesar."
        title="Errores recientes"
      />
      {errors.length ? (
        <div className="mt-5 grid gap-3">
          {errors.map((error) => (
            <article
              className="rounded-[8px] border border-rose-100/15 bg-black/20 p-4"
              key={error.jobId}
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="min-w-0">
                  <h3 className="break-words text-base font-semibold text-white">
                    {error.originalFileName}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {error.clientName || "Sin cliente"} · {formatDateTime(error.failedAt)}
                  </p>
                  <p className="mt-3 break-words rounded-[8px] border border-rose-100/10 bg-rose-950/20 px-3 py-2 text-sm leading-6 text-rose-100">
                    {error.errorMessage}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-40 lg:grid-cols-1">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#efd8ad]/25 bg-[#d6b26e]/12 px-3 text-sm font-semibold text-[#efd8ad] transition hover:bg-[#d6b26e]/22"
                    href={`/video-editor/processing?jobId=${encodeURIComponent(error.jobId)}`}
                  >
                    Reintentar
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-3 text-sm font-semibold text-white transition hover:bg-white/[0.13]"
                    href={`/video-editor/processing?jobId=${encodeURIComponent(error.jobId)}`}
                  >
                    Ver progreso
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyText text="No hay jobs fallidos para este filtro." />
      )}
    </section>
  );
}
