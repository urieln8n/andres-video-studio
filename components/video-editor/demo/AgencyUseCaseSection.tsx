import Link from "next/link";

const WORKFLOW = [
  {
    step: "1",
    title: "Crear cliente",
    desc: "Registra datos del cliente, sector, logo y booking URL.",
  },
  {
    step: "2",
    title: "Subir vídeo",
    desc: "Asocia el vídeo al cliente desde el formulario de upload.",
  },
  {
    step: "3",
    title: "Procesar",
    desc: "El pipeline automático prepara el vídeo completo con subtítulos, cortes y copy.",
  },
  {
    step: "4",
    title: "Exportar pack",
    desc: "ZIP con vídeo procesado + captions + hashtags + metadata.",
  },
  {
    step: "5",
    title: "Ver métricas",
    desc: "Dashboard con producción semanal, actividad reciente y top clientes.",
  },
  {
    step: "6",
    title: "Entregar",
    desc: "El cliente recibe un pack profesional listo para publicar en cualquier plataforma.",
  },
] as const;

export function AgencyUseCaseSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
                Modo agencia
              </p>
              <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                Pensado para producir contenido{" "}
                <span className="text-[#d6b26e]">para clientes</span>
              </h2>
              <p className="text-lg leading-relaxed text-zinc-400">
                Gestiona múltiples clientes, asocia vídeos, genera packs profesionales y
                entrega todo organizado desde un solo sitio. Sin hojas de cálculo ni
                carpetas desordenadas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/video-editor/clients"
                className="inline-flex items-center gap-2 rounded-xl border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-6 py-3 font-medium text-[#efd8ad] transition-all hover:bg-[#d6b26e]/18"
              >
                Ver clientes →
              </Link>
              <Link
                href="/video-editor/library"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 font-medium text-white transition-all hover:bg-white/[0.09]"
              >
                Ver biblioteca →
              </Link>
            </div>
          </div>

          {/* Workflow steps */}
          <div className="space-y-3">
            {WORKFLOW.map((w) => (
              <div
                key={w.step}
                className="group flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.04] p-4 transition-all hover:border-[#efd8ad]/20"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#d6b26e]/15 text-sm font-bold text-[#d6b26e]">
                  {w.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white transition group-hover:text-[#efd8ad]">
                    {w.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-zinc-500">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
