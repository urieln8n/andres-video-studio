import type {
  VideoEditorExportQuality,
  VideoEditorOutputFormat,
} from "@/lib/video-editor/types";

export type VideoEditorOutputFormatProfile = {
  id: VideoEditorOutputFormat;
  label: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: string;
  platformHints: string;
  recommended: boolean;
};

export type VideoEditorExportQualityProfile = {
  id: VideoEditorExportQuality;
  label: string;
  description: string;
  crf: number;
  preset: string;
  audioBitrate: string;
  recommended: boolean;
};

export const outputFormatProfiles: VideoEditorOutputFormatProfile[] = [
  {
    id: "vertical_9_16",
    label: "Vertical 9:16",
    description: "Formato vertical optimizado para móvil",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    platformHints: "TikTok, Instagram Reels, YouTube Shorts",
    recommended: true,
  },
  {
    id: "square_1_1",
    label: "Cuadrado 1:1",
    description: "Formato cuadrado para feeds y publicaciones",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    platformHints: "Instagram Feed, LinkedIn, Facebook",
    recommended: false,
  },
  {
    id: "horizontal_16_9",
    label: "Horizontal 16:9",
    description: "Formato panorámico para pantalla completa",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    platformHints: "YouTube, web, presentaciones",
    recommended: false,
  },
];

export const exportQualityProfiles: VideoEditorExportQualityProfile[] = [
  {
    id: "draft",
    label: "Borrador",
    description: "Render rápido, menor peso",
    crf: 28,
    preset: "veryfast",
    audioBitrate: "96k",
    recommended: false,
  },
  {
    id: "standard",
    label: "Estándar",
    description: "Equilibrio entre calidad y velocidad",
    crf: 23,
    preset: "fast",
    audioBitrate: "128k",
    recommended: true,
  },
  {
    id: "premium",
    label: "Premium",
    description: "Máxima calidad, mayor peso",
    crf: 18,
    preset: "medium",
    audioBitrate: "192k",
    recommended: false,
  },
];

const outputFormatMap = new Map(
  outputFormatProfiles.map((profile) => [profile.id, profile]),
);

const exportQualityMap = new Map(
  exportQualityProfiles.map((profile) => [profile.id, profile]),
);

export function getOutputFormatProfile(
  format: VideoEditorOutputFormat,
): VideoEditorOutputFormatProfile {
  return outputFormatMap.get(format) ?? outputFormatProfiles[0];
}

export function getExportQualityProfile(
  quality: VideoEditorExportQuality,
): VideoEditorExportQualityProfile {
  return exportQualityMap.get(quality) ?? exportQualityProfiles[1];
}

export function isValidOutputFormat(
  value: unknown,
): value is VideoEditorOutputFormat {
  return typeof value === "string" && outputFormatMap.has(value as VideoEditorOutputFormat);
}

export function isValidExportQuality(
  value: unknown,
): value is VideoEditorExportQuality {
  return typeof value === "string" && exportQualityMap.has(value as VideoEditorExportQuality);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
