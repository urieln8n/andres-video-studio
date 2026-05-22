import type {
  VideoEditorCommercialTemplate,
  VideoEditorExportQuality,
  VideoEditorOutputFormat,
  VideoEditorSubtitleStyle,
} from "@/lib/video-editor/types";

export type VideoEditorCommercialPresetId =
  | "barberia_reels"
  | "barberia_promo"
  | "negocio_local_vitrina"
  | "negocio_local_testimonio"
  | "agencia_ia_demo"
  | "agencia_ia_caso"
  | "podcast_clip"
  | "fotografo_portfolio"
  | "restaurante_plato"
  | "generico_viral";

export type VideoEditorCommercialPreset = {
  id: VideoEditorCommercialPresetId;
  label: string;
  description: string;
  niche: string;
  badge: string;
  templateId: VideoEditorCommercialTemplate["id"];
  hook: string;
  cta: string;
  outputFormat: VideoEditorOutputFormat;
  exportQuality: VideoEditorExportQuality;
  subtitleStyle: VideoEditorSubtitleStyle;
  motionEnabled: boolean;
  trimSilences: boolean;
  removeFillers: boolean;
};

export const commercialPresets: readonly VideoEditorCommercialPreset[] = [
  {
    id: "barberia_reels",
    label: "Barbería — Reel de corte",
    description: "Reel vertical mostrando un corte o transformación antes/después",
    niche: "Barbería",
    badge: "Reels",
    templateId: "barberia",
    hook: "Mira este corte que hicimos hoy",
    cta: "Reserva tu cita desde el link en bio",
    outputFormat: "vertical_9_16",
    exportQuality: "premium",
    subtitleStyle: "viral",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "barberia_promo",
    label: "Barbería — Promoción",
    description: "Vídeo cuadrado para promociones, ofertas y descuentos",
    niche: "Barbería",
    badge: "Promo",
    templateId: "barberia",
    hook: "Esta semana tenemos algo especial para ti",
    cta: "Reserva ahora y aprovecha la oferta",
    outputFormat: "square_1_1",
    exportQuality: "standard",
    subtitleStyle: "premium",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "negocio_local_vitrina",
    label: "Negocio local — Vitrina",
    description: "Muestra tu producto o servicio estrella en formato vertical",
    niche: "Negocio local",
    badge: "Vitrina",
    templateId: "negocio_local",
    hook: "Esto es lo que más nos piden nuestros clientes",
    cta: "Visítanos o pide por WhatsApp",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "premium",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "negocio_local_testimonio",
    label: "Negocio local — Testimonio",
    description: "Testimonio de un cliente real para generar confianza",
    niche: "Negocio local",
    badge: "Testimonio",
    templateId: "negocio_local",
    hook: "Escucha lo que dice este cliente sobre nosotros",
    cta: "Tú también puedes probarlo",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "minimal",
    motionEnabled: false,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "agencia_ia_demo",
    label: "Agencia IA — Demo",
    description: "Demostración de una automatización o herramienta de IA",
    niche: "Agencia IA",
    badge: "Demo",
    templateId: "agencia_ia",
    hook: "Mira lo que puede hacer esta IA por tu negocio",
    cta: "Agenda una demo gratuita",
    outputFormat: "vertical_9_16",
    exportQuality: "premium",
    subtitleStyle: "viral",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "agencia_ia_caso",
    label: "Agencia IA — Caso de éxito",
    description: "Muestra resultados reales de un cliente de la agencia",
    niche: "Agencia IA",
    badge: "Caso",
    templateId: "agencia_ia",
    hook: "Este negocio ahorraba 0 horas hasta que nos encontró",
    cta: "Automatiza tu negocio hoy",
    outputFormat: "horizontal_16_9",
    exportQuality: "premium",
    subtitleStyle: "premium",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "podcast_clip",
    label: "Podcast — Clip viral",
    description: "Fragmento de entrevista o monólogo para redes sociales",
    niche: "Podcast",
    badge: "Clip",
    templateId: "podcast",
    hook: "Esto que dijo me dejó pensando",
    cta: "Escucha el episodio completo en el link",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "viral",
    motionEnabled: false,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "fotografo_portfolio",
    label: "Fotógrafo — Portfolio",
    description: "Muestra tu trabajo fotográfico con estilo cinematográfico",
    niche: "Fotógrafo",
    badge: "Portfolio",
    templateId: "generico",
    hook: "Así se ve mi trabajo en movimiento",
    cta: "Reserva tu sesión conmigo",
    outputFormat: "vertical_9_16",
    exportQuality: "premium",
    subtitleStyle: "minimal",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: false,
  },
  {
    id: "restaurante_plato",
    label: "Restaurante — Plato estrella",
    description: "Vídeo atractivo de tu plato o bebida principal",
    niche: "Restaurante",
    badge: "Plato",
    templateId: "negocio_local",
    hook: "Nuestro plato más pedido esta semana",
    cta: "Ven a probarlo o pide a domicilio",
    outputFormat: "vertical_9_16",
    exportQuality: "premium",
    subtitleStyle: "premium",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
  {
    id: "generico_viral",
    label: "Genérico — Contenido viral",
    description: "Formato universal optimizado para máximo alcance",
    niche: "General",
    badge: "Viral",
    templateId: "generico",
    hook: "Esto te va a interesar",
    cta: "Sígueme para más contenido como este",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "viral",
    motionEnabled: true,
    trimSilences: true,
    removeFillers: true,
  },
] as const;

const presetsById = new Map(
  commercialPresets.map((preset) => [preset.id, preset]),
);

export function isValidCommercialPreset(
  value: unknown,
): value is VideoEditorCommercialPresetId {
  return typeof value === "string" && presetsById.has(value as never);
}

export function getCommercialPresetById(
  value: unknown,
): VideoEditorCommercialPreset {
  if (isValidCommercialPreset(value)) {
    return presetsById.get(value)!;
  }
  return presetsById.get("generico_viral")!;
}
