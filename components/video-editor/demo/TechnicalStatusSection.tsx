import Link from "next/link";

const BADGES = [
  { label: "Local app", icon: "💻", color: "zinc" },
  { label: "FFmpeg", icon: "⚡", color: "green" },
  { label: "Whisper / faster-whisper", icon: "🎙", color: "blue" },
  { label: "Next.js 16", icon: "▲", color: "white" },
  { label: "Packs ZIP", icon: "📦", color: "gold" },
  { label: "BarberíaOS ready", icon: "✂", color: "orange" },
  { label: "Agencia mode", icon: "👥", color: "purple" },
] as const;

type BadgeColor = (typeof BADGES)[number]["color"];

const COLOR_CLASSES: Record<BadgeColor, string> = {
  zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
  green: "bg-green-500/10 text-green-400 border-green-500/30",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  white: "bg-white/8 text-white border-white/20",
  gold: "bg-[#d6b26e]/10 text-[#efd8ad] border-[#efd8ad]/25",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

export function TechnicalStatusSection() {
  return (
    <section
      className="px-6 py-24 text-center"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.4) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Tecnología
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Construido sobre tecnología probada
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400">
            Sin dependencias de nube. Sin subscripción. Sin llamadas a APIs externas.
            Todo corre en tu máquina.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {BADGES.map((b) => (
            <div
              key={b.label}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${COLOR_CLASSES[b.color]}`}
            >
              <span>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>

        <Link
          href="/video-editor/system"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 text-sm text-zinc-300 transition-all hover:bg-white/[0.09] hover:text-white"
        >
          Ver estado del sistema →
        </Link>
      </div>
    </section>
  );
}
