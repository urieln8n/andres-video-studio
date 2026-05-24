export function BetaAccessSection() {
  return (
    <section className="bg-zinc-950 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div
          className="relative overflow-hidden rounded-3xl border border-[#efd8ad]/25 p-10 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(214,178,110,0.10) 0%, rgba(255,255,255,0.03) 60%, rgba(214,178,110,0.06) 100%)",
          }}
        >
          {/* Glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(214,178,110,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#efd8ad]/30 bg-[#d6b26e]/15 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#d6b26e]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#d6b26e]">
                Beta privada · Plazas limitadas
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black text-white sm:text-5xl">
                Acceso beta
              </h2>
              <p className="mx-auto max-w-lg text-lg text-zinc-400">
                Precio reducido a cambio de feedback activo. Onboarding personal,
                soporte directo y resultados reales desde el primer vídeo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Starter beta", price: "97€/mes", note: "10 vídeos" },
                { label: "Pro beta", price: "197€/mes", note: "20 vídeos · más elegido" },
                { label: "Premium beta", price: "297€/mes", note: "30 vídeos + QR" },
              ].map((plan) => (
                <div
                  key={plan.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {plan.label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">{plan.price}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{plan.note}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:fa.andres18@hotmail.com?subject=Solicitud%20demo%20Andr%C3%A9s%20Video%20Studio&body=Hola%2C%20me%20interesa%20ver%20una%20demo%20del%20sistema."
                className="group inline-flex items-center gap-2 rounded-2xl bg-[#d6b26e] px-8 py-4 text-base font-bold text-zinc-950 shadow-xl shadow-[#d6b26e]/20 transition-all hover:bg-[#efd8ad]"
              >
                Solicitar demo
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="https://wa.me/34600000000?text=Hola%2C%20me%20interesa%20ver%20una%20demo%20de%20Andr%C3%A9s%20Video%20Studio"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/12"
                rel="noopener noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>
            </div>

            <p className="text-xs text-zinc-600">
              Sin checkout automático · Contacto directo · Respuesta en menos de 24h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
