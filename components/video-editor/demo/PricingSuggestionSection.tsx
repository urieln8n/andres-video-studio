const PLANS = [
  {
    name: "Starter",
    price: "197",
    description: "Para empezar a ofrecer edición como servicio",
    features: [
      "10 vídeos al mes",
      "Subtítulos automáticos",
      "Recorte de silencios",
      "Publishing pack básico",
      "Export ZIP",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "397",
    description: "Para agencias con flujo de producción regular",
    features: [
      "20 vídeos al mes",
      "Todo lo de Starter",
      "Hook + CTA automático",
      "Captions multi-plataforma",
      "Gestión de clientes",
      "Dashboard de agencia",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "697",
    description: "Para agencias con clientes de alto volumen",
    features: [
      "30 vídeos al mes",
      "Todo lo de Pro",
      "BarberíaOS QR overlay",
      "Packs ZIP personalizados",
      "Soporte prioritario",
      "Estrategia de publicación",
    ],
    highlighted: false,
  },
] as const;

export function PricingSuggestionSection() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#d6b26e]">
            Precios orientativos
          </p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Úsalo como servicio de agencia
          </h2>
          <p className="mx-auto max-w-xl text-zinc-500">
            Precios orientativos para estructurar tu oferta. No hay sistema de pago integrado.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? "border-2 border-[#efd8ad]/40 bg-[#d6b26e]/8 shadow-lg shadow-[#d6b26e]/10"
                  : "border border-white/10 bg-white/[0.04] hover:border-white/18"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#d6b26e] px-4 py-1 text-xs font-bold text-zinc-950">
                  MÁS ELEGIDO
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`mb-1 text-xl font-bold ${plan.highlighted ? "text-[#efd8ad]" : "text-white"}`}
                >
                  {plan.name}
                </h3>
                <p className="text-sm text-zinc-500">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{plan.price}€</span>
                <span className="text-zinc-500">/mes</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-[#d6b26e]" : "text-zinc-500"}`}
                    >
                      ✓
                    </span>
                    <span className="text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-[#d6b26e] text-zinc-950 hover:bg-[#efd8ad]"
                    : "border border-white/10 bg-white/8 text-white hover:bg-white/12"
                }`}
              >
                Contactar
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          * Precios orientativos para estructurar la oferta de agencia. No hay checkout ni sistema de pago integrado.
        </p>
      </div>
    </section>
  );
}
