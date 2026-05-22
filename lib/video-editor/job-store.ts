import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { VideoEditorJob } from "@/lib/video-editor/types";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import { getTemplateById } from "@/lib/video-editor/templates";

export const VIDEO_EDITOR_ALLOWED_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
] as const;

export const VIDEO_EDITOR_MAX_FILE_SIZE = 250 * 1024 * 1024;

const storageRoot = path.join(process.cwd(), "storage");
const inputRoot = path.join(storageRoot, "input");
const jobsRoot = path.join(storageRoot, "jobs");
const outputRoot = path.join(storageRoot, "output");
const tempRoot = path.join(storageRoot, "temp");
const transcriptsRoot = path.join(storageRoot, "transcripts");

export function isAllowedVideoFileName(fileName: string) {
  return VIDEO_EDITOR_ALLOWED_EXTENSIONS.includes(
    path.extname(fileName).toLowerCase() as (typeof VIDEO_EDITOR_ALLOWED_EXTENSIONS)[number],
  );
}

export function sanitizeVideoFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path
    .basename(fileName, path.extname(fileName))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return `${baseName || "video"}${extension}`;
}

export async function ensureVideoEditorStorage() {
  await Promise.all([
    mkdir(inputRoot, { recursive: true }),
    mkdir(jobsRoot, { recursive: true }),
    mkdir(outputRoot, { recursive: true }),
    mkdir(tempRoot, { recursive: true }),
    mkdir(transcriptsRoot, { recursive: true }),
  ]);
}

export function createStoredFileName(jobId: string, fileName: string) {
  return `${jobId}-${sanitizeVideoFileName(fileName)}`;
}

export function getInputAbsolutePath(storedFileName: string) {
  return path.join(inputRoot, path.basename(storedFileName));
}

export function getOutputAbsolutePath(jobId: string) {
  return path.join(outputRoot, `${jobId}_final.mp4`);
}

export function getOutputRelativePath(jobId: string) {
  return path.posix.join("storage", "output", `${jobId}_final.mp4`);
}

export function getSubtitledOutputAbsolutePath(jobId: string) {
  return path.join(outputRoot, `${jobId}_subtitled.mp4`);
}

export function getSubtitledOutputRelativePath(jobId: string) {
  return path.posix.join("storage", "output", `${jobId}_subtitled.mp4`);
}

export function getOutputAbsolutePathFromRelative(outputPath: string) {
  return path.join(outputRoot, path.basename(outputPath));
}

export function getSubtitleAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}.ass`);
}

export function getSubtitleRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}.ass`);
}

export function getCommercialOverlayAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_commercial_overlay.ffgraph`);
}

export function getCommercialOverlayRelativePath(jobId: string) {
  return path.posix.join(
    "storage",
    "temp",
    `${jobId}_commercial_overlay.ffgraph`,
  );
}

export function getMotionHookOverlayAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_hook_overlay.webm`);
}

export function getMotionHookOverlayRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_hook_overlay.webm`);
}

export function getMotionCtaOverlayAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_cta_overlay.webm`);
}

export function getMotionCtaOverlayRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_cta_overlay.webm`);
}

export function getVerticalTempAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_vertical.mp4`);
}

export function getCleanTempAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_clean.mp4`);
}

export function getCleanTempRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_clean.mp4`);
}

export function getFillerCleanTempAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_clean_fillers.mp4`);
}

export function getFillerCleanTempRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_clean_fillers.mp4`);
}

export function getEditPlanAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_edit_plan.json`);
}

export function getEditPlanRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_edit_plan.json`);
}

export function getFillerPlanAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_filler_plan.json`);
}

export function getFillerPlanRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_filler_plan.json`);
}

export function getAudioTempAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}.wav`);
}

export function getTranscriptAbsolutePath(jobId: string) {
  return path.join(transcriptsRoot, `${jobId}.json`);
}

export function getTranscriptRelativePath(jobId: string) {
  return path.posix.join("storage", "transcripts", `${jobId}.json`);
}

export function getFinalTranscriptAbsolutePath(jobId: string) {
  return path.join(transcriptsRoot, `${jobId}_final.json`);
}

export function getFinalTranscriptRelativePath(jobId: string) {
  return path.posix.join("storage", "transcripts", `${jobId}_final.json`);
}

export function createUploadedJob(fileName: string, configValue?: unknown) {
  const id = randomUUID();
  const originalFileName = sanitizeVideoFileName(fileName);
  const storedFileName = createStoredFileName(id, originalFileName);
  const config = normalizeVideoEditorConfig(configValue);
  const template = getTemplateById(config.templateId);
  const now = new Date().toISOString();

  return {
    id,
    originalFileName,
    storedFileName,
    inputPath: path.posix.join("storage", "input", storedFileName),
    outputPath: null,
    subtitlesPath: null,
    transcriptPath: null,
    language: null,
    transcriptionText: null,
    cleanVideoPath: null,
    editPlanPath: null,
    fillerPlanPath: null,
    fillersCount: null,
    fillerRemovedSeconds: null,
    fillerCleanVideoPath: null,
    finalTranscriptPath: null,
    templateId: config.templateId,
    hookText: config.hookText ?? template.hook,
    ctaText: config.ctaText ?? template.cta,
    config,
    overlayPath: null,
    finalVideoPath: null,
    motionEngine: null,
    hookOverlayPath: null,
    ctaOverlayPath: null,
    motionWarnings: [],
    originalDuration: null,
    finalEstimatedDuration: null,
    removedSeconds: null,
    detectedSilencesCount: null,
    status: "uploaded",
    progress: 0,
    currentStep: "Vídeo recibido en storage/input",
    logs: ["Archivo guardado en storage/input.", "Job creado."],
    createdAt: now,
    updatedAt: now,
  } satisfies VideoEditorJob;
}

export async function writeJob(job: VideoEditorJob) {
  await ensureVideoEditorStorage();
  await writeFile(getJobAbsolutePath(job.id), JSON.stringify(job, null, 2), "utf8");

  return job;
}

export async function readJob(jobId: string) {
  if (!isUuid(jobId)) {
    return null;
  }

  try {
    const jobJson = await readFile(getJobAbsolutePath(jobId), "utf8");
    return JSON.parse(jobJson) as VideoEditorJob;
  } catch (error) {
    if (isFileMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function updateJob(
  jobId: string,
  updater: (job: VideoEditorJob) => VideoEditorJob,
) {
  const job = await readJob(jobId);

  if (!job) {
    return null;
  }

  const nextJob = updater(job);

  await writeJob(nextJob);
  return nextJob;
}

export async function fileHasContent(filePath: string) {
  try {
    const fileStat = await stat(filePath);

    return fileStat.isFile() && fileStat.size > 0;
  } catch (error) {
    if (isFileMissingError(error)) {
      return false;
    }

    throw error;
  }
}

function getJobAbsolutePath(jobId: string) {
  return path.join(jobsRoot, `${jobId}.json`);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isFileMissingError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
