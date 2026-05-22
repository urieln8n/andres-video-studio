import { defaultTemplateId, isValidTemplateId } from "@/lib/video-editor/templates";
import type {
  VideoEditorConfig,
  VideoEditorMotionMode,
  VideoEditorOutputFormat,
  VideoEditorSubtitleStyle,
  VideoEditorTextMode,
} from "@/lib/video-editor/types";

const outputFormats = [
  "vertical_9_16",
  "square_1_1",
  "horizontal_16_9",
] as const;
const subtitleStyles = ["premium", "viral", "minimal"] as const;
const textModes = ["auto", "custom"] as const;
const motionModes = ["auto", "fallback"] as const;
const maxOverlayTextLength = 180;

export const defaultVideoEditorConfig: VideoEditorConfig = {
  templateId: defaultTemplateId,
  outputFormat: "vertical_9_16",
  subtitleStyle: "premium",
  hookMode: "auto",
  hookText: null,
  ctaMode: "auto",
  ctaText: null,
  trimSilences: true,
  removeFillers: true,
  motionEnabled: true,
  motionMode: "auto",
};

export function isValidOutputFormat(
  value: unknown,
): value is VideoEditorOutputFormat {
  return outputFormats.includes(value as VideoEditorOutputFormat);
}

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
    templateId: isValidTemplateId(candidate.templateId)
      ? candidate.templateId
      : defaultVideoEditorConfig.templateId,
    outputFormat: isValidOutputFormat(candidate.outputFormat)
      ? candidate.outputFormat
      : defaultVideoEditorConfig.outputFormat,
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
  };
}

export function getOutputDimensions(format: VideoEditorOutputFormat) {
  switch (format) {
    case "square_1_1":
      return { width: 1080, height: 1080 };
    case "horizontal_16_9":
      return { width: 1920, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
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
