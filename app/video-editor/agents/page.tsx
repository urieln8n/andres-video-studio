import Link from "next/link";

import { AgentCard, type AgentCardData } from "@/components/video-editor/AgentCard";

const agents: AgentCardData[] = [
  {
    accent: "Retención",
    badge: "↗",
    name: "Viral Clips",
    problem: "Hay material bruto, pero falta velocidad para convertirlo en piezas publicables.",
    result: "Clips verticales con ritmo, gancho inicial, subtítulos y estructura para retención.",
    audience: "Creadores, negocios locales y equipos que publican en Reels, TikTok o Shorts.",
    cta: "Crear clip viral",
    status: "activo",
    href: "/video-editor/create?agent=viral-clips",
  },
  {
    accent: "Caso estrella",
    badge: "QR",
    name: "BarberíaOS",
    problem: "La barbería publica sin conectar contenido, reservas y confianza local.",
    result: "Reels y piezas comerciales con CTA de reserva, prueba social y estilo de marca.",
    audience: "Barberías, peluquerías masculinas y estudios de grooming.",
    cta: "Abrir BarberíaOS",
    status: "activo",
    href: "/video-editor/barberiaos",
  },
  {
    accent: "Distribución",
    badge: "Aa",
    name: "Copy & Captions",
    problem: "El vídeo sale editado, pero el texto no vende ni explica el valor.",
    result: "Hooks, captions, hashtags y variaciones listas para revisar después de procesar.",
    audience: "Social media managers, founders y negocios que necesitan mejor distribución.",
    cta: "Crear con copy",
    status: "beta",
    href: "/video-editor/create?agent=copy-captions",
  },
  {
    accent: "Autoridad",
    badge: "✂",
    name: "Limpieza Pro",
    problem: "El material tiene pausas, muletillas o partes flojas que reducen autoridad.",
    result: "Una versión más limpia, directa y apta para presentaciones o contenido premium.",
    audience: "Consultores, formadores, marcas personales y equipos de venta.",
    cta: "Crear vídeo limpio",
    status: "beta",
    href: "/video-editor/create?agent=limpieza-pro",
  },
  {
    accent: "Negocio local",
    badge: "●",
    name: "Marca Local",
    problem: "El negocio no traduce su propuesta a contenido local claro y reconocible.",
    result: "Piezas con posicionamiento, oferta, tono visual y llamada a la acción local.",
    audience: "Restaurantes, centros estéticos, gimnasios, clínicas y servicios locales.",
    cta: "Crear pieza local",
    status: "beta",
    href: "/video-editor/create?agent=marca-local",
  },
  {
    accent: "Entrega",
    badge: "ZIP",
    name: "Pack Entregable",
    problem: "La entrega final queda dispersa entre vídeo, copy, miniatura y assets.",
    result: "Un paquete organizado para cliente con vídeo, textos y checklist tras procesar.",
    audience: "Freelancers, agencias pequeñas y operadores que entregan trabajo a clientes.",
    cta: "Crear para entregar",
    status: "beta",
    href: "/video-editor/create?agent=pack-entregable",
  },
  {
    accent: "Operación",
    badge: "◎",
    name: "Agencia",
    problem: "Gestionar muchos clientes exige priorizar, revisar y empaquetar entregas sin fricción.",
    result: "Un modo operativo para volumen: colas, estados, entregables y control por cuenta.",
    audience: "Agencias, estudios de contenido y equipos con múltiples marcas.",
    cta: "Ver dashboard",
    status: "activo",
    href: "/video-editor/dashboard",
  },
];

export default function AgentsPage() {
  return (
    <main className="flex flex-1 flex-col px-5 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#d6b26e]">
              Agentes Premium
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
              Sistemas premium para convertir vídeo bruto en contenido que vende.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-zinc-300 lg:justify-self-end">
            Cada agente resuelve una entrega concreta: vídeo final, copy,
            captions, CTA y pack listo para publicar o entregar a cliente.
          </p>
        </div>

        <section className="grid gap-5 rounded-[8px] border border-[#efd8ad]/20 bg-[linear-gradient(135deg,rgba(214,178,110,0.16),rgba(255,255,255,0.055))] p-6 shadow-[0_36px_130px_-82px_rgba(0,0,0,1)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)] lg:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#efd8ad]">
              Agente destacado
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              BarberíaOS convierte cortes, huecos y reseñas en reservas.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-200">
              El flujo especializado añade CTA, QR de reservas y piezas para
              Instagram, WhatsApp y Google Business.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/35 bg-[#d6b26e] px-5 text-sm font-semibold text-[#14110c] transition hover:bg-[#efd8ad]"
                href="/video-editor/barberiaos"
              >
                Abrir BarberíaOS
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/12 bg-black/20 px-5 text-sm font-semibold text-white transition hover:border-[#efd8ad]/28 hover:text-[#efd8ad]"
                href="/video-editor/create?agent=viral-clips"
              >
                Crear vídeo automático
              </Link>
            </div>
          </div>
          <div className="grid content-center gap-3">
            {["QR de reservas", "Huecos libres hoy", "Antes/después", "Pack de publicación"].map((item) => (
              <div
                className="rounded-[8px] border border-white/10 bg-black/24 px-4 py-3 text-sm font-semibold text-zinc-100"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </section>
    </main>
  );
}
