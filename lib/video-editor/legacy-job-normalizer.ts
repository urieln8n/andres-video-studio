import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import { validateJobId } from "@/lib/video-editor/safe-paths";
import { sanitizeFileName, sanitizeText } from "@/lib/video-editor/text-sanitize";
import type {
  VideoEditorJob,
  VideoEditorJobStatus,
  VideoEditorPipelineStepId,
} from "@/lib/video-editor/types";

const jobStatuses: VideoEditorJobStatus[] = [
  "uploaded",
  "processing",
  "awaiting_copy_review",
  "copy_approved",
  "rendering_final",
  "completed",
  "failed",
];

const pipelineSteps: VideoEditorPipelineStepId[] = [
  "uploaded",
  "starting",
  "preparing",
  "trim_silences",
  "extracting_audio",
  "transcribing",
  "detecting_fillers",
  "cleaning_fillers",
  "generating_subtitles",
  "reviewing_copy",
  "rendering_subtitles",
  "applying_hook_cta",
  "applying_motion",
  "exporting",
  "completed",
  "failed",
];

export function normalizeLegacyJob(value: unknown): VideoEditorJob | null {
  const candidate = toRecord(value);

  if (!validateJobId(candidate.id)) {
    return null;
  }

  const originalFileName = sanitizeFileName(
    readText(candidate.originalFileName) || "video.mp4",
    "video",
  );
  const storedFileName = readText(candidate.storedFileName);
  const status = readJobStatus(candidate.status);
  const createdAt = readDate(candidate.createdAt) || readDate(candidate.updatedAt);
  const updatedAt = readDate(candidate.updatedAt) || createdAt;

  if (!createdAt || !updatedAt) {
    return null;
  }

  return {
    ...(candidate as Partial<VideoEditorJob>),
    id: candidate.id,
    originalFileName,
    storedFileName: storedFileName
      ? sanitizeFileName(storedFileName, "video")
      : `${candidate.id}-${originalFileName}`,
    inputPath:
      readRelativeStoragePath(candidate.inputPath, "storage/input/") ||
      `storage/input/${candidate.id}-${originalFileName}`,
    outputPath: readOptionalRelativeStoragePath(
      candidate.outputPath,
      "storage/output/",
    ),
    config: candidate.config
      ? normalizeVideoEditorConfig(candidate.config)
      : undefined,
    status,
    progress: clampProgress(candidate.progress, status),
    currentStep: readCurrentStep(candidate.currentStep, status),
    currentStepLabel: readOptionalText(candidate.currentStepLabel, 120),
    logs: readLogs(candidate.logs),
    errorMessage: readOptionalText(candidate.errorMessage, 2_000),
    createdAt,
    updatedAt,
  } satisfies VideoEditorJob;
}

function readJobStatus(value: unknown): VideoEditorJobStatus {
  return jobStatuses.includes(value as VideoEditorJobStatus)
    ? (value as VideoEditorJobStatus)
    : "uploaded";
}

function readCurrentStep(value: unknown, status: VideoEditorJobStatus) {
  if (pipelineSteps.includes(value as VideoEditorPipelineStepId)) {
    return value as VideoEditorPipelineStepId;
  }

  return status === "completed" || status === "failed" ? status : "uploaded";
}

function readLogs(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => sanitizeText(item, 8_000))
    .filter(Boolean)
    .slice(-500);
}

function readOptionalRelativeStoragePath(value: unknown, prefix: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return readRelativeStoragePath(value, prefix);
}

function readRelativeStoragePath(value: unknown, prefix: string) {
  const text = readText(value).replace(/\\/g, "/");

  return text.startsWith(prefix) && !text.includes("../") ? text : null;
}

function readOptionalText(value: unknown, maxLength: number) {
  return sanitizeText(value, maxLength) || undefined;
}

function readText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readDate(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return null;
  }

  return value;
}

function clampProgress(value: unknown, status: VideoEditorJobStatus) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  return status === "completed" ? 100 : 0;
}

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}
