import { randomUUID } from "node:crypto";
import {
  open,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { VideoEditorJob } from "@/lib/video-editor/types";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import { getTemplateById } from "@/lib/video-editor/templates";
import { normalizeLegacyJob } from "@/lib/video-editor/legacy-job-normalizer";
import {
  isPathInsideRoot,
  validateJobId,
  videoEditorStorageRoot,
} from "@/lib/video-editor/safe-paths";
import { sanitizeFileName } from "@/lib/video-editor/text-sanitize";

export const VIDEO_EDITOR_ALLOWED_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
] as const;

export const VIDEO_EDITOR_MAX_FILE_SIZE = 250 * 1024 * 1024;

const storageRoot = videoEditorStorageRoot;
const inputRoot = path.join(storageRoot, "input");
const jobsRoot = path.join(storageRoot, "jobs");
const outputRoot = path.join(storageRoot, "output");
const tempRoot = path.join(storageRoot, "temp");
const transcriptsRoot = path.join(storageRoot, "transcripts");
const exportsRoot = path.join(storageRoot, "exports");
const staleProcessingLockMs = 6 * 60 * 60 * 1_000;

export function isAllowedVideoFileName(fileName: string) {
  return VIDEO_EDITOR_ALLOWED_EXTENSIONS.includes(
    path.extname(fileName).toLowerCase() as (typeof VIDEO_EDITOR_ALLOWED_EXTENSIONS)[number],
  );
}

export function sanitizeVideoFileName(fileName: string) {
  return sanitizeFileName(fileName, "video");
}

export async function ensureVideoEditorStorage() {
  await Promise.all([
    mkdir(inputRoot, { recursive: true }),
    mkdir(jobsRoot, { recursive: true }),
    mkdir(outputRoot, { recursive: true }),
    mkdir(tempRoot, { recursive: true }),
    mkdir(transcriptsRoot, { recursive: true }),
    mkdir(exportsRoot, { recursive: true }),
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

export function getOutputRootAbsolutePath() {
  return path.resolve(outputRoot);
}

export function getExportsRootAbsolutePath() {
  return path.resolve(exportsRoot);
}

export function getExportPackageDirAbsolutePath(jobId: string) {
  return path.join(exportsRoot, path.basename(jobId));
}

export function getExportPackageDirRelativePath(jobId: string) {
  return path.posix.join("storage", "exports", jobId);
}

export function getExportPackageZipAbsolutePath(jobId: string) {
  return path.join(
    getExportPackageDirAbsolutePath(jobId),
    `andres-video-studio-${jobId}.zip`,
  );
}

export function getExportPackageZipRelativePath(jobId: string) {
  return path.posix.join(
    getExportPackageDirRelativePath(jobId),
    `andres-video-studio-${jobId}.zip`,
  );
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

export function getCopyPackAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_copy_pack.json`);
}

export function getCopyPackRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_copy_pack.json`);
}

export function getPublishingPackAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_publishing_pack.json`);
}

export function getPublishingPackRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_publishing_pack.json`);
}

export function getQrAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_qr.svg`);
}

export function getQrRelativePath(jobId: string) {
  return path.posix.join("storage", "temp", `${jobId}_qr.svg`);
}

export function getQrOverlayTempAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}_qr_overlay.mp4`);
}

