import { spawn } from "node:child_process";
import { copyFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getAudioTempAbsolutePath,
  getCleanTempAbsolutePath,
  getCleanTempRelativePath,
  getFillerCleanTempAbsolutePath,
  getFillerCleanTempRelativePath,
  getInputAbsolutePath,
  getOutputAbsolutePath,
  getOutputRelativePath,
  getSubtitledOutputAbsolutePath,
  getVerticalTempAbsolutePath,
  readJob,
  updateJob,
} from "@/lib/video-editor/job-store";
import { selectCommercialTemplate } from "@/lib/video-editor/commercial-template-engine";
import { prepareCopyPack } from "@/lib/video-editor/copy-review";
import {
  getEncodingParams,
  getOutputDimensions,
  normalizeVideoEditorConfig,
} from "@/lib/video-editor/config";
import {
  formatFileSize,
  getExportQualityProfile,
  getOutputFormatProfile,
} from "@/lib/video-editor/export-profiles";
import {
  createEditPlan,
  createKeepRangesForCuts,
  writeEditPlan,
} from "@/lib/video-editor/edit-plan";
import {
  createFillerPlan,
  writeFillerPlan,
} from "@/lib/video-editor/filler-detector";
import { prepareMotionOverlays } from "@/lib/video-editor/motion-engine";
import {
  composeMotionOverlayVideos,
  renderCommercialOverlays,
} from "@/lib/video-editor/overlay-engine";
import {
  detectVideoSilences,
  readVideoDuration,
} from "@/lib/video-editor/silence-detector";
import { createPremiumAssSubtitles } from "@/lib/video-editor/subtitle-engine";
import { transcribeAudioWithWhisper } from "@/lib/video-editor/transcription-engine";
import {
  appendJobLog as appendProgressLog,
  markJobCompleted,
  markJobFailed,
  setJobProgress,
  updateJobMetrics,
} from "@/lib/video-editor/progress";
import type {
  VideoEditorExportQuality,
  VideoEditorJob,
  VideoEditorKeepRange,
  VideoEditorOutputFormat,
  VideoEditorTranscript,
} from "@/lib/video-editor/types";

const ffmpegCommand = "ffmpeg";
const maxErrorOutputLength = 8_000;
const activeProcesses = new Map<string, Promise<VideoEditorJob | null>>();
export type VideoEditorProcessMode = "full" | "prepare_copy";

export function processVideoEditorJob(
  jobId: string,
  mode: VideoEditorProcessMode = "full",
) {
  const activeProcess = activeProcesses.get(jobId);

  if (activeProcess) {
    return activeProcess;
  }

  const nextProcess = runVideoEditorJob(jobId, mode).finally(() => {
    activeProcesses.delete(jobId);
  });

  activeProcesses.set(jobId, nextProcess);
  return nextProcess;
}

