const ROI_CARDS = [
  {
    icon: "📅",
    title: "Llenar huecos libres",
    desc: "Un reel de huecos disponibles del día publicado con QR de reserva puede llenar la agenda en horas.",
    result: "→ Más reservas sin llamar",
  },
  {
    icon: "🔗",
    title: "Conseguir reservas",
    desc: "El QR integrado en el vídeo lleva al cliente directo a tu sistema de citas sin fricciones.",
    result: "→ Reservas desde redes sociales",
  },
  {
    icon: "🔄",
    title: "Recuperar clientes",
    desc: "Vídeo personalizado para clientes que no han vuelto. Con oferta y CTA directo por WhatsApp.",
    result: "→ Clientes inactivos que regresan",
  },
  {
    icon: "🎯",
    title: "Promocionar ofertas",
    desc: "Corte + barba a precio especial durante la semana. Hook directo, subtítulos claros y CTA de reserva.",
    result: "→ Tráfico directo a la oferta",
  },
  {
    icon: "✂",
    title: "Mostrar resultados",
    desc: "Vídeo antes/después del corte con subtítulos del estilo. Credibilidad que convierte seguidores en clientes.",
    result: "→ Prueba social automatizada",
  },
  {
    icon: "⭐",
    title: "Pedir reseñas",
    desc: "Vídeo de cierre con CTA para dejar valoración en Google. Simple, personal y efectivo.",
    result: "→ Más reseñas sin pedirlas a mano",
  },
] as const;

export function LocalBusinessROISection() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background: "linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.5) 50%, #09090b 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Impacto comercial
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Cada vídeo debe cumplir una{" "}
            <span className="text-[#d6b26e]">función comercial</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            El objetivo no es editar por editar. Es convertir contenido en reservas, mensajes y clientes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROI_CARDS.map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition-all hover:border-[#efd8ad]/25 hover:bg-[#d6b26e]/[0.04]"
            >
              <div className="mb-4 text-3xl">{card.icon}</div>
              <h3 className="mb-2 text-lg font-bold text-white transition group-hover:text-[#efd8ad]">
                {card.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-zinc-500">{card.desc}</p>
              <div className="rounded-lg border border-[#efd8ad]/15 bg-[#d6b26e]/8 px-3 py-2">
                <p className="text-xs font-semibold text-[#d6b26e]">{card.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
