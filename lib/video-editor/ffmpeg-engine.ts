import { spawn } from "node:child_process";
import path from "node:path";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getAudioTempAbsolutePath,
  getCleanTempAbsolutePath,
  getCleanTempRelativePath,
  getInputAbsolutePath,
  getOutputAbsolutePath,
  getOutputRelativePath,
  getVerticalTempAbsolutePath,
  readJob,
  updateJob,
} from "@/lib/video-editor/job-store";
import { createEditPlan, writeEditPlan } from "@/lib/video-editor/edit-plan";
import { detectVideoSilences } from "@/lib/video-editor/silence-detector";
import { createPremiumAssSubtitles } from "@/lib/video-editor/subtitle-engine";
import { transcribeAudioWithWhisper } from "@/lib/video-editor/transcription-engine";
import type {
  VideoEditorJob,
  VideoEditorKeepRange,
} from "@/lib/video-editor/types";

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
  const audioAbsolutePath = getAudioTempAbsolutePath(job.id);
  const cleanAbsolutePath = getCleanTempAbsolutePath(job.id);
  const verticalAbsolutePath = getVerticalTempAbsolutePath(job.id);
  const outputAbsolutePath = getOutputAbsolutePath(job.id);

  await ensureVideoEditorStorage();

  if (
    job.status === "completed" &&
    job.subtitlesPath &&
    job.transcriptPath &&
    job.editPlanPath &&
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
          editPlanPath: null,
          cleanVideoPath: null,
          originalDuration: null,
          finalEstimatedDuration: null,
          removedSeconds: null,
          detectedSilencesCount: null,
          transcriptPath: null,
          language: null,
          transcriptionText: null,
          transcriptSegments: undefined,
          status: "processing",
          progress: 12,
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
      appendJobLog(
        {
          ...currentJob,
          progress: 18,
          currentStep: "Detectando silencios con FFmpeg",
        },
        "Detectando silencios con FFmpeg",
      ),
    );

    const silenceDetection = await detectVideoSilences(inputAbsolutePath);

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 26,
          detectedSilencesCount: silenceDetection.silences.length,
          originalDuration: silenceDetection.duration,
          currentStep: "Generando plan de edición",
        },
        "Silencios detectados",
      ),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "Generando plan de edición"),
    );

    const editPlan = createEditPlan({
      jobId: job.id,
      inputPath: job.inputPath,
      cleanPath: getCleanTempRelativePath(job.id),
      duration: silenceDetection.duration,
      silences: silenceDetection.silences,
    });
    const editPlanFile = await writeEditPlan(editPlan);

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          cleanVideoPath: editPlan.cleanPath,
          editPlanPath: editPlanFile.relativePath,
          originalDuration: editPlan.originalDuration,
          finalEstimatedDuration: editPlan.finalEstimatedDuration,
          removedSeconds: editPlan.removedSeconds,
          detectedSilencesCount: editPlan.silences.length,
          progress: 34,
          currentStep: "Recortando pausas largas",
        },
        "Recortando pausas largas",
      ),
    );

    const cleanSourceAbsolutePath = await createCleanVideo({
      inputAbsolutePath,
      cleanAbsolutePath,
      keepRanges: editPlan.keepRanges,
      trimApplied: editPlan.trimApplied,
    });

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 42,
          currentStep: "Transcribiendo vídeo limpio",
        },
        editPlan.warning
          ? `${editPlan.warning} Vídeo limpio generado`
          : "Vídeo limpio generado",
      ),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "Extrayendo audio del vídeo"),
    );

    await extractAudioWav(cleanSourceAbsolutePath, audioAbsolutePath);

    if (!(await fileHasContent(audioAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el audio WAV para Whisper.");
    }

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 50,
          currentStep: "Iniciando transcripción con Whisper",
        },
        "Audio WAV generado",
      ),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "Transcribiendo vídeo limpio"),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "Iniciando transcripción con Whisper"),
    );

    await tryTranscription(job.id, audioAbsolutePath);

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 66,
          currentStep: "Renderizando formato vertical 9:16",
        },
        "FFmpeg disponible. Iniciando render vertical 9:16.",
      ),
    );

    await renderVerticalVideo(cleanSourceAbsolutePath, verticalAbsolutePath);

    if (!(await fileHasContent(verticalAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el vídeo vertical intermedio.");
    }

    const generatingSubtitlesJob = await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 74,
          currentStep: "Generando subtítulos del vídeo limpio",
        },
        "Generando subtítulos del vídeo limpio",
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
          progress: 82,
          subtitlesPath: subtitles.subtitleRelativePath,
        },
        "Archivo ASS creado",
      ),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 90,
          currentStep: "Quemando subtítulos del vídeo limpio",
        },
        "Quemando subtítulos del vídeo limpio",
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
          outputPath: getOutputRelativePath(currentJob.id),
          status: "completed",
          progress: 100,
          currentStep: "Vídeo final con subtítulos generado",
          errorMessage: undefined,
        },
        "Render final completado",
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

async function createCleanVideo({
  inputAbsolutePath,
  cleanAbsolutePath,
  keepRanges,
  trimApplied,
}: {
  inputAbsolutePath: string;
  cleanAbsolutePath: string;
  keepRanges: VideoEditorKeepRange[];
  trimApplied: boolean;
}) {
  if (!trimApplied) {
    return inputAbsolutePath;
  }

  await trimKeepRanges(inputAbsolutePath, cleanAbsolutePath, keepRanges);

  if (!(await fileHasContent(cleanAbsolutePath))) {
    throw new Error("FFmpeg terminó sin crear el vídeo limpio.");
  }

  return cleanAbsolutePath;
}

async function trimKeepRanges(
  inputPath: string,
  outputPath: string,
  keepRanges: VideoEditorKeepRange[],
) {
  const filters = keepRanges.flatMap((range, index) => [
    `[0:v]trim=start=${range.start}:end=${range.end},setpts=PTS-STARTPTS[v${index}]`,
    `[0:a]atrim=start=${range.start}:end=${range.end},asetpts=PTS-STARTPTS[a${index}]`,
  ]);
  const concatInputs = keepRanges
    .map((_range, index) => `[v${index}][a${index}]`)
    .join("");
  const filterComplex = `${filters.join(";")};${concatInputs}concat=n=${keepRanges.length}:v=1:a=1[v][a]`;

  await runProcess(ffmpegCommand, [
    "-y",
    "-i",
    inputPath,
    "-filter_complex",
    filterComplex,
    "-map",
    "[v]",
    "-map",
    "[a]",
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

async function extractAudioWav(inputPath: string, outputPath: string) {
  await runProcess(ffmpegCommand, [
    "-y",
    "-i",
    inputPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "pcm_s16le",
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

async function tryTranscription(jobId: string, audioAbsolutePath: string) {
  try {
    const result = await transcribeAudioWithWhisper(jobId, audioAbsolutePath);

    await updateJob(jobId, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          transcriptPath: result.transcriptRelativePath,
          language: result.transcript.language,
          transcriptionText: result.transcript.text,
          transcriptSegments: result.transcript.segments,
          progress: 48,
          currentStep: "Transcripción completada",
        },
        "Transcripción completada",
      ),
    );

    return result.transcript.segments.length > 0;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudo ejecutar faster-whisper.";

    await updateJob(jobId, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 48,
          currentStep: "Transcripción no disponible; usando subtítulos mock",
        },
        `Transcripción no disponible. Usando subtítulos mock. ${errorMessage}`,
      ),
    );

    return false;
  }
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
