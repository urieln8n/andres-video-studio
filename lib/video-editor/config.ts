import {
  isValidCommercialPreset,
} from "@/lib/video-editor/commercial-presets";
import {
  getExportQualityProfile,
  getOutputFormatProfile,
  isValidExportQuality,
  isValidOutputFormat,
} from "@/lib/video-editor/export-profiles";
import { isValidPlatformPreset } from "@/lib/video-editor/platform-presets";
import { defaultTemplateId, isValidTemplateId } from "@/lib/video-editor/templates";
import type {
  VideoEditorBarberiaOSConfig,
  VideoEditorBarberiaOSQrPosition,
  VideoEditorCommercialPresetId,
  VideoEditorConfig,
  VideoEditorExportQuality,
  VideoEditorMode,
  VideoEditorMotionMode,
  VideoEditorOutputFormat,
  VideoEditorPlatformPresetId,
  VideoEditorSubtitleStyle,
  VideoEditorTextMode,
} from "@/lib/video-editor/types";

export { isValidOutputFormat, isValidExportQuality, isValidPlatformPreset, isValidCommercialPreset };

const subtitleStyles = ["premium", "viral", "minimal"] as const;
const textModes = ["auto", "custom"] as const;
const motionModes = ["auto", "fallback"] as const;
const videoEditorModes = ["standard", "barberiaos"] as const;
const barberiaosQrPositions = [
  "bottom_right",
  "bottom_center",
  "end_screen",
] as const;
const maxOverlayTextLength = 180;

export const defaultVideoEditorConfig: VideoEditorConfig = {
  mode: "standard",
  barberiaos: {
    bookingUrl: null,
    barbershopName: "Tu barbería",
    showQrOverlay: true,
    qrCtaText: "Escanea y reserva tu cita",
    qrPosition: "end_screen",
  },
  commercialPreset: "custom",
  platformPreset: "instagram_reels",
  templateId: defaultTemplateId,
  outputFormat: "vertical_9_16",
  exportQuality: "standard",
  subtitleStyle: "premium",
  hookMode: "auto",
  hookText: null,
  ctaMode: "auto",
  ctaText: null,
  trimSilences: true,
  removeFillers: true,
  motionEnabled: true,
  motionMode: "auto",
  copyReviewEnabled: true,
};

export function isValidSubtitleStyle(
  value: unknown,
): value is VideoEditorSubtitleStyle {
  return subtitleStyles.includes(value as VideoEditorSubtitleStyle);
}

export function normalizeVideoEditorConfig(value: unknown): VideoEditorConfig {
  const candidate = toRecord(value);
  const hookText = normalizeText(candidate.hookText);
  const ctaText = normalizeText(candidate.ctaText);
  const hookMode = readOption(candidate.hookMode, textModes, "auto");
  const ctaMode = readOption(candidate.ctaMode, textModes, "auto");

  return {
    mode: readOption<VideoEditorMode>(
      candidate.mode,
      videoEditorModes,
      defaultVideoEditorConfig.mode,
    ),
    barberiaos: normalizeBarberiaOSConfig(candidate),
    commercialPreset: isValidCommercialPreset(candidate.commercialPreset)
      ? (candidate.commercialPreset as VideoEditorCommercialPresetId)
      : defaultVideoEditorConfig.commercialPreset,
    platformPreset: isValidPlatformPreset(candidate.platformPreset)
      ? (candidate.platformPreset as VideoEditorPlatformPresetId)
      : defaultVideoEditorConfig.platformPreset,
    templateId: isValidTemplateId(candidate.templateId)
      ? candidate.templateId
      : defaultVideoEditorConfig.templateId,
    outputFormat: isValidOutputFormat(candidate.outputFormat)
      ? candidate.outputFormat
      : defaultVideoEditorConfig.outputFormat,
    exportQuality: isValidExportQuality(candidate.exportQuality)
      ? candidate.exportQuality
      : defaultVideoEditorConfig.exportQuality,
    subtitleStyle: isValidSubtitleStyle(candidate.subtitleStyle)
      ? candidate.subtitleStyle
      : defaultVideoEditorConfig.subtitleStyle,
    hookMode: hookMode === "custom" && hookText ? hookMode : "auto",
    hookText: hookMode === "custom" ? hookText : null,
    ctaMode: ctaMode === "custom" && ctaText ? ctaMode : "auto",
    ctaText: ctaMode === "custom" ? ctaText : null,
    trimSilences: readBoolean(
      candidate.trimSilences,
      defaultVideoEditorConfig.trimSilences,
    ),
    removeFillers: readBoolean(
      candidate.removeFillers,
      defaultVideoEditorConfig.removeFillers,
    ),
    motionEnabled: readBoolean(
      candidate.motionEnabled,
      defaultVideoEditorConfig.motionEnabled,
    ),
    motionMode: readOption<VideoEditorMotionMode>(
      candidate.motionMode,
      motionModes,
      defaultVideoEditorConfig.motionMode,
    ),
    copyReviewEnabled: readBoolean(
      candidate.copyReviewEnabled,
      defaultVideoEditorConfig.copyReviewEnabled,
    ),
  };
}

export function normalizeBarberiaOSConfig(value: unknown): VideoEditorBarberiaOSConfig {
  const candidate = toRecord(value);
  const nested = toRecord(candidate.barberiaos);
  const barberiaos = {
    ...candidate,
    ...nested,
  };
  const barbershopName =
    normalizeBarberiaText(barberiaos.barbershopName, 80) ||
    defaultVideoEditorConfig.barberiaos.barbershopName;
  const qrCtaText =
    normalizeBarberiaText(barberiaos.qrCtaText, 80) ||
    defaultVideoEditorConfig.barberiaos.qrCtaText;

  return {
    bookingUrl: normalizeBookingUrl(barberiaos.bookingUrl),
    barbershopName,
    showQrOverlay: readBoolean(
      barberiaos.showQrOverlay,
      defaultVideoEditorConfig.barberiaos.showQrOverlay,
    ),
    qrCtaText,
    qrPosition: readOption<VideoEditorBarberiaOSQrPosition>(
      barberiaos.qrPosition,
      barberiaosQrPositions,
      defaultVideoEditorConfig.barberiaos.qrPosition,
    ),
  };
}

export function getOutputDimensions(format: VideoEditorOutputFormat) {
  const profile = getOutputFormatProfile(format);
  return { width: profile.width, height: profile.height };
}

export function getEncodingParams(quality: VideoEditorExportQuality) {
  const profile = getExportQualityProfile(quality);
  return {
    crf: String(profile.crf),
    preset: profile.preset,
    audioBitrate: profile.audioBitrate,
  };
}

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.replace(/\s+/g, " ").trim().slice(0, maxOverlayTextLength);

  return text || null;
}

function normalizeBookingUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const bookingUrl = value.trim().slice(0, 800);

  if (!bookingUrl) {
    return null;
  }

  try {
    const url = new URL(bookingUrl);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeBarberiaText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

  return text || null;
}

function readBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1" || value === "on") {
    return true;
  }

  if (value === "false" || value === "0" || value === "off") {
    return false;
  }

  return fallback;
}

function readOption<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
) {
  return options.includes(value as T) ? (value as T) : fallback;
}