async function runVideoEditorJob(jobId: string, mode: VideoEditorProcessMode) {
  const job = await readJob(jobId);

  if (!job) {
    return null;
  }

  const inputAbsolutePath = getInputAbsolutePath(job.storedFileName);
  const audioAbsolutePath = getAudioTempAbsolutePath(job.id);
  const cleanAbsolutePath = getCleanTempAbsolutePath(job.id);
  const fillerCleanAbsolutePath = getFillerCleanTempAbsolutePath(job.id);
  const verticalAbsolutePath = getVerticalTempAbsolutePath(job.id);
  const subtitledAbsolutePath = getSubtitledOutputAbsolutePath(job.id);
  const outputAbsolutePath = getOutputAbsolutePath(job.id);
  const config = normalizeVideoEditorConfig(
    job.config ?? {
      templateId: job.templateId,
      hookText: job.hookText,
      ctaText: job.ctaText,
    },
  );

  await ensureVideoEditorStorage();

  if (
    job.status === "completed" &&
    job.subtitlesPath &&
    job.transcriptPath &&
    job.editPlanPath &&
    job.finalVideoPath &&
    job.motionEngine &&
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
          fillerPlanPath: null,
          fillersCount: null,
          fillerRemovedSeconds: null,
          fillerCleanVideoPath: null,
          finalTranscriptPath: null,
          templateId: currentJob.templateId,
          hookText: currentJob.hookText,
          ctaText: currentJob.ctaText,
          overlayPath: null,
          finalVideoPath: null,
          motionEngine: null,
          hookOverlayPath: null,
          ctaOverlayPath: null,
          motionWarnings: [],
          cleanVideoPath: null,
          originalDuration: null,
          finalEstimatedDuration: null,
          removedSeconds: null,
          detectedSilencesCount: null,
          transcriptPath: null,
          language: null,
          transcriptionText: null,
          transcriptSegments: undefined,
          config,
          status: "processing",
          progress: 10,
          currentStep: "preparing",
          currentStepLabel: "Preparación",
          errorMessage: undefined,
        },
        "Validando FFmpeg y vídeo de entrada.",
      ),
    );

    await assertFfmpegAvailable();

    if (!(await fileHasContent(inputAbsolutePath))) {
      throw new Error("No se encontró el vídeo original");
    }

    await setJobProgress(job.id, 20, "trim_silences");
    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 20,
          currentStep: "trim_silences",
          currentStepLabel: "Recorte de silencios",
        },
        config.trimSilences
          ? "Detectando silencios con FFmpeg"
          : "Recorte de silencios desactivado por configuración",
      ),
    );

    const silenceDetection = config.trimSilences
      ? await detectVideoSilences(inputAbsolutePath)
      : { duration: await readVideoDuration(inputAbsolutePath), silences: [] };

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 26,
          detectedSilencesCount: silenceDetection.silences.length,
          originalDuration: silenceDetection.duration,
          currentStep: "trim_silences",
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
    await updateJobMetrics(job.id, {
      originalDuration: editPlan.originalDuration,
      finalEstimatedDuration: editPlan.finalEstimatedDuration,
      removedSeconds: editPlan.removedSeconds,
      detectedSilencesCount: editPlan.silences.length,
    });

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
          progress: 20,
          currentStep: "trim_silences",
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
          progress: 30,
          currentStep: "extracting_audio",
          currentStepLabel: "Extracción de audio",
        },
        editPlan.warning
          ? `${editPlan.warning} Vídeo limpio generado`
          : "Vídeo limpio generado",
      ),
    );

    await appendProgressLog(job.id, "Extrayendo audio del vídeo");

    await extractAudioWav(cleanSourceAbsolutePath, audioAbsolutePath);

    if (!(await fileHasContent(audioAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el audio WAV para Whisper.");
    }

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 45,
          currentStep: "transcribing",
          currentStepLabel: "Transcripción",
        },
        "Audio WAV generado",
      ),
    );

    await appendProgressLog(job.id, "Transcribiendo vídeo limpio");
    await appendProgressLog(job.id, "Iniciando transcripción con Whisper");

    const cleanTranscript = await tryTranscription(job.id, audioAbsolutePath);

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 55,
          currentStep: "detecting_fillers",
          currentStepLabel: "Detección de muletillas",
        },
        "Analizando muletillas con timestamps de palabra",
      ),
    );

    const fillerPlan = config.removeFillers
      ? createFillerPlan({
          jobId: job.id,
          inputPath: editPlan.cleanPath,
          outputPath: getFillerCleanTempRelativePath(job.id),
          transcript: cleanTranscript,
        })
      : null;

    let fillerPlanPath: string | null = null;
    let fillerSourceAbsolutePath = cleanSourceAbsolutePath;

    if (fillerPlan) {
      await updateJob(job.id, (currentJob) =>
        appendJobLog(currentJob, "Fillers detectados"),
      );
      await updateJob(job.id, (currentJob) =>
        appendJobLog(currentJob, "Generando plan de limpieza de fillers"),
      );

      const fillerPlanFile = await writeFillerPlan(fillerPlan);
      fillerPlanPath = fillerPlanFile.relativePath;
      fillerSourceAbsolutePath =
        fillerPlan.mode === "cut"
          ? await createFillerCleanVideo({
              inputAbsolutePath: cleanSourceAbsolutePath,
              outputAbsolutePath: fillerCleanAbsolutePath,
              duration: editPlan.finalEstimatedDuration,
              keepRanges: createKeepRangesForCuts(
                editPlan.finalEstimatedDuration,
                fillerPlan.cutRanges,
              ),
              jobId: job.id,
            })
          : cleanSourceAbsolutePath;
    } else {
      await updateJob(job.id, (currentJob) =>
        appendJobLog(
          currentJob,
          "Limpieza de fillers desactivada por configuración",
        ),
      );
    }

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          fillerPlanPath,
          fillersCount: fillerPlan?.fillersCount ?? 0,
          fillerRemovedSeconds: fillerPlan?.removedSeconds ?? 0,
          fillerCleanVideoPath:
            fillerPlan?.mode === "cut"
              ? fillerPlan.outputPath
              : editPlan.cleanPath,
          progress: 55,
          currentStep: "cleaning_fillers",
          currentStepLabel: "Limpieza de muletillas",
        },
        fillerPlan?.warnings.length
          ? `Vídeo limpio de fillers generado. ${fillerPlan.warnings.join(" ")}`
          : "Vídeo limpio de fillers generado",
      ),
    );
    await updateJobMetrics(job.id, {
      fillersCount: fillerPlan?.fillersCount ?? 0,
      fillerRemovedSeconds: fillerPlan?.removedSeconds ?? 0,
    });

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 68,
          currentStep: "generating_subtitles",
          currentStepLabel: "Subtítulos",
        },
        "Re-transcribiendo vídeo final limpio",
      ),
    );

    await extractAudioWav(fillerSourceAbsolutePath, audioAbsolutePath);
    await tryTranscription(job.id, audioAbsolutePath, "final");

    if (mode === "prepare_copy") {
      const preparedJob = await readJob(job.id);

      if (!preparedJob) {
        throw new Error("El job desapareció antes de preparar el copy.");
      }

      await prepareCopyPack(preparedJob);

      return await updateJob(job.id, (currentJob) =>
        appendJobLog(
          {
            ...currentJob,
            status: "awaiting_copy_review",
            progress: 68,
            currentStep: "reviewing_copy",
            currentStepLabel: "Copy listo para revisar",
            errorMessage: undefined,
          },
          "Copy pack preparado. Esperando revisión antes del render final.",
        ),
      );
    }

    const formatProfile = getOutputFormatProfile(config.outputFormat);
    const qualityProfile = getExportQualityProfile(config.exportQuality);

    await appendProgressLog(
      job.id,
      `Aplicando perfil de exportación ${formatProfile.label}`,
    );
    await appendProgressLog(
      job.id,
      `Calidad ${qualityProfile.label.toLowerCase()} seleccionada`,
    );
    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 68,
          currentStep: "generating_subtitles",
        },
        `Renderizando a ${formatProfile.width}x${formatProfile.height}`,
      ),
    );
    await appendProgressLog(
      job.id,
      `CRF ${qualityProfile.crf}, preset ${qualityProfile.preset}`,
    );

    await updateJobMetrics(job.id, {
      outputWidth: formatProfile.width,
      outputHeight: formatProfile.height,
      outputCrf: qualityProfile.crf,
      outputPreset: qualityProfile.preset,
      outputAudioBitrate: qualityProfile.audioBitrate,
    });

    await renderFormattedVideo(
      fillerSourceAbsolutePath,
      verticalAbsolutePath,
      config.outputFormat,
      config.exportQuality,
    );

    if (!(await fileHasContent(verticalAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el vídeo vertical intermedio.");
    }

    const generatingSubtitlesJob = await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 68,
          currentStep: "generating_subtitles",
        },
        "Generando subtítulos finales sincronizados",
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
          progress: 68,
          subtitlesPath: subtitles.subtitleRelativePath,
        },
        "Archivo ASS creado",
      ),
    );

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 78,
          currentStep: "rendering_subtitles",
          currentStepLabel: "Render de subtítulos",
        },
        "Quemando subtítulos del vídeo limpio",
      ),
    );

    await renderSubtitledVideo(
      verticalAbsolutePath,
      subtitles.subtitleAbsolutePath,
      subtitledAbsolutePath,
      config.exportQuality,
    );

    if (!(await fileHasContent(subtitledAbsolutePath))) {
      throw new Error("FFmpeg terminó sin crear el vídeo final subtitulado.");
    }

    const commercialJob = await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 86,
          currentStep: "applying_hook_cta",
          currentStepLabel: "Hook y CTA",
        },
        "Seleccionando plantilla comercial",
      ),
    );

    if (!commercialJob) {
      throw new Error("El job desapareció antes del render comercial.");
    }

    const commercialTemplate = selectCommercialTemplate(commercialJob);

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          templateId: commercialTemplate.id,
          hookText: commercialTemplate.hook,
          ctaText: commercialTemplate.cta,
        },
        "Hook generado",
      ),
    );
    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "CTA generado"),
    );
    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 86,
          currentStep: "applying_hook_cta",
        },
        "Aplicando overlay inicial",
      ),
    );
    await updateJob(job.id, (currentJob) =>
      appendJobLog(currentJob, "Aplicando CTA final"),
    );

    const commercialDuration = Math.max(
      0,
      editPlan.finalEstimatedDuration - (fillerPlan?.removedSeconds ?? 0),
    );
    let overlayPath: string | null = null;
    let motionEngine: VideoEditorJob["motionEngine"] = "fallback";
    let hookOverlayPath: string | null = null;
    let ctaOverlayPath: string | null = null;
    const motionWarnings: string[] = [];

    await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: 92,
          currentStep: "applying_motion",
          currentStepLabel: "Motion graphics",
        },
        "Preparando motion graphics premium",
      ),
    );

    const useMotionAuto =
      config.motionEnabled &&
      config.motionMode === "auto" &&
      config.outputFormat === "vertical_9_16";
    const motion = useMotionAuto
      ? await prepareMotionOverlays(
          commercialJob,
          commercialTemplate,
          async (message) => {
            await updateJob(job.id, (currentJob) =>
              appendJobLog(currentJob, message),
            );
          },
        )
      : {
          engine: "fallback" as const,
          hook: null,
          cta: null,
          warnings: [
            config.motionEnabled
              ? "Motion premium omitido por configuración; usando fallback FFmpeg."
              : "Motion graphics desactivado por configuración",
          ],
        };

    motionWarnings.push(...motion.warnings);

    try {
      if (motion.engine === "hyperframes" && motion.hook && motion.cta) {
        await updateJob(job.id, (currentJob) =>
          appendJobLog(
            {
              ...currentJob,
              currentStep: "applying_motion",
            },
            "Componiendo overlays con FFmpeg",
          ),
        );
        await composeMotionOverlayVideos({
          inputAbsolutePath: subtitledAbsolutePath,
          hookOverlayAbsolutePath: motion.hook.absolutePath,
          ctaOverlayAbsolutePath: motion.cta.absolutePath,
          outputAbsolutePath,
          duration: commercialDuration,
          exportQuality: config.exportQuality,
        });

        motionEngine = "hyperframes";
        hookOverlayPath = motion.hook.relativePath;
        ctaOverlayPath = motion.cta.relativePath;
      } else {
        await updateJob(job.id, (currentJob) =>
          appendJobLog(
            currentJob,
            "HyperFrames no disponible, usando fallback seguro",
          ),
        );
        const overlay = await renderCommercialOverlays({
          jobId: job.id,
          inputAbsolutePath: subtitledAbsolutePath,
          outputAbsolutePath,
          duration: commercialDuration,
          template: commercialTemplate,
          exportQuality: config.exportQuality,
          outputFormat: config.outputFormat,
        });

        overlayPath = overlay.overlayRelativePath;
      }
    } catch (error) {
      const warning =
        error instanceof Error
          ? `Motion overlay falló; usando fallback FFmpeg. ${error.message}`
          : "Motion overlay falló; usando fallback FFmpeg.";

      motionWarnings.push(warning);
      await updateJob(job.id, (currentJob) =>
        appendJobLog(currentJob, `Warning: ${warning}`),
      );

      try {
        const overlay = await renderCommercialOverlays({
          jobId: job.id,
          inputAbsolutePath: subtitledAbsolutePath,
          outputAbsolutePath,
          duration: commercialDuration,
          template: commercialTemplate,
          exportQuality: config.exportQuality,
          outputFormat: config.outputFormat,
        });

        overlayPath = overlay.overlayRelativePath;
        motionEngine = "fallback";
        hookOverlayPath = null;
        ctaOverlayPath = null;
      } catch (fallbackError) {
        const fallbackWarning =
          fallbackError instanceof Error
            ? fallbackError.message
            : "FFmpeg no pudo aplicar el overlay comercial.";

        motionWarnings.push(fallbackWarning);
        await copyFile(subtitledAbsolutePath, outputAbsolutePath);
        await updateJob(job.id, (currentJob) =>
          appendJobLog(
            currentJob,
            `Warning: overlay comercial omitido. ${fallbackWarning}`,
          ),
        );
      }
    }

    if (!(await fileHasContent(outputAbsolutePath))) {
      throw new Error("El render terminó pero no se encontró el archivo final");
    }

    await setJobProgress(job.id, 97, "exporting");

    let finalFileSizeBytes: number | null = null;
    try {
      const outputStat = await stat(outputAbsolutePath);
      finalFileSizeBytes = outputStat.size;
    } catch {
      // File size is best-effort
    }

    const fileSizeLabel = finalFileSizeBytes
      ? formatFileSize(finalFileSizeBytes)
      : null;

    await updateJobMetrics(job.id, {
      finalFileSizeBytes,
      finalFileSizeLabel: fileSizeLabel,
    });

    const exportedJob = await updateJob(job.id, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          outputPath: getOutputRelativePath(currentJob.id),
          finalVideoPath: getOutputRelativePath(currentJob.id),
          overlayPath,
          motionEngine,
          hookOverlayPath,
          ctaOverlayPath,
          motionWarnings,
          progress: 97,
          currentStep: "exporting",
          currentStepLabel: "Exportación",
          errorMessage: undefined,
        },
        "Motion graphics completados",
      ),
    );
    await appendProgressLog(job.id, "Archivo final generado");
    if (fileSizeLabel) {
      await appendProgressLog(job.id, `Tamaño final: ${fileSizeLabel}`);
    }
    await appendProgressLog(job.id, "Render final completado");
    return (await markJobCompleted(job.id)) ?? exportedJob;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido al ejecutar FFmpeg.";

    await markJobFailed(job.id, errorMessage);

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

