import Link from "next/link";

export function BarberiaOSHero() {
  return (
    <section className="relative overflow-hidden rounded-[8px] border border-[#efd8ad]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.095),rgba(255,255,255,0.035))] px-5 py-8 shadow-[0_38px_130px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-y-0 right-0 hidden w-28 border-l border-white/[0.06] opacity-45 [background:repeating-linear-gradient(135deg,rgba(169,33,42,0.55)_0_11px,rgba(248,245,238,0.2)_11px_22px,rgba(46,91,144,0.45)_22px_33px,transparent_33px_44px)] lg:block" />
      <div className="relative max-w-4xl">
        <div className="flex flex-wrap gap-2">
          {["Reservas", "QR", "Agenda", "Clientes"].map((badge) => (
            <span
              key={badge}
              className="rounded-[8px] border border-[#efd8ad]/20 bg-[#d6b26e]/10 px-3 py-1 text-xs font-semibold uppercase text-[#efd8ad]"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm font-medium uppercase text-[#d6b26e]">
          Modo especializado
        </p>
        <h1 className="mt-3 text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-8xl">
          BarberíaOS Content Studio
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-200 sm:text-xl">
          Crea reels automáticos para llenar agenda, promocionar cortes y llevar
          clientes a tu QR de reservas.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-[#efd8ad]/35 bg-[linear-gradient(135deg,#efd8ad,#ba843d)] px-6 text-base font-semibold text-zinc-950 shadow-[0_22px_80px_-36px_rgba(214,178,110,0.95)] transition hover:brightness-110"
            href="/video-editor/create?mode=barberiaos&commercialPresetId=barberia_huecos_libres&platformPreset=instagram_reels&templateId=barberia"
          >
            Crear vídeo para mi barbería
          </Link>
          <Link
            className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-white/12 bg-black/20 px-6 text-base font-semibold text-white transition hover:border-[#efd8ad]/28 hover:text-[#efd8ad]"
            href="/video-editor/library"
          >
            Ver biblioteca
          </Link>
        </div>
      </div>
    </section>
  );
}
