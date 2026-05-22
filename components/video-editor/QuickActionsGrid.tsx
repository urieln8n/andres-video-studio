import Link from "next/link";

import { PanelHeader } from "@/components/video-editor/RecentActivityList";

const actions = [
  {
    href: "/video-editor/barberiaos",
    label: "Crear vídeo para BarberíaOS",
    detail: "Reserva, QR y copy orientado a barbería.",
  },
  {
    href: "/video-editor",
    label: "Crear vídeo genérico",
    detail: "Sube un vídeo y usa los presets del estudio.",
  },
  {
    href: "/video-editor/clients/new",
    label: "Crear cliente",
    detail: "Añade una marca a storage local.",
  },
  {
    href: "/video-editor/library",
    label: "Ver biblioteca",
    detail: "Revisa vídeos, previews y descargas.",
  },
  {
    href: "/video-editor/clients",
    label: "Ver clientes",
    detail: "Abre la cartera de agencia.",
  },
  {
    href: "/video-editor/library?filter=completed",
    label: "Ver packs exportados",
    detail: "Localiza jobs completados con packs.",
  },
  {
    href: "/video-editor/demo",
    label: "Demo comercial",
    detail: "Landing de presentación del estudio.",
  },
  {
    href: "/video-editor/pitch",
    label: "Pitch comercial",
    detail: "Presentación de ventas para mostrar a clientes.",
  },
] as const;

export function QuickActionsGrid() {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <PanelHeader
        description="Rutas habituales para producción y control de clientes."
        title="Accesos rápidos"
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            className="group rounded-[8px] border border-white/[0.08] bg-black/20 p-4 transition hover:border-[#efd8ad]/25 hover:bg-[#d6b26e]/10"
            href={action.href}
            key={action.label}
          >
            <p className="font-semibold text-white transition group-hover:text-[#efd8ad]">
              {action.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{action.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
