import Link from "next/link";

const actions: {
  href: string;
  label: string;
  primary?: boolean;
}[] = [
  { href: "/video-editor", label: "Nuevo vídeo", primary: true },
  { href: "/video-editor/clients/new", label: "Nuevo cliente" },
  { href: "/video-editor/library", label: "Biblioteca" },
  { href: "/video-editor/clients", label: "Clientes" },
];

export function AgencyDashboardHeader() {
  return (
    <header className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_36px_120px_-72px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">
            Andrés Video Studio
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-6xl">
            Dashboard de Agencia
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
            Controla clientes, vídeos procesados, packs generados y actividad de
            producción.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:w-[28rem]">
          {actions.map((action) => (
            <Link
              className={
                action.primary
                  ? "inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-4 font-semibold text-zinc-950 transition hover:brightness-110"
                  : "inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/12 bg-black/20 px-4 font-semibold text-white transition hover:border-[#efd8ad]/30 hover:text-[#efd8ad]"
              }
              href={action.href}
              key={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
