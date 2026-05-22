import { spawn } from "node:child_process";
import { copyFile } from "node:fs/promises";

import { normalizeVideoEditorConfig, getEncodingParams } from "@/lib/video-editor/config";
import { fileHasContent, getQrOverlayTempAbsolutePath } from "@/lib/video-editor/job-store";
import type { VideoEditorJob } from "@/lib/video-editor/types";

const ffmpegCommand = "ffmpeg";
const maxErrorOutputLength = 8_000;

export async function renderBarberiaOSQrCtaOverlay({
  duration,
  inputAbsolutePath,
  job,
  outputAbsolutePath,
}: {
  duration: number;
  inputAbsolutePath: string;
  job: VideoEditorJob;
  outputAbsolutePath: string;
}) {
  const config = normalizeVideoEditorConfig(job.config);

  if (config.mode !== "barberiaos" || !config.barberiaos.showQrOverlay) {
    return { applied: false, warnings: [] as string[] };
  }

  const temporaryOutput = getQrOverlayTempAbsolutePath(job.id);
  const encoding = getEncodingParams(config.exportQuality);
  const start =
    config.barberiaos.qrPosition === "end_screen"
      ? Math.max(0, duration - 4)
      : Math.max(0, duration - 5);
  const position = getTextPosition(config.barberiaos.qrPosition);
  const filter =
    `drawbox=x=${position.boxX}:y=${position.boxY}:w=${position.boxW}:h=${position.boxH}:color=black@0.62:t=fill:enable='gte(t\\,${start.toFixed(3)})',` +
    `drawbox=x=${position.accentX}:y=${position.accentY}:w=${position.accentW}:h=6:color=#D6B26E@0.95:t=fill:enable='gte(t\\,${start.toFixed(3)})',` +
    `drawtext=text='${escapeDrawtext(config.barberiaos.qrCtaText)}':expansion=none:fontcolor=white:fontsize=${position.fontSize}:borderw=1:bordercolor=black@0.35:shadowcolor=black@0.9:shadowx=3:shadowy=4:x=${position.textX}:y=${position.textY}:enable='gte(t\\,${start.toFixed(3)})'`;

  await runFfmpeg([
    "-y",
    "-i",
    inputAbsolutePath,
    "-vf",
    filter,
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
    temporaryOutput,
  ]);

  if (!(await fileHasContent(temporaryOutput))) {
    throw new Error("FFmpeg no creó el CTA QR textual.");
  }

  await copyFile(temporaryOutput, outputAbsolutePath);

  return {
    applied: false,
    warnings: [
      config.barberiaos.bookingUrl
        ? "QR visual no aplicado, CTA textual usado"
        : "Booking URL no disponible; CTA QR textual usado",
    ],
  };
}

function getTextPosition(position: string) {
  if (position === "bottom_right") {
    return {
      accentW: "iw*0.22",
      accentX: "iw*0.70",
      accentY: "ih*0.78",
      boxH: "ih*0.13",
      boxW: "iw*0.34",
      boxX: "iw*0.62",
      boxY: "ih*0.76",
      fontSize: 34,
      textX: "iw-text_w-70",
      textY: "ih*0.82",
    };
  }

  if (position === "bottom_center") {
    return {
      accentW: "iw*0.42",
      accentX: "iw*0.29",
      accentY: "ih*0.78",
      boxH: "ih*0.13",
      boxW: "iw*0.72",
      boxX: "iw*0.14",
      boxY: "ih*0.76",
      fontSize: 42,
      textX: "(w-text_w)/2",
      textY: "ih*0.82",
    };
  }

  return {
    accentW: "iw*0.56",
    accentX: "iw*0.22",
    accentY: "ih*0.63",
    boxH: "ih*0.24",
    boxW: "iw*0.82",
    boxX: "iw*0.09",
    boxY: "ih*0.60",
    fontSize: 48,
    textX: "(w-text_w)/2",
    textY: "ih*0.70",
  };
}

function escapeDrawtext(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/%/g, "\\%")
    .replace(/'/g, "'\\\\\\''");
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(ffmpegCommand, args, {
      shell: false,
      windowsHide: true,
    });
    let errorOutput = "";

    child.stderr.on("data", (chunk: Buffer | string) => {
      errorOutput = `${errorOutput}${chunk.toString()}`.slice(-maxErrorOutputLength);
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `FFmpeg QR terminó con código ${code ?? "desconocido"}. ${errorOutput.trim()}`.trim(),
        ),
      );
    });
  });
}
