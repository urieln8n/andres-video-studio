const FILES = [
  { name: "video-final.mp4", icon: "🎬", desc: "Vídeo procesado con subtítulos y overlay" },
  { name: "instagram-caption.txt", icon: "📸", desc: "Caption + hashtags para Instagram" },
  { name: "tiktok-caption.txt", icon: "🎵", desc: "Texto optimizado para TikTok" },
  { name: "youtube-shorts-description.txt", icon: "▶", desc: "Descripción para YouTube Shorts" },
  { name: "whatsapp-text.txt", icon: "💬", desc: "Mensaje para compartir por WhatsApp" },
  { name: "story-text.txt", icon: "✦", desc: "Texto para historias de Instagram/TikTok" },
  { name: "hashtags.txt", icon: "#", desc: "Set de hashtags por temática y sector" },
  { name: "publishing-checklist.txt", icon: "✅", desc: "Checklist de publicación por plataforma" },
  { name: "metadata.json", icon: "{}", desc: "Datos del job, cliente y configuración" },
  { name: "barberiaos-instructions.txt", icon: "✂", desc: "Instrucciones de publicación para BarberíaOS" },
] as const;

export function DeliverablePackSection() {
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
            Cada vídeo puede salir con un{" "}
            <span className="text-[#d6b26e]">pack completo</span>
          </h2>
          <p className="mx-auto max-w-xl text-zinc-400">
            Un solo ZIP con todo lo que necesita el cliente para publicar en cualquier plataforma.
          </p>
        </div>

        {/* ZIP frame */}
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute inset-0 rounded-3xl bg-[#d6b26e]/5 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-[#efd8ad]/20 bg-zinc-900/80 backdrop-blur-sm">
            {/* Title bar */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-black/20 px-6 py-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-sm text-zinc-400">
                📦 delivery-pack-{"{jobId}"}.zip
              </span>
            </div>

            {/* File list */}
            <div className="divide-y divide-white/[0.05]">
              {FILES.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-4 px-6 py-3 transition-all hover:bg-white/[0.03]"
                >
                  <span className="w-6 flex-shrink-0 text-center text-lg">{file.icon}</span>
                  <span className="flex-1 font-mono text-sm text-zinc-300">{file.name}</span>
                  <span className="hidden text-xs text-zinc-600 sm:block">{file.desc}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/8 bg-black/20 px-6 py-4">
              <span className="text-sm text-zinc-500">{FILES.length} archivos incluidos</span>
              <span className="rounded-full border border-[#efd8ad]/20 bg-[#d6b26e]/10 px-3 py-1 text-xs text-[#d6b26e]">
                Export ZIP listo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
