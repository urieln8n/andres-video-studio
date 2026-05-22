import { EmptyText, PanelHeader } from "@/components/video-editor/RecentActivityList";
import type { DashboardProductionDay } from "@/lib/video-editor/dashboard-analytics";

export function WeeklyProductionChart({
  production,
}: {
  production: DashboardProductionDay[];
}) {
  const maxValue = Math.max(
    1,
    ...production.map((day) => Math.max(day.createdJobs, day.completedJobs)),
  );
  const hasProduction = production.some(
    (day) => day.createdJobs > 0 || day.completedJobs > 0,
  );

  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <PanelHeader
        description="Vídeos creados y completados durante los últimos 7 días UTC."
        title="Producción semanal"
      />
      <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-zinc-300">
        <Legend color="bg-[#efd8ad]" label="Creados" />
        <Legend color="bg-emerald-200" label="Completados" />
      </div>
      {hasProduction ? (
        <div className="mt-5 grid min-h-64 grid-cols-7 gap-2 rounded-[8px] border border-white/[0.08] bg-black/20 p-3 sm:gap-3 sm:p-4">
          {production.map((day) => (
            <div className="grid min-w-0 grid-rows-[1fr_auto] gap-3" key={day.key}>
              <div className="flex items-end justify-center gap-1.5">
                <Bar
                  label={`${day.createdJobs} creados`}
                  maxValue={maxValue}
                  tone="gold"
                  value={day.createdJobs}
                />
                <Bar
                  label={`${day.completedJobs} completados`}
                  maxValue={maxValue}
                  tone="success"
                  value={day.completedJobs}
                />
              </div>
              <div className="text-center">
                <p className="truncate text-xs font-semibold capitalize text-white">
                  {day.label}
                </p>
                <p className="truncate text-[11px] text-zinc-500">{day.dateLabel}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyText text="No hay vídeos creados o completados en los últimos 7 días." />
      )}
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Bar({
  label,
  maxValue,
  tone,
  value,
}: {
  label: string;
  maxValue: number;
  tone: "gold" | "success";
  value: number;
}) {
  const height = value ? Math.max(10, Math.round((value / maxValue) * 100)) : 4;

  return (
    <div
      aria-label={label}
      className={`w-full max-w-7 rounded-t-[6px] border border-white/10 ${barStyles[tone]}`}
      style={{ height: `${height}%` }}
      title={label}
    />
  );
}

const barStyles = {
  gold: "bg-[linear-gradient(180deg,#efd8ad,#a97837)]",
  success: "bg-[linear-gradient(180deg,#c8f4da,#3e8b69)]",
};
