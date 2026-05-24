import Link from "next/link";

const creationPaths = [
  {
    title: "Crear vídeo automático",
    description:
      "Sube material bruto y conviértelo en un vídeo vertical con subtítulos, CTA y salida lista para redes.",
    href: "/video-editor/create?agent=viral-clips",
    cta: "Crear vídeo",
  },
  {
    title: "Usar Agentes Premium",
    description:
      "Elige un sistema especializado para generar vídeo, copy y pack de publicación con criterio comercial.",
    href: "/video-editor/agents",
    cta: "Ver agentes",
  },
  {
    title: "Crear reel BarberíaOS",
    description:
      "Crea reels para huecos libres, antes/después, promociones, reseñas y reservas por QR.",
    href: "/video-editor/barberiaos",
    cta: "Crear reel",
  },
];

export default function VideoEditorPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#d6b26e]">
            Plataforma de agentes premium
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            Crea vídeos, copy y packs listos para publicar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Andrés Video Studio transforma vídeos brutos en contenido listo
            para vender: edición automática, hooks, captions, CTA y entrega
            organizada para redes o clientes.
          </p>
          </div>
          <div className="grid gap-3 rounded-[8px] border border-[#efd8ad]/18 bg-white/[0.055] p-5 shadow-[0_30px_110px_-72px_rgba(0,0,0,1)] backdrop-blur-xl">
            {[
              "Vídeo final para Reels, TikTok o Shorts",
              "Copy, captions, hashtags y CTA",
              "Pack entregable listo para publicar",
            ].map((item) => (
              <div
                className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/22 px-4 py-3 text-sm font-medium text-zinc-200"
                key={item}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-[#d6b26e]/14 text-[#efd8ad]">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {creationPaths.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[18rem] flex-col justify-between rounded-[8px] border border-white/10 bg-[#11100f]/86 p-6 shadow-[0_28px_90px_-58px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:border-[#efd8ad]/35 hover:bg-[#15120e]"
            >
              <span>
                <span className="mb-5 grid size-11 place-items-center rounded-[8px] border border-[#efd8ad]/25 bg-[#d6b26e]/10 text-[#efd8ad]">
                  <svg
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <span className="block text-2xl font-semibold text-white">
                  {item.title}
                </span>
                <span className="mt-4 block text-sm leading-6 text-zinc-300">
                  {item.description}
                </span>
              </span>
              <span className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[#d6b26e]/10 px-4 text-sm font-semibold text-[#efd8ad] transition group-hover:bg-[#d6b26e] group-hover:text-[#14110c]">
                {item.cta}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-zinc-200 transition hover:border-[#efd8ad]/30 hover:text-[#efd8ad]"
            href="/video-editor/library"
          >
            Ver biblioteca
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-zinc-200 transition hover:border-[#efd8ad]/30 hover:text-[#efd8ad]"
            href="/video-editor/dashboard"
          >
            Ver dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
