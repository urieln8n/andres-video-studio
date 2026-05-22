import type {
  VideoEditorCommercialTemplate,
  VideoEditorJob,
} from "@/lib/video-editor/types";

const commercialTemplates = [
  {
    id: "barberia",
    name: "Barbería",
    hook: "Tu barbería puede vender más con vídeo",
    cta: "Reserva tu cita desde el QR",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
  {
    id: "negocio_local",
    name: "Negocio local",
    hook: "Tu negocio necesita contenido que venda",
    cta: "Convierte visitas en clientes",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
  {
    id: "agencia_ia",
    name: "Agencia IA",
    hook: "Esto lo puede hacer una IA por ti",
    cta: "Automatiza tu contenido",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
  {
    id: "podcast",
    name: "Podcast",
    hook: "Tu vídeo ya se edita en automático",
    cta: "Sígueme para más",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
  {
    id: "generico",
    name: "Genérico",
    hook: "Tu vídeo ya se edita en automático",
    cta: "Sígueme para más",
    accentColor: "#D6A84F",
    style: "premium-dark",
  },
] as const satisfies readonly VideoEditorCommercialTemplate[];

const templatesById = new Map(
  commercialTemplates.map((template) => [template.id, template]),
);

export function selectCommercialTemplate(job: VideoEditorJob) {
  const sourceText = normalizeText(
    [
      job.originalFileName,
      job.transcriptionText,
      job.transcriptSegments?.map((segment) => segment.text).join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (hasAny(sourceText, ["barberia", "barbero", "barba", "degradado", "fade"])) {
    return getCommercialTemplate("barberia");
  }

  if (
    hasAny(sourceText, [
      "inteligencia artificial",
      "agencia ia",
      "automatiza",
      "automatizacion",
    ])
  ) {
    return getCommercialTemplate("agencia_ia");
  }

  if (hasAny(sourceText, ["podcast", "episodio", "entrevista", "invitado"])) {
    return getCommercialTemplate("podcast");
  }

  if (
    hasAny(sourceText, [
      "negocio local",
      "tienda",
      "restaurante",
      "clientes",
      "reservas",
      "cita",
    ])
  ) {
    return getCommercialTemplate("negocio_local");
  }

  return getCommercialTemplate("generico");
}

export function getCommercialTemplate(id: VideoEditorCommercialTemplate["id"]) {
  return templatesById.get(id) ?? templatesById.get("generico")!;
}

function hasAny(value: string, candidates: string[]) {
  return candidates.some((candidate) => value.includes(candidate));
}

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
