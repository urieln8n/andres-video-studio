import type { VideoEditorPipelineStepId } from "@/lib/video-editor/types";

export type VideoEditorPipelineStep = {
  id: VideoEditorPipelineStepId;
  label: string;
  progress: number;
  description: string;
};

export const videoEditorPipelineSteps = [
  {
    id: "uploaded",
    label: "Vídeo recibido",
    progress: 0,
    description: "El archivo y su job local ya están guardados.",
  },
  {
    id: "starting",
    label: "Inicio",
    progress: 5,
    description: "Se valida el job antes de iniciar el render.",
  },
  {
    id: "preparing",
    label: "Preparación",
    progress: 10,
    description: "FFmpeg valida el archivo de entrada y el formato.",
  },
  {
    id: "trim_silences",
    label: "Recorte de silencios",
    progress: 20,
    description: "Se detectan y recortan pausas largas cuando aplica.",
  },
  {
    id: "extracting_audio",
    label: "Extracción de audio",
    progress: 30,
    description: "Se genera WAV local para la transcripción.",
  },
  {
    id: "transcribing",
    label: "Transcripción",
    progress: 45,
    description: "Whisper crea segmentos y timestamps disponibles.",
  },
  {
    id: "detecting_fillers",
    label: "Detección de muletillas",
    progress: 55,
    description: "Se analiza la limpieza segura de fillers.",
  },
  {
    id: "cleaning_fillers",
    label: "Limpieza de muletillas",
    progress: 55,
    description: "Se aplican cortes seguros y se re-sincroniza el audio.",
  },
  {
    id: "generating_subtitles",
    label: "Subtítulos",
    progress: 68,
    description: "Se prepara el ASS con el transcript final.",
  },
  {
    id: "reviewing_copy",
    label: "Revisión de copy",
    progress: 68,
    description: "El hook, CTA y textos esperan aprobación antes del render.",
  },
  {
    id: "rendering_subtitles",
    label: "Render de subtítulos",
    progress: 78,
    description: "Se quema el ASS en el vídeo formateado.",
  },
  {
    id: "applying_hook_cta",
    label: "Hook y CTA",
    progress: 86,
    description: "Se aplica la plantilla comercial seleccionada.",
  },
  {
    id: "applying_motion",
    label: "Motion graphics",
    progress: 92,
    description: "Se compone motion premium o el fallback FFmpeg.",
  },
  {
    id: "exporting",
    label: "Exportación",
    progress: 97,
    description: "Se valida el MP4 final en storage/output.",
  },
  {
    id: "completed",
    label: "Completado",
    progress: 100,
    description: "El vídeo final está listo.",
  },
  {
    id: "failed",
    label: "Error",
    progress: 100,
    description: "El job terminó con un error registrado.",
  },
] satisfies VideoEditorPipelineStep[];

export function getPipelineStep(id: string | null | undefined) {
  return videoEditorPipelineSteps.find((step) => step.id === id);
}
