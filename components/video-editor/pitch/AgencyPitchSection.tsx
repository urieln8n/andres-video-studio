import Link from "next/link";

const AGENCY_FEATURES = [
  {
    icon: "👥",
    title: "Gestión de clientes",
    desc: "Cada cliente tiene su ficha, sector, logo y booking URL. Asocia vídeos directamente desde el upload.",
  },
  {
    icon: "📚",
    title: "Biblioteca de jobs",
    desc: "Todos los trabajos organizados. Filtra por estado, cliente, fecha o tipo de contenido.",
  },
  {
    icon: "📊",
    title: "Dashboard de agencia",
    desc: "Métricas de producción semanal, tiempo ahorrado, packs generados y top clientes.",
  },
  {
    icon: "📦",
    title: "Packs ZIP por cliente",
    desc: "Cada entrega en su propio ZIP. Vídeo + textos + hashtags + metadata del proyecto.",
  },
  {
    icon: "⏱",
    title: "Ahorro de tiempo medido",
    desc: "El dashboard calcula los minutos ahorrados en edición. Datos reales de producción.",
  },
  {
    icon: "🔄",
    title: "Flujo repetible",
    desc: "Mismo flujo para todos los clientes. Sin configuración manual. Sin pasos manuales repetitivos.",
  },
] as const;

export function AgencyPitchSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Para agencias
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            También funciona como sistema interno{" "}
            <span className="text-[#d6b26e]">de producción</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Gestiona múltiples clientes, entrega packs profesionales y mide tu producción desde un solo dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENCY_FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:border-[#efd8ad]/20 hover:bg-[#d6b26e]/[0.03]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#d6b26e]/12 text-2xl">
                {f.icon}
              </div>
              <h3 className="mb-2 font-semibold text-white transition group-hover:text-[#efd8ad]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/video-editor/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#d6b26e] px-8 py-4 font-bold text-zinc-950 shadow-lg shadow-[#d6b26e]/15 transition-all hover:bg-[#efd8ad]"
          >
            Ver dashboard de agencia →
          </Link>
          <Link
            href="/video-editor/clients"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-8 py-4 font-semibold text-[#efd8ad] transition-all hover:bg-[#d6b26e]/18"
          >
            Ver clientes →
          </Link>
        </div>
      </div>
    </section>
  );
}
