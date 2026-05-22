import Link from "next/link";

export function DemoFinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(214,178,110,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl space-y-10 text-center">
        <div className="space-y-4">
          <h2 className="text-5xl font-black leading-tight text-white sm:text-6xl">
            Empieza creando
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #efd8ad 0%, #d6b26e 50%, #b8923f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              un vídeo corto
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-xl text-zinc-400">
            Todo el pipeline está listo: FFmpeg, Whisper, subtítulos, CTA y pack ZIP.
            Sin configuración adicional.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/video-editor"
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#d6b26e] px-10 py-5 text-lg font-bold text-zinc-950 shadow-xl shadow-[#d6b26e]/20 transition-all hover:bg-[#efd8ad]"
          >
            Crear vídeo
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/video-editor/barberiaos"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-10 py-5 text-lg text-white backdrop-blur-sm transition-all hover:bg-white/12"
          >
            Modo BarberíaOS
          </Link>
          <Link
            href="/video-editor/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-10 py-5 text-lg text-white backdrop-blur-sm transition-all hover:bg-white/12"
          >
            Dashboard agencia
          </Link>
        </div>

        <p className="text-sm text-zinc-700">
          Herramienta interna · Solo uso local · Sin subscripción
        </p>
      </div>
    </section>
  );
}