export function getProcessingLockAbsolutePath(jobId: string) {
  return path.join(tempRoot, `${jobId}.lock`);
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
    finalHookText: null,
    finalCtaText: null,
    generatedTitle: null,
    generatedDescription: null,
    generatedHashtags: [],
    copyPack: null,
    copyPackPath: null,
    finalCopy: null,
    publishingPackPath: null,
    publishingPackCreated: false,
    publishingTitle: null,
    publishingHashtags: [],
    publishingProvider: null,
    exportPackagePath: null,
    exportPackageCreated: false,
    exportPackageSizeBytes: null,
    exportPackageSizeLabel: null,
    qrPath: null,
    qrOverlayApplied: null,
    qrWarnings: [],
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
    currentStep: "uploaded",
    currentStepLabel: "Vídeo recibido",
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

export async function readJob(jobId: string): Promise<VideoEditorJob | null> {
  if (!isValidVideoEditorJobId(jobId)) {
    return null;
  }

  try {
    const jobJson = await readFile(getJobAbsolutePath(jobId), "utf8");
    return normalizeLegacyJob(JSON.parse(jobJson));
  } catch (error) {
    if (isFileMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function listJobs(): Promise<VideoEditorJob[]> {
  await ensureVideoEditorStorage();

  const entries = await readdir(jobsRoot, { withFileTypes: true });
  const jobs: Array<VideoEditorJob | null> = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".json") &&
          isValidVideoEditorJobId(path.basename(entry.name, ".json")),
      )
      .map(async (entry) => {
        try {
          const value = normalizeLegacyJob(JSON.parse(
            await readFile(path.join(jobsRoot, entry.name), "utf8"),
          ));

          return value && isValidVideoEditorJobId(value.id) ? value : null;
        } catch {
          return null;
        }
      }),
  );

  return jobs
    .filter((job): job is VideoEditorJob => job !== null)
    .sort((left, right) => getJobSortTime(right) - getJobSortTime(left));
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

export async function deleteJobArtifacts(jobId: string) {
  if (!isValidVideoEditorJobId(jobId)) {
    return null;
  }

  const job = await readJob(jobId);

  if (!job) {
    return null;
  }

  await ensureVideoEditorStorage();

  const deleted = await Promise.all([
    removeKnownFile(getOutputAbsolutePath(jobId), outputRoot),
    removeKnownFile(getSubtitledOutputAbsolutePath(jobId), outputRoot),
    removeJobOutputFile(job.outputPath, jobId),
    removeJobOutputFile(job.finalVideoPath, jobId),
    removePrefixedFiles(tempRoot, jobId),
    removePrefixedFiles(transcriptsRoot, jobId),
    removeExportPackageDirectory(jobId),
  ]);
  const jobRemoved = await removeKnownFile(getJobAbsolutePath(jobId), jobsRoot);

  return {
    job,
    deletedFiles: deleted.reduce((sum, count) => sum + count, jobRemoved),
  };
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

export async function acquireProcessingLock(jobId: string) {
  if (!isValidVideoEditorJobId(jobId)) {
    return false;
  }

  await ensureVideoEditorStorage();

  return createProcessingLock(jobId, true);
}

async function createProcessingLock(jobId: string, clearStaleLock: boolean) {
  try {
    const handle = await open(getProcessingLockAbsolutePath(jobId), "wx");
    await handle.writeFile(new Date().toISOString(), "utf8");
    await handle.close();
    return true;
  } catch (error) {
    if (isFileAlreadyExistsError(error)) {
      if (clearStaleLock && (await isProcessingLockStale(jobId))) {
        await removeKnownFile(getProcessingLockAbsolutePath(jobId), tempRoot);
        return createProcessingLock(jobId, false);
      }

      return false;
    }

    throw error;
  }
}

export async function releaseProcessingLock(jobId: string) {
  if (!isValidVideoEditorJobId(jobId)) {
    return;
  }

  await removeKnownFile(getProcessingLockAbsolutePath(jobId), tempRoot);
}

function getJobAbsolutePath(jobId: string) {
  return path.join(jobsRoot, `${jobId}.json`);
}

export function isValidVideoEditorJobId(value: string) {
  return validateJobId(value);
}

async function removePrefixedFiles(root: string, prefix: string): Promise<number> {
  const entries = await readdir(root, { withFileTypes: true });
  const removed = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.startsWith(prefix))
      .map((entry) => removeKnownFile(path.join(root, entry.name), root)),
  );

  return removed.reduce((sum, count) => sum + count, 0);
}

async function removeJobOutputFile(
  relativePath: string | null | undefined,
  jobId: string,
): Promise<number> {
  if (!relativePath) {
    return 0;
  }

  const normalized = relativePath.replace(/\\/g, "/");
  const fileName = path.posix.basename(normalized);

  if (
    path.isAbsolute(relativePath) ||
    !normalized.startsWith("storage/output/") ||
    normalized.includes("../") ||
    !fileName.startsWith(jobId)
  ) {
    return 0;
  }

  return removeKnownFile(path.join(outputRoot, fileName), outputRoot);
}

async function removeKnownFile(filePath: string, root: string): Promise<number> {
  const absoluteRoot = path.resolve(root);
  const absolutePath = path.resolve(filePath);

  if (!isInsideRoot(absoluteRoot, absolutePath)) {
    return 0;
  }

  await rm(absolutePath, { force: true });
  return 1;
}

async function removeExportPackageDirectory(jobId: string): Promise<number> {
  const exportDir = getExportPackageDirAbsolutePath(jobId);
  const absoluteExportsRoot = path.resolve(exportsRoot);
  const absoluteExportDir = path.resolve(exportDir);

  if (!isInsideRoot(absoluteExportsRoot, absoluteExportDir)) {
    return 0;
  }

  try {
    const entries = await readdir(absoluteExportDir, { withFileTypes: true });

    await rm(absoluteExportDir, { force: true, recursive: true });
    return entries.filter((entry) => entry.isFile()).length;
  } catch (error) {
    if (isFileMissingError(error)) {
      return 0;
    }

    throw error;
  }
}

function isInsideRoot(root: string, candidate: string) {
  return isPathInsideRoot(root, candidate);
}

async function isProcessingLockStale(jobId: string) {
  try {
    const lockStat = await stat(getProcessingLockAbsolutePath(jobId));

    return Date.now() - lockStat.mtimeMs > staleProcessingLockMs;
  } catch (error) {
    return isFileMissingError(error);
  }
}

function getJobSortTime(job: VideoEditorJob) {
  return Date.parse(job.updatedAt || job.createdAt) || 0;
}

function isFileMissingError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function isFileAlreadyExistsError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "EEXIST"
  );
}
