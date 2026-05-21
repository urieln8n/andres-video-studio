import type { ProcessingStatus } from "@/lib/video-editor/mock-data";

export function ProgressStatusCard({ status }: { status: ProcessingStatus }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.07] p-5 shadow-[0_34px_120px_-70px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="rounded-[8px] border border-[#dfc18a]/25 bg-black/20 p-5 sm:min-w-56">
          <p className="text-sm font-medium text-zinc-300">Tiempo restante</p>
          <p className="mt-2 text-7xl font-semibold leading-none text-white sm:text-8xl">
            {status.eta}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-[#d6b26e]">
            Estado actual
          </p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-4xl">
            {status.message}
          </h1>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-zinc-300">Progreso del job</span>
              <span className="font-semibold text-[#efd8ad]">
                {status.progress}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/35">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#8f6736,#efd8ad,#c68a3d)] shadow-[0_0_30px_rgba(214,178,110,0.65)]"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
