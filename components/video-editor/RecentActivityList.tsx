import Link from "next/link";

import type { DashboardActivityEvent } from "@/lib/video-editor/dashboard-analytics";

export function RecentActivityList({
  activity,
}: {
  activity: DashboardActivityEvent[];
}) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <PanelHeader
        description="Últimos movimientos derivados de jobs y clientes locales."
        title="Actividad reciente"
      />
      {activity.length ? (
        <ol className="mt-5 grid gap-2">
          {activity.map((event) => (
            <li
              className="grid gap-3 rounded-[8px] border border-white/[0.08] bg-black/20 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              key={event.id}
            >
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full ${eventDotStyles[event.tone]}`}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{event.label}</p>
                <p className="break-words text-sm text-zinc-400">{event.detail}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <time className="text-xs text-zinc-500">
                  {formatDateTime(event.timestamp)}
                </time>
                {event.href ? (
                  <Link
                    className="text-xs font-semibold text-[#efd8ad] transition hover:text-white"
                    href={event.href}
                  >
                    Abrir
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyText text="Todavía no hay actividad para este filtro." />
      )}
    </section>
  );
}

export function PanelHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <header>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </header>
  );
}

export function EmptyText({ text }: { text: string }) {
  return (
    <p className="mt-5 rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-5 text-sm text-zinc-300">
      {text}
    </p>
  );
}

export function formatDateTime(value: string | null) {
  const time = value ? Date.parse(value) : Number.NaN;

  return Number.isFinite(time)
    ? new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(time)
    : "Pendiente";
}

const eventDotStyles = {
  neutral: "bg-sky-200 shadow-[0_0_20px_rgba(186,230,253,0.8)]",
  success: "bg-emerald-200 shadow-[0_0_20px_rgba(167,243,208,0.8)]",
  danger: "bg-rose-200 shadow-[0_0_20px_rgba(254,205,211,0.8)]",
  gold: "bg-[#efd8ad] shadow-[0_0_20px_rgba(239,216,173,0.8)]",
};
