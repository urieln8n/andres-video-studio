import type { ProcessingPhase } from "@/lib/video-editor/mock-data";

export function ProcessingPhaseList({ phases }: { phases: ProcessingPhase[] }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.065] p-5 shadow-[0_28px_100px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-400">
            Pipeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Fases</h2>
        </div>
        <span className="rounded-full border border-[#d6b26e]/20 bg-[#d6b26e]/10 px-3 py-1 text-xs font-medium text-[#efd8ad]">
          Mock
        </span>
      </div>

      <ol className="space-y-3">
        {phases.map((phase) => {
          const current = phase.status === "current";
          const completed = phase.status === "completed";

          return (
            <li
              key={phase.label}
              className={`flex items-center gap-3 rounded-[8px] border px-4 py-3 ${
                current
                  ? "border-[#e6c58b]/35 bg-[#d6b26e]/12 text-white shadow-[0_16px_55px_-34px_rgba(214,178,110,0.95)]"
                  : "border-white/[0.08] bg-black/15 text-zinc-300"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                  completed
                    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                    : current
                      ? "border-[#efd8ad]/35 bg-[#efd8ad]/15 text-[#efd8ad]"
                      : "border-white/10 bg-white/[0.04] text-zinc-500"
                }`}
              >
                {completed ? "✓" : phase.step}
              </span>
              <span className="text-sm font-medium sm:text-base">
                {phase.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
