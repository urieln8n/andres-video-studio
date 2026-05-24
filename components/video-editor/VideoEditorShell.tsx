import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/video-editor/dashboard" },
  { label: "Crear vídeo", href: "/video-editor/create" },
  { label: "Agentes Premium", href: "/video-editor/agents" },
  { label: "BarberíaOS Studio", href: "/video-editor/barberiaos" },
  { label: "Biblioteca", href: "/video-editor/library" },
  { label: "Clientes", href: "/video-editor/clients" },
  { label: "Sistema", href: "/video-editor/system" },
];

export function VideoEditorShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-[#090909] font-sans text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(135deg,#090909_0%,#11100f_44%,#080808_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[linear-gradient(120deg,rgba(200,139,59,0.2),transparent_36%,rgba(231,204,154,0.08)_62%,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      <div className="flex min-h-screen w-full flex-col">
        <header className="px-5 pt-5 sm:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-3 shadow-[0_24px_80px_-52px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <Link
              href="/video-editor"
              className="flex min-w-0 items-center gap-3 text-white"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-[#ead0a0]/25 bg-[#d6b26e]/10 text-[#efd8ad]">
                <svg
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 5.5v13M17 5.5v13M4 9h16M4 15h16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span className="truncate text-sm font-semibold uppercase sm:text-base">
                ANDRES VIDEO STUDIO
              </span>
            </Link>

            <nav
              aria-label="Navegación principal"
              className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-10 shrink-0 items-center rounded-[8px] border border-white/10 bg-black/20 px-3 text-xs font-semibold text-zinc-200 transition hover:border-[#efd8ad]/30 hover:bg-[#d6b26e]/10 hover:text-[#efd8ad] sm:px-4 sm:text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
