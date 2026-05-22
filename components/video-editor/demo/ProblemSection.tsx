const PROBLEMS = [
  {
    icon: "⏯",
    title: "Vídeos sin subtítulos",
    desc: "El 85% del vídeo se consume en silencio. Sin subtítulos, pierdes a la mayoría de tu audiencia antes de los 3 segundos.",
  },
  {
    icon: "⏱",
    title: "Edición lenta y repetitiva",
    desc: "Cortar silencios y muletillas a mano consume horas que no tienes. El resultado final tarda días.",
  },
  {
    icon: "📢",
    title: "Falta de hook y CTA",
    desc: "Sin gancho en los primeros 3 segundos y sin llamada a la acción clara, el vídeo no convierte.",
  },
  {
    icon: "📋",
    title: "No saber qué publicar",
    desc: "Grabar es solo el 10% del trabajo. El caption, los hashtags y la estrategia por plataforma son el resto.",
  },
  {
    icon: "🔗",
    title: "Sin captions ni hashtags",
    desc: "Cada plataforma necesita un texto diferente. Escribirlos todos toma tiempo que le quitas a tu negocio.",
  },
  {
    icon: "📅",
    title: "Vídeo desconectado de ventas",
    desc: "El vídeo no lleva al cliente a reservar, comprar ni actuar. Solo acumula reproducciones sin conversión.",
  },
] as const;

export function ProblemSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            El problema real
          </p>
          <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            El problema no es grabar vídeos. El problema es convertirlos en{" "}
            <span className="text-[#d6b26e]">contenido que venda.</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="relative rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm transition-all hover:border-red-500/20 hover:bg-white/[0.06]"
            >
              <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-red-500/40" />
              <div className="mb-4 text-3xl">{p.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{p.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
