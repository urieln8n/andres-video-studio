const DELIVERABLES = [
  { name: "video-final.mp4", icon: "🎬", highlight: true, desc: "Vídeo procesado con subtítulos y overlay" },
  { name: "instagram-caption.txt", icon: "📸", highlight: false, desc: "Caption + hashtags para Instagram" },
  { name: "tiktok-caption.txt", icon: "🎵", highlight: false, desc: "Texto optimizado para TikTok" },
  { name: "youtube-shorts-description.txt", icon: "▶", highlight: false, desc: "Descripción para YouTube Shorts" },
  { name: "whatsapp-text.txt", icon: "💬", highlight: false, desc: "Mensaje listo para WhatsApp" },
  { name: "story-text.txt", icon: "✦", highlight: false, desc: "Texto para historias de Instagram/TikTok" },
  { name: "hashtags.txt", icon: "#", highlight: false, desc: "Set de hashtags por temática y sector" },
  { name: "publishing-checklist.txt", icon: "✅", highlight: false, desc: "Checklist de publicación por plataforma" },
  { name: "metadata.json", icon: "{}", highlight: false, desc: "Datos del job, cliente y configuración" },
  { name: "barberiaos-instructions.txt", icon: "✂", highlight: false, desc: "Instrucciones para BarberíaOS (si aplica)" },
] as const;

export function DeliverablesSection() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.4) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Entregable
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            No solo un MP4.{" "}
            <span className="text-[#d6b26e]">Un pack completo.</span>
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400 text-lg">
            El cliente recibe todo lo que necesita para publicar en cualquier red social, en cualquier formato.
          </p>
        </div>

        <div className="relative mx-auto max-w-2xl">
          <div className="absolute inset-0 rounded-3xl bg-[#d6b26e]/4 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-[#efd8ad]/18 bg-zinc-900/80 backdrop-blur-sm">
            {/* Title bar */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-black/25 px-6 py-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-sm text-zinc-400">
                📦 delivery-pack-{"jobId"}.zip
              </span>
            </div>

            {/* Files */}
            <div className="divide-y divide-white/[0.05]">
              {DELIVERABLES.map((f) => (
                <div
                  key={f.name}
                  className={`flex items-center gap-4 px-6 py-3 transition-all hover:bg-white/[0.03] ${
                    f.highlight ? "bg-[#d6b26e]/[0.04]" : ""
                  }`}
                >
                  <span className="w-6 flex-shrink-0 text-center text-lg">{f.icon}</span>
                  <span
                    className={`flex-1 font-mono text-sm ${f.highlight ? "font-bold text-[#efd8ad]" : "text-zinc-300"}`}
                  >
                    {f.name}
                  </span>
                  <span className="hidden text-xs text-zinc-600 sm:block">{f.desc}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/8 bg-black/25 px-6 py-4">
              <span className="text-sm text-zinc-500">{DELIVERABLES.length} archivos incluidos</span>
              <span className="rounded-full border border-[#efd8ad]/20 bg-[#d6b26e]/10 px-3 py-1 text-xs text-[#d6b26e]">
                Entrega inmediata
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