async function renderFormattedVideo(
  inputPath: string,
  outputPath: string,
  outputFormat: VideoEditorOutputFormat,
  exportQuality: VideoEditorExportQuality,
) {
  const { width, height } = getOutputDimensions(outputFormat);
  const { crf, preset, audioBitrate } = getEncodingParams(exportQuality);

  // Scale to cover the target canvas, then center-crop to exact resolution.
  // This avoids letterboxing while never stretching/distorting the image.
  const vf = [
    `scale=${width}:${height}:force_original_aspect_ratio=increase`,
    `crop=${width}:${height}`,
    `setsar=1`,
  ].join(",");

  await runProcess(ffmpegCommand, [
    "-y",
    "-i",
    inputPath,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    preset,
    "-crf",
    crf,
    "-c:a",
    "aac",
    "-b:a",
    audioBitrate,
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

async function createFillerCleanVideo({
  inputAbsolutePath,
  outputAbsolutePath,
  duration,
  keepRanges,
  jobId,
}: {
  inputAbsolutePath: string;
  outputAbsolutePath: string;
  duration: number;
  keepRanges: VideoEditorKeepRange[];
  jobId: string;
}) {
  if (keepRanges.length === 0 || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("El plan de fillers no conserva ningún tramo válido.");
  }

  await updateJob(jobId, (currentJob) =>
    appendJobLog(currentJob, "Recortando muletillas seguras"),
  );
  await trimKeepRanges(inputAbsolutePath, outputAbsolutePath, keepRanges);

  if (!(await fileHasContent(outputAbsolutePath))) {
    throw new Error("FFmpeg terminó sin crear el vídeo limpio de fillers.");
  }

  return outputAbsolutePath;
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
  exportQuality: VideoEditorExportQuality,
) {
  const { crf, preset, audioBitrate } = getEncodingParams(exportQuality);

  await runProcess(ffmpegCommand, [
    "-y",
    "-i",
    inputPath,
    "-vf",
    createSubtitleFilter(subtitlePath),
    "-c:v",
    "libx264",
    "-preset",
    preset,
    "-crf",
    crf,
    "-c:a",
    "aac",
    "-b:a",
    audioBitrate,
    "-movflags",
    "+faststart",
    outputPath,
  ]);
}

async function tryTranscription(
  jobId: string,
  audioAbsolutePath: string,
  target: "analysis" | "final" = "analysis",
): Promise<VideoEditorTranscript | null> {
  try {
    const result = await transcribeAudioWithWhisper(jobId, audioAbsolutePath, target);

    await updateJob(jobId, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          transcriptPath:
            target === "analysis"
              ? result.transcriptRelativePath
              : currentJob.transcriptPath,
          finalTranscriptPath:
            target === "final"
              ? result.transcriptRelativePath
              : currentJob.finalTranscriptPath,
          language: result.transcript.language,
          transcriptionText: result.transcript.text,
          transcriptSegments: result.transcript.segments,
          progress: target === "final" ? 68 : 45,
          currentStep:
            target === "final" ? "generating_subtitles" : "transcribing",
        },
        target === "final"
          ? "Transcripción final completada"
          : "Transcripción completada",
      ),
    );

    return result.transcript;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudo ejecutar faster-whisper.";

    await updateJob(jobId, (currentJob) =>
      appendJobLog(
        {
          ...currentJob,
          progress: target === "final" ? 68 : 45,
          currentStep:
            target === "final" ? "generating_subtitles" : "transcribing",
        },
        `Error transcribiendo audio con Whisper. Transcripción no disponible. Usando subtítulos mock. ${errorMessage}`,
      ),
    );

    return null;
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
