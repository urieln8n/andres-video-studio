import Link from "next/link";

const creationPaths = [
  {
    title: "Crear vídeo",
    description:
      "Entra al flujo principal para preparar clips, subtítulos y formatos sociales.",
    href: "/video-editor/create",
    cta: "Abrir estudio",
  },
  {
    title: "Activar un agente",
    description:
      "Elige un agente premium para resolver una entrega concreta con criterio de negocio.",
    href: "/video-editor/agents",
    cta: "Ver agentes",
  },
  {
    title: "BarberíaOS Studio",
    description:
      "Producción enfocada en reservas, reels de cortes y presencia local para barberías.",
    href: "/video-editor/barberiaos",
    cta: "Abrir BarberíaOS",
  },
];

export default function VideoEditorPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#d6b26e]">
            Andrés Video Studio
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            ¿Qué quieres crear hoy?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Una entrada más clara para decidir rápido: producir un vídeo,
            trabajar con agentes premium o entrar al estudio vertical para
            barberías.
          </p>
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
      </section>
    </main>
  );
}
