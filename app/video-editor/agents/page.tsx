import { AgentCard, type AgentCardData } from "@/components/video-editor/AgentCard";

const agents: AgentCardData[] = [
  {
    name: "Viral Clips",
    problem: "Hay material bruto, pero falta velocidad para convertirlo en piezas publicables.",
    result: "Clips verticales con ritmo, gancho inicial, subtítulos y estructura para retención.",
    audience: "Creadores, negocios locales y equipos que publican en Reels, TikTok o Shorts.",
    cta: "Crear clip viral",
    status: "activo",
    href: "/video-editor/create",
  },
  {
    name: "BarberíaOS",
    problem: "La barbería publica sin conectar contenido, reservas y confianza local.",
    result: "Reels y piezas comerciales con CTA de reserva, prueba social y estilo de marca.",
    audience: "Barberías, peluquerías masculinas y estudios de grooming.",
    cta: "Abrir BarberíaOS",
    status: "activo",
    href: "/video-editor/barberiaos",
  },
  {
    name: "Copy & Captions",
    problem: "El vídeo sale editado, pero el texto no vende ni explica el valor.",
    result: "Hooks, captions, hashtags y variaciones listas para publicar o revisar.",
    audience: "Social media managers, founders y negocios que necesitan mejor distribución.",
    cta: "Generar copy",
    status: "activo",
    href: "/video-editor/copy",
  },
  {
    name: "Limpieza Pro",
    problem: "El material tiene pausas, muletillas o partes flojas que reducen autoridad.",
    result: "Una versión más limpia, directa y apta para presentaciones o contenido premium.",
    audience: "Consultores, formadores, marcas personales y equipos de venta.",
    cta: "Próximamente",
    status: "proximamente",
    href: "/video-editor/agents",
  },
  {
    name: "Marca Local",
    problem: "El negocio no traduce su propuesta a contenido local claro y reconocible.",
    result: "Piezas con posicionamiento, oferta, tono visual y llamada a la acción local.",
    audience: "Restaurantes, centros estéticos, gimnasios, clínicas y servicios locales.",
    cta: "Próximamente",
    status: "proximamente",
    href: "/video-editor/agents",
  },
  {
    name: "Pack Entregable",
    problem: "La entrega final queda dispersa entre vídeo, copy, miniatura y assets.",
    result: "Un paquete organizado para cliente con piezas, textos y checklist de publicación.",
    audience: "Freelancers, agencias pequeñas y operadores que entregan trabajo a clientes.",
    cta: "Preparar pack",
    status: "activo",
    href: "/video-editor/result",
  },
  {
    name: "Agencia",
    problem: "Gestionar muchos clientes exige priorizar, revisar y empaquetar entregas sin fricción.",
    result: "Un modo operativo para volumen: colas, estados, entregables y control por cuenta.",
    audience: "Agencias, estudios de contenido y equipos con múltiples marcas.",
    cta: "Próximamente",
    status: "proximamente",
    href: "/video-editor/agents",
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
              Sistemas de producción para resultados concretos.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-zinc-300 lg:justify-self-end">
            Cada agente está pensado como un producto operativo: entiende el
            problema, produce una salida clara y reduce decisiones repetidas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      </section>
    </main>
  );
}
