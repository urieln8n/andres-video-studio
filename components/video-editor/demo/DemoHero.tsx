import Link from "next/link";

export function DemoHero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-28 text-center">
      {/* Background layers */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#d6b26e]/8 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b26e]/6 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-5 py-2 text-sm font-medium text-[#efd8ad]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d6b26e]" />
          Editor automático para agencias, negocios locales y BarberíaOS
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-6xl font-black leading-none tracking-tight text-white sm:text-7xl md:text-8xl">
            Andrés Video
          </h1>
          <h1
            className="text-6xl font-black leading-none tracking-tight sm:text-7xl md:text-8xl"
            style={{
              background: "linear-gradient(135deg, #efd8ad 0%, #d6b26e 50%, #b8923f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Studio
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-zinc-400 sm:text-2xl">
          Convierte vídeos en contenido listo para publicar:{" "}
          <span className="text-zinc-200">
            subtítulos, cortes, hooks, CTA, QR,
          </span>{" "}
          captions, hashtags y pack completo en ZIP.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
          <Link
            href="/video-editor"
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#d6b26e] px-9 py-4 text-lg font-bold text-zinc-950 shadow-lg shadow-[#d6b26e]/20 transition-all hover:bg-[#efd8ad]"
          >
            Crear mi primer vídeo
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/video-editor/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-9 py-4 text-lg text-white backdrop-blur-sm transition-all hover:bg-white/12"
          >
            Ver dashboard
          </Link>
        </div>

        {/* Proof chips */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 text-sm text-zinc-600">
          {[
            "FFmpeg real",
            "Whisper/faster-whisper",
            "Subtítulos ASS quemados",
            "Export ZIP completo",
            "BarberíaOS ready",
          ].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="text-[#d6b26e] text-xs">✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
