import { spawn } from "node:child_process";
import path from "node:path";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getInputAbsolutePath,
  getSubtitledOutputAbsolutePath,
  getSubtitledOutputRelativePath,
  getVerticalTempAbsolutePath,
  readJob,
  updateJob,
} from "@/lib/video-editor/job-store";
import { createPremiumAssSubtitles } from "@/lib/video-editor/subtitle-engine";
import type { VideoEditorJob } from "@/lib/video-editor/types";

const ffmpegCommand = "ffmpeg";
const maxErrorOutputLength = 8_000;
const activeProcesses = new Map<string, Promise<VideoEditorJob | null>>();

export function processVideoEditorJob(jobId: string) {
  const activeProcess = activeProcesses.get(jobId);

  if (activeProcess) {
    return activeProcess;
  }

  const nextProcess = runVideoEditorJob(jobId).finally(() => {
    activeProcesses.delete(jobId);
  });

  activeProcesses.set(jobId, nextProcess);
  return nextProcess;
}

async function runVideoEditorJob(jobId: string) {
  const job = await readJob(jobId);

  if (!job) {
    return null;
  }

  const inputAbsolutePath = getInputAbsolutePath(job.storedFileName);
  const verticalAbsolutePath = getVerticalTempAbsolutePath(job.id);
  const outputAbsolutePath = getSubtitledOutputAbsolutePath(job.id);

  await ensureVideoEditorStorage();

  if (
    job.status === "completed" &&
    job.subtitlesPath &&
    (await fileHasContent(outputAbsolutePath))
  ) {
    return job;
  }

  try {
    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          outputPath: null,
          subtitlesPath: null,
          status: "processing",
          progress: 40,
          currentStep: "Procesando vídeo con FFmpeg",
          errorMessage: undefined,
        },
        "Validando FFmpeg y vídeo de entrada.",
      ),
    );

    await assertFfmpegAvailable();

    if (!(await fileHasContent(inputAbsolutePath))) {
      throw new Error(`No existe el vídeo de entrada para el job ${job.id}.`);
    }

    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "FFmpeg disponible. Iniciando render vertical 9:16."),
    );

    await renderVerticalVideo(inputAbsolutePath, verticalAbsolutePath);

    if (!(await fileHasContent(verticalAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el vídeo vertical intermedio.");
    }

    const generatingSubtitlesJob = await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 68,
          currentStep: "Generando subtítulos premium",
        },
        "Generando subtítulos premium",
      ),
    );

    if (!generatingSubtitlesJob) {
      throw new Error("El job desapareció antes de crear los subtítulos.");
    }

    const subtitles = await createPremiumAssSubtitles(generatingSubtitlesJob);

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 78,
          subtitlesPath: subtitles.subtitleRelativePath,
        },
        "Archivo ASS creado",
      ),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 88,
          currentStep: "Quemando subtítulos en el vídeo",
        },
        "Quemando subtítulos en el vídeo",
      ),
    );

    await renderSubtitledVideo(
      verticalAbsolutePath,
      subtitles.subtitleAbsolutePath,
      outputAbsolutePath,
    );

    if (!(await fileHasContent(outputAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el vídeo final subtitulado.");
    }

    return await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          outputPath: getSubtitledOutputRelativePath(currentJob.id),
          status: "completed",
          progress: 100,
          currentStep: "Vídeo final con subtítulos generado",
          errorMessage: undefined,
        },
        "Render con subtítulos completado",
      ),
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido al ejecutar FFmpeg.";

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          status: "failed",
          currentStep: "Error al procesar vídeo",
          errorMessage,
        },
        `Error: ${errorMessage}`,
      ),
    );

    throw error;
  }
}

function appendJobLog(job: VideoEditorJob, message: string) {
  return {
    ...job,
    logs: [...job.logs, message],
    updatedAt: new Date().toISOString(),
  } satisfies VideoEditorJob;
}

async function assertFfmpegAvailable() {
  try {
    await runProcess(ffmpegCommand, ["-version"]);
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : "";

    throw new Error(`FFmpeg no está disponible en PATH.${detail}`);
  }
}

async function renderVerticalVideo(inputPath: string, outputPath: string) {
  await runProcess(ffmpegCommand, [
    "-y",
    "-i",
    inputPath,
    "-vf",
    "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function renderSubtitledVideo(
  inputPath: string,
  subtitlePath: string,
  outputPath: string,
) {
  await runProcess(ffmpegCommand, [
    "-y",
    "-i",
    inputPath,
    "-vf",
    createSubtitleFilter(subtitlePath),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

function createSubtitleFilter(subtitlePath: string) {
  // FFmpeg parses Windows drive colons inside filters, so normalize and escape
  // the absolute ASS path before passing it as a single spawn argument.
  const escapedSubtitlePath = path
    .resolve(subtitlePath)
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'");

  return `subtitles=filename='${escapedSubtitlePath}'`;
}

function runProcess(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, {
      shell: false,
      windowsHide: true,
    });
    let errorOutput = "";

    process.stderr.on("data", (chunk: Buffer | string) => {
      errorOutput = `${errorOutput}${chunk.toString()}`.slice(
        -maxErrorOutputLength,
      );
    });

    process.once("error", (error) => {
      reject(error);
    });

    process.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} terminó con código ${code ?? "desconocido"}. ${errorOutput.trim()}`.trim(),
        ),
      );
    });
  });
}
