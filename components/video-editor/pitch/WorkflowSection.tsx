const STEPS = [
  {
    num: "01",
    icon: "📤",
    title: "El cliente envía o sube el vídeo",
    desc: "MP4, MOV, WEBM o M4V. Hasta 250 MB. Sin preparación ni edición previa.",
    time: "~2 min",
  },
  {
    num: "02",
    icon: "⚙",
    title: "El sistema limpia y subtitula",
    desc: "FFmpeg corta silencios y muletillas. Whisper transcribe y genera los subtítulos.",
    time: "~5 min",
  },
  {
    num: "03",
    icon: "✍",
    title: "Se genera hook, CTA y copy",
    desc: "Copy automático para el gancho inicial, la llamada a la acción y todos los textos para redes.",
    time: "~2 min",
  },
  {
    num: "04",
    icon: "👁",
    title: "Se revisa el resultado",
    desc: "Revisión rápida del copy antes del render final. Se pueden editar los textos en el momento.",
    time: "~3 min",
  },
  {
    num: "05",
    icon: "📦",
    title: "Se entrega vídeo + pack para publicar",
    desc: "ZIP con el vídeo procesado, captions, hashtags, WhatsApp text y checklist de publicación.",
    time: "Inmediato",
  },
] as const;

export function WorkflowSection() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.4) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Flujo de trabajo
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Así funciona en <span className="text-[#d6b26e]">5 pasos</span>
          </h2>
          <p className="text-zinc-400">
            De vídeo bruto a pack listo para publicar en menos de 15 minutos.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-[#d6b26e]/40 via-[#d6b26e]/20 to-transparent sm:left-[3.25rem]" />

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex items-start gap-5 pl-16 sm:pl-24">
                {/* Step dot on the line */}
                <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-xl border border-[#efd8ad]/25 bg-[#d6b26e]/12 sm:left-4">
                  <span className="font-mono text-xs font-bold text-[#d6b26e]">{step.num}</span>
                </div>

                <div className="flex-1 rounded-2xl border border-white/8 bg-white/[0.04] p-5 transition-all hover:border-[#efd8ad]/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 text-xl">{step.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{step.desc}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 rounded-full border border-[#efd8ad]/15 bg-[#d6b26e]/8 px-2.5 py-1 text-xs text-[#d6b26e] whitespace-nowrap">
                      {step.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[#efd8ad]/15 bg-[#d6b26e]/6 px-6 py-4 text-center">
          <p className="font-semibold text-[#efd8ad]">
            Tiempo total estimado: menos de 15 minutos de principio a pack listo.
          </p>
        </div>
      </div>
    </section>
  );
}
