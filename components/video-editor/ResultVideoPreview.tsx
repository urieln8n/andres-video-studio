export function ResultVideoPreview() {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_34px_120px_-70px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-5">
      <div className="mx-auto aspect-[9/16] w-full max-w-[25rem] overflow-hidden rounded-[8px] border border-white/10 bg-[linear-gradient(180deg,#272321_0%,#111111_42%,#080808_100%)]">
        <div className="flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-medium uppercase text-zinc-200">
              Preview 9:16
            </span>
            <span className="rounded-full border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-3 py-1 text-xs font-medium text-[#efd8ad]">
              subtítulos activos
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <button
              aria-label="Reproducir vista previa"
              className="grid size-24 place-items-center rounded-full border border-white/15 bg-white/[0.12] text-white shadow-[0_26px_80px_-28px_rgba(0,0,0,1)] backdrop-blur-xl"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="ml-1 size-9"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m9 7 8 5-8 5V7Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="mt-10 rounded-[8px] border border-white/10 bg-black/35 px-4 py-3 text-lg font-semibold text-white shadow-[0_20px_60px_-35px_rgba(0,0,0,1)]">
              Cortes limpios. Ritmo listo.
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-sm text-zinc-300">
              <span>00:00</span>
              <span>01:02</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-2 w-[72%] rounded-full bg-[linear-gradient(90deg,#efd8ad,#b8853b)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
