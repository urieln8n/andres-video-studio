import { videoEditorPipelineSteps } from "@/lib/video-editor/pipeline-steps";
import type { VideoEditorJob } from "@/lib/video-editor/types";

export function ProcessingTimeline({ job }: { job: VideoEditorJob | null }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.065] p-5 shadow-[0_28px_100px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-400">
            Pipeline
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Fases reales
          </h2>
        </div>
        <span className="rounded-[8px] border border-[#d6b26e]/20 bg-[#d6b26e]/10 px-3 py-1 text-xs font-medium text-[#efd8ad]">
          JSON local
        </span>
      </div>

      <ol className="space-y-3">
        {videoEditorPipelineSteps
          .filter((step) => step.id !== "failed" || job?.status === "failed")
          .map((step, index) => {
            const current = job?.currentStep === step.id;
            const failed = step.id === "failed" && job?.status === "failed";
            const completed =
              !failed &&
              (job?.status === "completed" ||
                (job?.progress ?? 0) > step.progress);

            return (
              <li
                key={step.id}
                className={`rounded-[8px] border px-4 py-3 ${
                  current || failed
                    ? failed
                      ? "border-rose-200/25 bg-rose-200/10 text-white"
                      : "border-[#e6c58b]/35 bg-[#d6b26e]/12 text-white"
                    : "border-white/[0.08] bg-black/15 text-zinc-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                      completed
                        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                        : failed
                          ? "border-rose-200/25 bg-rose-200/10 text-rose-100"
                          : current
                            ? "border-[#efd8ad]/35 bg-[#efd8ad]/15 text-[#efd8ad]"
                            : "border-white/10 bg-white/[0.04] text-zinc-500"
                    }`}
                  >
                    {completed ? "OK" : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold sm:text-base">
                      {step.label}
                    </span>
                    <span className="mt-1 block text-sm text-zinc-400">
                      {step.description}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
      </ol>
    </section>
  );
}
