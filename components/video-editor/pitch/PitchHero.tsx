import Link from "next/link";

const STATS = [
  { value: "7", label: "tipos de contenido por vídeo" },
  { value: "10", label: "archivos en el pack de entrega" },
  { value: "5", label: "pasos de principio a ZIP" },
  { value: "0", label: "conocimientos técnicos necesarios" },
] as const;

export function PitchHero() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 py-20 text-center">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(214,178,110,0.12) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-5 py-2 text-sm font-medium text-[#efd8ad]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d6b26e]" />
          Para barberías, negocios locales, agencias y creadores
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          Convierte vídeos simples en{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #efd8ad 0%, #d6b26e 60%, #b8923f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            contenido que trae clientes
          </span>
        </h1>

        {/* Sub */}
        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
          Andrés Video Studio edita, subtitula, limpia, genera hooks, CTA, captions, hashtags
          y entrega un{" "}
          <span className="text-zinc-200 font-medium">pack listo para publicar.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
          <Link
            href="/video-editor"
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#d6b26e] px-10 py-4 text-lg font-bold text-zinc-950 shadow-xl shadow-[#d6b26e]/25 transition-all hover:bg-[#efd8ad]"
          >
            Crear demo ahora
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/video-editor/barberiaos"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-10 py-4 text-lg font-semibold text-[#efd8ad] transition-all hover:bg-[#d6b26e]/18"
          >
            Ver modo BarberíaOS
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/8 bg-white/[0.04] px-4 py-4"
            >
              <div
                className="text-4xl font-black"
                style={{
                  background: "linear-gradient(135deg, #efd8ad 0%, #d6b26e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <div className="mt-1 text-xs leading-snug text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
