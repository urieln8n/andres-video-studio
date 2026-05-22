const PLANS = [
  {
    name: "Starter",
    price: "197",
    tagline: "Para empezar a facturar con vídeo",
    features: [
      "10 vídeos al mes",
      "Subtítulos automáticos",
      "Hook + CTA generado",
      "Captions multi-plataforma",
      "Hashtags incluidos",
      "Entrega en ZIP",
    ],
    highlighted: false,
    cta: "Empezar con Starter",
  },
  {
    name: "Pro",
    price: "397",
    tagline: "El más elegido por agencias activas",
    features: [
      "20 vídeos al mes",
      "Todo lo de Starter",
      "Limpieza silencios y fillers",
      "Copy pack completo",
      "WhatsApp text incluido",
      "Biblioteca por cliente",
      "Dashboard de producción",
    ],
    highlighted: true,
    cta: "Quiero el Plan Pro",
  },
  {
    name: "Premium",
    price: "697",
    tagline: "Para producción de alto volumen",
    features: [
      "30 vídeos al mes",
      "Todo lo de Pro",
      "Modo BarberíaOS QR",
      "Estrategia semanal",
      "Packs ZIP personalizados",
      "Revisión de copy manual",
      "Soporte prioritario",
    ],
    highlighted: false,
    cta: "Ver Premium",
  },
] as const;

export function ServicePackagesSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Paquetes mensuales
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Paquetes mensuales orientativos
          </h2>
          <p className="mx-auto max-w-xl text-zinc-500">
            Precios orientativos para ofrecer como servicio de agencia.
            No hay checkout ni pago automático.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? "border-2 border-[#efd8ad]/40 bg-[#d6b26e]/[0.07] shadow-xl shadow-[#d6b26e]/10"
                  : "border border-white/10 bg-white/[0.04] hover:border-white/18"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#d6b26e] px-5 py-1.5 text-xs font-bold text-zinc-950 shadow-lg">
                  MÁS ELEGIDO
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-bold ${plan.highlighted ? "text-[#efd8ad]" : "text-white"}`}
                >
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{plan.price}€</span>
                <span className="text-zinc-500">/mes</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 flex-shrink-0 text-base leading-none ${
                        plan.highlighted ? "text-[#d6b26e]" : "text-zinc-500"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`cursor-default rounded-xl py-3.5 text-center text-sm font-bold transition-all ${
                  plan.highlighted
                    ? "bg-[#d6b26e] text-zinc-950 hover:bg-[#efd8ad]"
                    : "border border-white/12 bg-white/8 text-white hover:bg-white/12"
                }`}
              >
                {plan.cta}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          * Precios orientativos para estructurar la oferta de agencia. Sin checkout ni sistema de pago integrado.
        </p>
      </div>
    </section>
  );
}
