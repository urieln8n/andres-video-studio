const FAQS = [
  {
    q: "¿Tengo que saber editar vídeos?",
    a: "No. El sistema hace todo automáticamente: corta silencios, elimina muletillas, añade subtítulos, genera el hook y el CTA. Solo subes el vídeo y recibes el resultado.",
  },
  {
    q: "¿Sirve para Instagram y TikTok?",
    a: "Sí. El pack incluye captions, hashtags y textos específicos para Instagram, TikTok, YouTube Shorts y WhatsApp. Cada plataforma tiene su propio archivo.",
  },
  {
    q: "¿Puedo usarlo para mi barbería?",
    a: "Es exactamente para eso. El modo BarberíaOS está diseñado para crear reels que llevan al cliente a reservar. Incluye QR con tu link de citas.",
  },
  {
    q: "¿Puedo añadir mi link de reservas?",
    a: "Sí. En el modo BarberíaOS introduces tu URL de reservas y el sistema genera un QR que se superpone en el vídeo. El cliente escanea y reserva directamente.",
  },
  {
    q: "¿Me entregan solo el vídeo o también el texto?",
    a: "Recibes un pack completo: vídeo procesado, caption por plataforma, hashtags, texto para WhatsApp, story text y checklist de publicación. Todo en un ZIP.",
  },
  {
    q: "¿Puedo usarlo con varios clientes?",
    a: "Sí. El sistema tiene gestión de clientes y una biblioteca con todos los trabajos. Puedes asociar vídeos a clientes y ver el historial de producción.",
  },
  {
    q: "¿Esto reemplaza a CapCut?",
    a: "No compite con CapCut. Andrés Video Studio automatiza el flujo completo: corte, subtítulos, copy y entrega. CapCut es para edición manual. Este sistema es para producción automática a escala.",
  },
] as const;

export function PitchFAQ() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.35) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            FAQ
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Preguntas que suelen tener los clientes
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:border-[#efd8ad]/18"
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#d6b26e]/20 text-[10px] font-bold text-[#d6b26e]">
                  ?
                </span>
                <h3 className="font-semibold text-white leading-snug">{faq.q}</h3>
              </div>
              <p className="pl-8 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
