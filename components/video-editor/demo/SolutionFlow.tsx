const STEPS = [
  {
    num: "01",
    icon: "⬆",
    title: "Sube tu vídeo",
    desc: "MP4, MOV, M4V o WEBM. Hasta 250 MB. Sin comprimir ni preprocesar.",
  },
  {
    num: "02",
    icon: "✂",
    title: "Limpia silencios y muletillas",
    desc: "FFmpeg detecta y corta silencios automáticamente. Whisper identifica fillers como 'eh', 'um' o 'bueno'.",
  },
  {
    num: "03",
    icon: "📝",
    title: "Transcribe y subtitula",
    desc: "faster-whisper genera la transcripción y los subtítulos ASS se queman directamente en el vídeo.",
  },
  {
    num: "04",
    icon: "💡",
    title: "Genera hook y CTA",
    desc: "Copy automático para el gancho inicial y la llamada a la acción final. Con revisión manual antes del render.",
  },
  {
    num: "05",
    icon: "📲",
    title: "Añade QR o branding",
    desc: "Overlay de código QR enlazado a tu sistema de citas. Perfecto para BarberíaOS u otros negocios locales.",
  },
  {
    num: "06",
    icon: "🏷",
    title: "Crea captions y hashtags",
    desc: "Textos adaptados para Instagram, TikTok, YouTube Shorts y WhatsApp. Listos para copiar y pegar.",
  },
  {
    num: "07",
    icon: "📦",
    title: "Exporta vídeo + pack ZIP",
    desc: "Todo empaquetado en un solo archivo: vídeo procesado + captions + hashtags + metadata. Listo para entregar.",
  },
] as const;

export function SolutionFlow() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.6) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            La solución
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Un flujo completo de{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #efd8ad 0%, #d6b26e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              vídeo a publicación
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="group flex items-start gap-5 rounded-2xl border border-white/8 bg-white/[0.04] p-5 transition-all hover:border-[#efd8ad]/20 hover:bg-[#d6b26e]/[0.04]"
            >
              {/* Step number */}
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#efd8ad]/20 bg-[#d6b26e]/10">
                <span className="font-mono text-xs font-bold text-[#d6b26e]">{step.num}</span>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 pt-0.5 text-2xl">{step.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-white transition group-hover:text-[#efd8ad]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{step.desc}</p>
              </div>

              {/* Arrow indicator */}
              {i < STEPS.length - 1 && (
                <div className="flex-shrink-0 pt-2 text-zinc-700">↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
