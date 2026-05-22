import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getCommercialOverlayAbsolutePath,
  getCommercialOverlayRelativePath,
} from "@/lib/video-editor/job-store";
import type {
  VideoEditorCommercialTemplate,
  VideoEditorExportQuality,
} from "@/lib/video-editor/types";
import { getEncodingParams } from "@/lib/video-editor/config";

const ffmpegCommand = "ffmpeg";
const maxErrorOutputLength = 8_000;
const ctaSeconds = 3;

export async function renderCommercialOverlays({
  jobId,
  inputAbsolutePath,
  outputAbsolutePath,
  duration,
  template,
  exportQuality = "standard",
  outputFormat = "vertical_9_16",
}: {
  jobId: string;
  inputAbsolutePath: string;
  outputAbsolutePath: string;
  duration: number;
  template: VideoEditorCommercialTemplate;
  exportQuality?: VideoEditorExportQuality;
  outputFormat?: import("@/lib/video-editor/types").VideoEditorOutputFormat;
}) {
  if (!(await fileHasContent(inputAbsolutePath))) {
    throw new Error("No existe el vídeo subtitulado para aplicar overlays.");
  }

  await ensureVideoEditorStorage();

  const overlayAbsolutePath = getCommercialOverlayAbsolutePath(jobId);
  const overlayRelativePath = getCommercialOverlayRelativePath(jobId);
  const filterGraph = createCommercialFilterGraph(template, duration, outputFormat);

  const encoding = getEncodingParams(exportQuality);

  await writeFile(overlayAbsolutePath, filterGraph, "utf8");
  await runFfmpeg([
    "-y",
    "-i",
    inputAbsolutePath,
    "-filter_complex_script",
    overlayAbsolutePath,
    "-map",
    "[commercial]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    encoding.preset,
    "-crf",
    encoding.crf,
    "-c:a",
    "aac",
    "-b:a",
    encoding.audioBitrate,
    "-movflags",
    "+faststart",
    outputAbsolutePath,
  ]);

  if (!(await fileHasContent(outputAbsolutePath))) {
    throw new Error("FFmpeg no creó el vídeo comercial final.");
  }

  return {
    overlayAbsolutePath,
    overlayRelativePath,
  };
}

export async function composeMotionOverlayVideos({
  inputAbsolutePath,
  hookOverlayAbsolutePath,
  ctaOverlayAbsolutePath,
  outputAbsolutePath,
  duration,
  exportQuality = "standard",
}: {
  inputAbsolutePath: string;
  hookOverlayAbsolutePath: string;
  ctaOverlayAbsolutePath: string;
  outputAbsolutePath: string;
  duration: number;
  exportQuality?: VideoEditorExportQuality;
}) {
  const encoding = getEncodingParams(exportQuality);
  const ctaStart = Math.max(0, duration - ctaSeconds).toFixed(3);
  const filterComplex =
    `[1:v]format=rgba[hook];` +
    `[2:v]format=rgba,setpts=PTS-STARTPTS+${ctaStart}/TB[cta];` +
    `[0:v][hook]overlay=eof_action=pass:format=auto[hooked];` +
    `[hooked][cta]overlay=eof_action=pass:format=auto[commercial]`;

  await runFfmpeg([
    "-y",
    "-i",
    inputAbsolutePath,
    "-i",
    hookOverlayAbsolutePath,
    "-i",
    ctaOverlayAbsolutePath,
    "-filter_complex",
    filterComplex,
    "-map",
    "[commercial]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-preset",
    encoding.preset,
    "-crf",
    encoding.crf,
    "-c:a",
    "aac",
    "-b:a",
    encoding.audioBitrate,
    "-movflags",
    "+faststart",
    outputAbsolutePath,
  ]);

  if (!(await fileHasContent(outputAbsolutePath))) {
    throw new Error("FFmpeg no creó el vídeo con motion overlays.");
  }
}

function createCommercialFilterGraph(
  template: VideoEditorCommercialTemplate,
  duration: number,
  outputFormat: import("@/lib/video-editor/types").VideoEditorOutputFormat = "vertical_9_16",
) {
  const hookEnable = "between(t\\,0\\,2.5)";
  const ctaStart = Math.max(0, duration - ctaSeconds).toFixed(3);
  const ctaEnable = `gte(t\\,${ctaStart})`;
  const accentColor = escapeFilterValue(template.accentColor);
  const hook = escapeDrawtext(template.hook);
  const cta = escapeDrawtext(template.cta);

  // Adapt text size and positioning per format
  const hookFs = outputFormat === "horizontal_16_9" ? 36 : outputFormat === "square_1_1" ? 42 : 50;
  const ctaFs = outputFormat === "horizontal_16_9" ? 46 : outputFormat === "square_1_1" ? 54 : 68;
  const hookBoxY = outputFormat === "horizontal_16_9" ? 60 : 112;
  const hookBoxH = outputFormat === "horizontal_16_9" ? 180 : 246;
  const hookTextY = outputFormat === "horizontal_16_9" ? 120 : 202;
  const ctaBoxOffset = outputFormat === "horizontal_16_9" ? 320 : 720;
  const ctaBoxH = outputFormat === "horizontal_16_9" ? 160 : 212;
  const ctaAccentOffset = outputFormat === "horizontal_16_9" ? 200 : 540;
  const ctaTextOffset = outputFormat === "horizontal_16_9" ? 260 : 662;

  return `[0:v]drawbox=x=78:y=${hookBoxY}:w=iw-156:h=${hookBoxH}:color=black@0.48:t=fill:enable='${hookEnable}',drawbox=x=112:y=${hookBoxY + 20}:w=iw-224:h=8:color=${accentColor}@0.96:t=fill:enable='${hookEnable}',drawtext=text='${hook}':expansion=none:fontcolor=white:fontsize=${hookFs}:line_spacing=14:borderw=1:bordercolor=black@0.35:shadowcolor=black@0.95:shadowx=4:shadowy=5:x=(w-text_w)/2:y=${hookTextY}:enable='${hookEnable}',drawbox=x=96:y=ih-${ctaBoxOffset}:w=iw-192:h=${ctaBoxH}:color=black@0.52:t=fill:enable='${ctaEnable}',drawbox=x=132:y=ih-${ctaAccentOffset}:w=iw-264:h=8:color=${accentColor}@0.96:t=fill:enable='${ctaEnable}',drawtext=text='${cta}':expansion=none:fontcolor=white:fontsize=${ctaFs}:line_spacing=12:borderw=1:bordercolor=black@0.35:shadowcolor=black@0.95:shadowx=4:shadowy=5:x=(w-text_w)/2:y=ih-${ctaTextOffset}:enable='${ctaEnable}'[commercial]\n`;
}

function escapeDrawtext(text: string) {
  return escapeFilterValue(text)
    .replace(/%/g, "\\%")
    .replace(/'/g, "'\\\\\\''");
}

function escapeFilterValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpegCommand, args, {
      shell: false,
      windowsHide: true,
    });
    let errorOutput = "";

    child.stderr.on("data", (chunk: Buffer | string) => {
      errorOutput = `${errorOutput}${chunk.toString()}`.slice(
        -maxErrorOutputLength,
      );
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `FFmpeg overlay terminó con código ${code ?? "desconocido"}. ${errorOutput.trim()}`.trim(),
        ),
      );
    });
  });
}
