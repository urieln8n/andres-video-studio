import type {
  VideoEditorExportQuality,
  VideoEditorOutputFormat,
  VideoEditorPlatformPresetId,
  VideoEditorSafeZone,
  VideoEditorSubtitleStyle,
} from "@/lib/video-editor/types";

export type VideoEditorPlatformPreset = {
  id: VideoEditorPlatformPresetId;
  label: string;
  description: string;
  platform: string;
  outputFormat: VideoEditorOutputFormat;
  exportQuality: VideoEditorExportQuality;
  subtitleStyle: VideoEditorSubtitleStyle;
  recommendedDurationSeconds: number;
  safeZone: VideoEditorSafeZone;
  hookStyle: string;
  ctaStyle: string;
  badge: string;
};

export const platformPresets: VideoEditorPlatformPreset[] = [
  {
    id: "tiktok",
    label: "TikTok",
    description: "Vídeo vertical viral para TikTok",
    platform: "TikTok",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "viral",
    recommendedDurationSeconds: 30,
    safeZone: { top: 120, bottom: 340, left: 40, right: 40 },
    hookStyle: "grande, impactante",
    ctaStyle: "directo, urgente",
    badge: "Viral corto",
  },
  {
    id: "instagram_reels",
    label: "Instagram Reels",
    description: "Reels vertical con estilo premium",
    platform: "Instagram",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "premium",
    recommendedDurationSeconds: 30,
    safeZone: { top: 100, bottom: 280, left: 40, right: 40 },
    hookStyle: "elegante, aspiracional",
    ctaStyle: "sutil, profesional",
    badge: "Reels",
  },
  {
    id: "youtube_shorts",
    label: "YouTube Shorts",
    description: "Short vertical para YouTube",
    platform: "YouTube",
    outputFormat: "vertical_9_16",
    exportQuality: "standard",
    subtitleStyle: "viral",
    recommendedDurationSeconds: 45,
    safeZone: { top: 100, bottom: 260, left: 40, right: 40 },
    hookStyle: "grande, llamativo",
    ctaStyle: "claro, suscríbete",
    badge: "Shorts",
  },
  {
    id: "instagram_feed",
    label: "Instagram Feed",
    description: "Publicación cuadrada para el feed",
    platform: "Instagram",
    outputFormat: "square_1_1",
    exportQuality: "premium",
    subtitleStyle: "premium",
    recommendedDurationSeconds: 60,
    safeZone: { top: 60, bottom: 120, left: 40, right: 40 },
    hookStyle: "centrado, limpio",
    ctaStyle: "integrado, elegante",
    badge: "Feed",
  },
  {
    id: "youtube_horizontal",
    label: "YouTube",
    description: "Vídeo horizontal para YouTube",
    platform: "YouTube",
    outputFormat: "horizontal_16_9",
    exportQuality: "premium",
    subtitleStyle: "minimal",
    recommendedDurationSeconds: 120,
    safeZone: { top: 40, bottom: 80, left: 80, right: 80 },
    hookStyle: "ancho, cinematográfico",
    ctaStyle: "profesional, amplio",
    badge: "YouTube",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Contenido profesional cuadrado",
    platform: "LinkedIn",
    outputFormat: "square_1_1",
    exportQuality: "premium",
    subtitleStyle: "minimal",
    recommendedDurationSeconds: 90,
    safeZone: { top: 50, bottom: 100, left: 40, right: 40 },
    hookStyle: "profesional, sobrio",
    ctaStyle: "corporativo, claro",
    badge: "Profesional",
  },
];

const presetMap = new Map(
  platformPresets.map((preset) => [preset.id, preset]),
);

export function getPlatformPresetById(
  id: VideoEditorPlatformPresetId,
): VideoEditorPlatformPreset {
  return presetMap.get(id) ?? platformPresets[1]; // default: instagram_reels
}

export function isValidPlatformPreset(
  value: unknown,
): value is VideoEditorPlatformPresetId {
  return (
    typeof value === "string" &&
    (value === "custom" || presetMap.has(value as VideoEditorPlatformPresetId))
  );
}
