const FEATURES = [
  {
    icon: "📝",
    title: "Subtítulos automáticos",
    desc: "ASS premium con Whisper. Se queman directamente en el vídeo con estilos configurables.",
    gold: true,
  },
  {
    icon: "✂",
    title: "Recorte de silencios",
    desc: "FFmpeg detecta y elimina pausas automáticamente. El vídeo queda limpio y dinámico.",
    gold: false,
  },
  {
    icon: "🧹",
    title: "Limpieza de fillers",
    desc: "Detecta y corta muletillas: 'eh', 'um', 'bueno', 'o sea', 'digamos'.",
    gold: false,
  },
  {
    icon: "💡",
    title: "Hook + CTA automático",
    desc: "Copy generado para el inicio y el cierre. Con revisión manual antes del render final.",
    gold: false,
  },
  {
    icon: "📋",
    title: "Copy generado",
    desc: "Texto optimizado para cada red social. Listo para publicar sin retoques.",
    gold: false,
  },
  {
    icon: "📲",
    title: "QR de reservas",
    desc: "Overlay con código QR enlazado al sistema de citas. Especial para BarberíaOS.",
    gold: false,
  },
  {
    icon: "📱",
    title: "Publishing pack",
    desc: "Captions para Instagram, TikTok, YouTube Shorts y WhatsApp en un solo pack.",
    gold: false,
  },
  {
    icon: "📦",
    title: "Export ZIP",
    desc: "Pack completo: vídeo + captions + hashtags + metadata en un archivo listo para entregar.",
    gold: false,
  },
  {
    icon: "👥",
    title: "Gestión de clientes",
    desc: "Asocia cada vídeo a un cliente. Sector, logo, booking URL y snapshots de proyecto.",
    gold: false,
  },
  {
    icon: "📊",
    title: "Dashboard de agencia",
    desc: "Métricas semanales, chart de producción, actividad reciente y top clientes.",
    gold: false,
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Funcionalidades
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Todo lo que necesitas, ya incluido
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400">
            Cada feature está diseñada para reducir fricción y entregar más valor a tus clientes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border p-6 transition-all ${
                f.gold
                  ? "border-[#efd8ad]/30 bg-[#d6b26e]/8 hover:bg-[#d6b26e]/12"
                  : "border-white/8 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.06]"
              }`}
            >
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3
                className={`mb-2 font-semibold ${f.gold ? "text-[#efd8ad]" : "text-white"}`}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}

          {/* Coming soon placeholder */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center">
            <div className="mb-2 text-2xl text-zinc-700">+</div>
            <p className="text-sm text-zinc-700">Más en Fase 3E</p>
          </div>
        </div>
      </div>
    </section>
  );
}
