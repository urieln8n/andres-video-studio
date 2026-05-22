const BEFORE = [
  "Sin subtítulos",
  "Pausas largas",
  "Sin hook inicial",
  "Sin CTA",
  "Sin caption",
  "Sin estrategia de publicación",
] as const;

const AFTER = [
  "Subtítulos premium quemados",
  "Silencios recortados",
  "Hook en los primeros 3 segundos",
  "CTA con QR de reserva",
  "Caption por plataforma",
  "Pack ZIP listo para publicar",
] as const;

export function BeforeAfterSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            La transformación
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Antes: un vídeo bruto.
            <br />
            <span className="text-[#d6b26e]">Después: un activo comercial.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ANTES */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                <span className="text-red-400 text-lg font-bold">✕</span>
              </div>
              <div>
                <h3 className="font-bold text-red-400 text-lg">ANTES</h3>
                <p className="text-xs text-zinc-500">Vídeo sin editar</p>
              </div>
            </div>

            {/* Mock video frame - plain */}
            <div className="mb-6 overflow-hidden rounded-xl border border-red-500/15 bg-zinc-800/60 aspect-video flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center text-2xl opacity-40">
                ▶
              </div>
              <div className="space-y-1.5 w-2/3">
                <div className="h-1.5 rounded bg-zinc-700 opacity-30" />
                <div className="h-1.5 rounded bg-zinc-700 opacity-20 w-4/5" />
              </div>
              <p className="text-xs text-zinc-600 italic">Sin editar</p>
            </div>

            <ul className="space-y-3">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                    ✕
                  </span>
                  <span className="text-zinc-400 line-through decoration-red-500/40">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* DESPUÉS */}
          <div className="rounded-2xl border border-[#efd8ad]/25 bg-[#d6b26e]/[0.06] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#d6b26e]/20 flex items-center justify-center">
                <span className="text-[#d6b26e] text-lg font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-[#efd8ad] text-lg">DESPUÉS</h3>
                <p className="text-xs text-zinc-500">Pack procesado por Andrés Video Studio</p>
              </div>
            </div>

            {/* Mock video frame - with overlays */}
            <div className="mb-6 overflow-hidden rounded-xl border border-[#efd8ad]/20 bg-zinc-800/60 aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-transparent to-zinc-900/80" />
              <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center text-2xl opacity-40">
                ▶
              </div>
              {/* Hook bar */}
              <div className="absolute top-2 inset-x-2 rounded bg-black/75 px-2.5 py-1.5 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-white">💈 Hook: Reserva en 10 seg</p>
              </div>
              {/* Subtitle */}
              <div className="absolute bottom-8 inset-x-4 rounded bg-black/70 px-2 py-1 text-center">
                <p className="text-[10px] font-semibold text-white">Subtítulo automático</p>
              </div>
              {/* CTA bar */}
              <div className="absolute bottom-2 inset-x-2 rounded bg-[#d6b26e] px-2 py-1 text-center">
                <p className="text-[10px] font-bold text-zinc-900">📅 CTA: Reservar ahora</p>
              </div>
            </div>

            <ul className="space-y-3">
              {AFTER.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#d6b26e]/25 text-[#d6b26e] text-xs font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-zinc-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
