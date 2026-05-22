import type { VideoEditorCommercialTemplate } from "@/lib/video-editor/types";

export const defaultTemplateId = "generico" as const;

export const videoEditorTemplates = [
  {
    id: "barberia",
    name: "Barbería",
    niche: "Reservas",
    description: "Ideal para cortes, promociones y reservas",
    hook: "Tu barbería puede vender más con vídeo",
    cta: "Reserva tu cita desde el QR",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
  {
    id: "negocio_local",
    name: "Negocio local",
    niche: "Ventas",
    description: "Para tiendas, restaurantes, clínicas y servicios",
    hook: "Tu negocio necesita contenido que venda",
    cta: "Convierte visitas en clientes",
    accentColor: "#E2BC78",
    style: "premium-dark",
  },
  {
    id: "agencia_ia",
    name: "Agencia IA",
    niche: "Automatización",
    description: "Para demos, tutoriales y automatizaciones",
    hook: "Esto lo puede hacer una IA por ti",
    cta: "Automatiza tu contenido",
    accentColor: "#B8E1FF",
    style: "premium-dark",
  },
  {
    id: "podcast",
    name: "Podcast",
    niche: "Clips",
    description: "Para entrevistas, clips y contenido educativo",
    hook: "Este clip merece convertirse en contenido",
    cta: "Sígueme para más",
    accentColor: "#E7A7FF",
    style: "premium-dark",
  },
  {
    id: defaultTemplateId,
    name: "Genérico",
    niche: "Estándar",
    description: "Plantilla estándar para cualquier vídeo",
    hook: "Tu vídeo ya se edita en automático",
    cta: "Sígueme para más",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
] as const satisfies readonly VideoEditorCommercialTemplate[];

const templatesById = new Map(
  videoEditorTemplates.map((template) => [template.id, template]),
);

export function isValidTemplateId(
  value: unknown,
): value is VideoEditorCommercialTemplate["id"] {
  return typeof value === "string" && templatesById.has(value as never);
}

export function getTemplateById(value: unknown) {
  if (!isValidTemplateId(value)) {
    return templatesById.get(defaultTemplateId)!;
  }

  return templatesById.get(value)!;
}
