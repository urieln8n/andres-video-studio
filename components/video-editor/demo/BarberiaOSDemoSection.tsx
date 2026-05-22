import Link from "next/link";

const USE_CASES = [
  {
    icon: "⏰",
    title: "Huecos libres",
    desc: "Crea un reel con los huecos disponibles del día. Publica y el QR lleva a reservar.",
  },
  {
    icon: "📅",
    title: "Reserva por QR",
    desc: "El cliente escanea desde Instagram o TikTok y reserva en 10 segundos.",
  },
  {
    icon: "✂",
    title: "Antes/después",
    desc: "Vídeo del proceso con subtítulos del estilo y CTA al final del reel.",
  },
  {
    icon: "🎯",
    title: "Promoción corte + barba",
    desc: "Oferta especial con hook directo y QR de reserva integrado.",
  },
  {
    icon: "🔄",
    title: "Reactivar clientes",
    desc: "Vídeo personalizado para clientes que no han vuelto en 30 días.",
  },
  {
    icon: "⭐",
    title: "Pedir reseñas",
    desc: "Vídeo de agradecimiento con CTA para dejar reseña en Google.",
  },
] as const;

// Fixed 7×7 finder-pattern QR mock (purely decorative, deterministic)
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
        style={{ gridTemplateColumns: "repeat(7, 1fr)", width: 56, height: 56 }}
      >
        {QR_CELLS.map((cell, i) => (
          <div
            key={i}
            className={cell ? "rounded-[1px] bg-zinc-900" : "bg-white"}
          />
        ))}
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative flex justify-center">
      {/* Glow */}
      <div className="absolute inset-0 scale-110 rounded-[3rem] bg-[#d6b26e]/10 blur-2xl" />

      {/* Phone shell */}
      <div className="relative w-60 overflow-hidden rounded-[2.5rem] border-4 border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-3 text-xs text-zinc-500">
          <span>9:41</span>
          <div className="h-3 w-14 rounded-full bg-zinc-800" />
          <span>●●●</span>
        </div>

        {/* Video area */}
        <div className="relative overflow-hidden bg-zinc-800" style={{ aspectRatio: "9/16", maxHeight: 400 }}>
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900" />

          {/* Content silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-zinc-600 bg-zinc-600/30 text-4xl opacity-30">
              ✂
            </div>
          </div>

          {/* Hook bar — top */}
          <div className="absolute inset-x-0 top-0 px-3 pt-3">
            <div className="rounded-lg bg-black/65 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs font-bold leading-snug text-white">
                💈 ¿Tienes 45 min libres hoy?
              </p>
            </div>
          </div>

          {/* Subtitle bar */}
          <div className="absolute inset-x-0 bottom-24 px-3">
            <div className="rounded bg-black/70 px-2 py-1 text-center">
              <p className="text-xs font-semibold text-white">
                Corte premium desde 15€
              </p>
            </div>
          </div>

          {/* CTA button */}
          <div className="absolute inset-x-4 bottom-12">
            <div className="rounded-lg bg-[#d6b26e] px-3 py-2 text-center">
              <p className="text-xs font-bold text-zinc-900">📅 Reservar ahora</p>
            </div>
          </div>

          {/* QR overlay */}
          <div className="absolute bottom-2 right-2 flex flex-col items-center gap-1">
            <QRMock />
            <p className="rounded bg-black/60 px-1.5 text-[9px] font-medium text-white">
              Escanea y reserva
            </p>
          </div>
        </div>

        {/* Home bar */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-20 rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}

export function BarberiaOSDemoSection() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.5) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-800 px-4 py-1.5 text-sm text-zinc-300">
            <span>✂</span> BarberíaOS Content Studio
          </div>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Especial para barberías:{" "}
            <span className="text-[#d6b26e]">crea reels que llevan</span>
            <br className="hidden sm:block" /> clientes a reservar
          </h2>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Use cases */}
          <div className="grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="rounded-xl border border-white/8 bg-white/[0.04] p-5 transition-all hover:border-[#efd8ad]/20"
              >
                <div className="mb-3 text-2xl">{uc.icon}</div>
                <h3 className="mb-1 font-semibold text-white">{uc.title}</h3>
                <p className="text-sm text-zinc-500">{uc.desc}</p>
              </div>
            ))}
          </div>

          {/* Phone mockup */}
          <PhoneMockup />
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/video-editor/barberiaos"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#efd8ad]/25 bg-[#d6b26e]/10 px-8 py-4 font-semibold text-[#efd8ad] transition-all hover:bg-[#d6b26e]/18"
          >
            Probar modo BarberíaOS →
          </Link>
        </div>
      </div>
    </section>
  );
}
