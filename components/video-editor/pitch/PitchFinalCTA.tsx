import Link from "next/link";

export function PitchFinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="absolute inset-0 bg-zinc-950" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(214,178,110,0.10) 0%, transparent 65%)",
        }}
      />
      {/* Decorative lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 h-px w-[600px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d6b26e]/30 to-transparent" />
        <div className="absolute bottom-4 left-1/2 h-px w-[400px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d6b26e]/15 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl space-y-10 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Empieza hoy
          </p>
          <h2 className="text-5xl font-black leading-tight text-white sm:text-6xl">
            Empieza con un vídeo corto
            <br />y conviértelo en una pieza{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #efd8ad 0%, #d6b26e 60%, #b8923f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              lista para publicar
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-xl text-zinc-400">
            Sin saber editar. Sin herramientas complicadas. Sin esperar días.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/video-editor"
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#d6b26e] px-10 py-5 text-lg font-bold text-zinc-950 shadow-2xl shadow-[#d6b26e]/25 transition-all hover:bg-[#efd8ad]"
          >
            Crear demo ahora
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/video-editor/barberiaos"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-10 py-5 text-lg font-semibold text-[#efd8ad] transition-all hover:bg-[#d6b26e]/18"
          >
            Modo BarberíaOS
          </Link>
          <Link
            href="/video-editor/demo"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-10 py-5 text-lg text-white transition-all hover:bg-white/12"
          >
            Ver demo interna
          </Link>
        </div>

        <p className="text-sm text-zinc-700">
          Herramienta interna · Solo uso local · Sin subscripción
        </p>
      </div>
    </section>
  );
}
