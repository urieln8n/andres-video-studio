import Link from "next/link";

const FEATURES = [
  { icon: "🎬", label: "Vídeo del corte editado" },
  { icon: "💡", label: "Hook visual en 3 segundos" },
  { icon: "📝", label: "Subtítulos quemados" },
  { icon: "📅", label: "CTA de reserva" },
  { icon: "📲", label: "QR con link de citas" },
  { icon: "📸", label: "Texto para Instagram" },
  { icon: "💬", label: "Mensaje listo para WhatsApp" },
] as const;

// Fixed 7×7 QR finder-pattern (decorative, deterministic)
const QR_CELLS: (0 | 1)[] = [
  1,1,1,1,1,1,1,
  1,0,0,0,0,0,1,
  1,0,1,1,1,0,1,
  1,0,1,0,1,0,1,
  1,0,1,1,1,0,1,
  1,0,0,0,0,0,1,
  1,1,1,1,1,1,1,
];

function QRMock() {
  return (
    <div className="rounded-md bg-white p-1.5">
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: "repeat(7, 1fr)", width: 52, height: 52 }}
      >
        {QR_CELLS.map((cell, i) => (
          <div key={i} className={cell ? "rounded-[1px] bg-zinc-900" : "bg-white"} />
        ))}
      </div>
    </div>
  );
}

function BarberiaPhoneMock() {
  return (
    <div className="relative mx-auto w-56">
      {/* Glow */}
      <div className="absolute inset-0 scale-110 rounded-[3rem] bg-[#d6b26e]/12 blur-2xl" />

      {/* Phone */}
      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-3 text-xs text-zinc-500">
          <span>9:41</span>
          <div className="h-3 w-12 rounded-full bg-zinc-800" />
          <span>●●●</span>
        </div>

        {/* Video */}
        <div
          className="relative overflow-hidden bg-zinc-800"
          style={{ aspectRatio: "9/16", maxHeight: 380 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900" />

          {/* Badge BarberíaOS */}
          <div className="absolute left-2 top-2 rounded-full bg-[#d6b26e]/90 px-2 py-0.5">
            <span className="text-[9px] font-bold text-zinc-900">✂ BarberíaOS</span>
          </div>

          {/* Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full border-2 border-zinc-600 bg-zinc-600/25 flex items-center justify-center text-3xl opacity-30">
              ✂
            </div>
          </div>

          {/* Hook */}
          <div className="absolute inset-x-2 top-10 rounded-lg bg-black/65 px-2.5 py-2 backdrop-blur-sm">
            <p className="text-[10px] font-bold leading-snug text-white">
              Tus clientes pueden reservar en segundos
            </p>
          </div>

          {/* Subtitle */}
          <div className="absolute inset-x-3 bottom-20 rounded bg-black/70 px-1.5 py-1 text-center">
            <p className="text-[9px] font-semibold text-white">Corte premium · 45 min</p>
          </div>

          {/* CTA */}
          <div className="absolute inset-x-3 bottom-12">
            <div className="rounded-lg bg-[#d6b26e] py-1.5 text-center">
              <p className="text-[9px] font-bold text-zinc-900">📅 Escanea y reserva tu cita</p>
            </div>
          </div>

          {/* QR */}
          <div className="absolute bottom-2 right-2 flex flex-col items-center gap-0.5">
            <QRMock />
            <p className="rounded bg-black/60 px-1 text-[8px] font-medium text-white">
              Reservar
            </p>
          </div>
        </div>

        <div className="flex justify-center py-3">
          <div className="h-1 w-16 rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}

export function BarberiaOSPitchSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800/80 px-4 py-1.5 text-sm text-zinc-300">
            <span>✂</span> BarberíaOS Content Studio
          </div>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Para barberías:{" "}
            <span className="text-[#d6b26e]">reels que llevan al cliente a reservar</span>
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400">
            Cada pieza de contenido tiene un único objetivo: convertir visualizaciones en citas.
          </p>
        </div>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Features list */}
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.04] px-5 py-4 transition-all hover:border-[#efd8ad]/20"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#d6b26e]/12 text-xl">
                  {f.icon}
                </span>
                <span className="font-medium text-zinc-200">{f.label}</span>
                <span className="ml-auto text-[#d6b26e] text-sm">✓</span>
              </div>
            ))}

            <div className="pt-4">
              <Link
                href="/video-editor/barberiaos"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-8 py-4 font-semibold text-[#efd8ad] transition-all hover:bg-[#d6b26e]/18"
              >
                Probar flujo BarberíaOS →
              </Link>
            </div>
          </div>

          {/* Phone */}
          <BarberiaPhoneMock />
        </div>
      </div>
    </section>
  );
}
