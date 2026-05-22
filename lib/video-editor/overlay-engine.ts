import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getCommercialOverlayAbsolutePath,
  getCommercialOverlayRelativePath,
} from "@/lib/video-editor/job-store";
import type { VideoEditorCommercialTemplate } from "@/lib/video-editor/types";

const ffmpegCommand = "ffmpeg";
const maxErrorOutputLength = 8_000;
const hookSeconds = 2.5;
const ctaSeconds = 3;

export async function renderCommercialOverlays({
  jobId,
  inputAbsolutePath,
  outputAbsolutePath,
  duration,
  template,
}: {
  jobId: string;
  inputAbsolutePath: string;
  outputAbsolutePath: string;
  duration: number;
  template: VideoEditorCommercialTemplate;
}) {
  if (!(await fileHasContent(inputAbsolutePath))) {
    throw new Error("No existe el vídeo subtitulado para aplicar overlays.");
  }

  await ensureVideoEditorStorage();

  const overlayAbsolutePath = getCommercialOverlayAbsolutePath(jobId);
  const overlayRelativePath = getCommercialOverlayRelativePath(jobId);
  const filterGraph = createCommercialFilterGraph(template, duration);

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
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
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

function createCommercialFilterGraph(
  template: VideoEditorCommercialTemplate,
  duration: number,
) {
  const hookEnable = "between(t\\,0\\,2.5)";
  const ctaStart = Math.max(0, duration - ctaSeconds).toFixed(3);
  const ctaEnable = `gte(t\\,${ctaStart})`;
  const accentColor = escapeFilterValue(template.accentColor);
  const hook = escapeDrawtext(template.hook);
  const cta = escapeDrawtext(template.cta);

  return `[0:v]drawbox=x=78:y=112:w=iw-156:h=246:color=black@0.48:t=fill:enable='${hookEnable}',drawbox=x=112:y=132:w=iw-224:h=8:color=${accentColor}@0.96:t=fill:enable='${hookEnable}',drawtext=text='${hook}':expansion=none:fontcolor=white:fontsize=50:line_spacing=14:borderw=1:bordercolor=black@0.35:shadowcolor=black@0.95:shadowx=4:shadowy=5:x=(w-text_w)/2:y=202:enable='${hookEnable}',drawbox=x=96:y=ih-720:w=iw-192:h=212:color=black@0.52:t=fill:enable='${ctaEnable}',drawbox=x=132:y=ih-540:w=iw-264:h=8:color=${accentColor}@0.96:t=fill:enable='${ctaEnable}',drawtext=text='${cta}':expansion=none:fontcolor=white:fontsize=68:line_spacing=12:borderw=1:bordercolor=black@0.35:shadowcolor=black@0.95:shadowx=4:shadowy=5:x=(w-text_w)/2:y=ih-662:enable='${ctaEnable}'[commercial]\n`;
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
