import { spawn } from "node:child_process";

import type { VideoEditorSilence } from "@/lib/video-editor/types";

const ffmpegCommand = "ffmpeg";
const silenceDuration = 0.75;
const silenceNoise = "-35dB";
const maxFfmpegOutputLength = 40_000;

export async function detectVideoSilences(inputAbsolutePath: string) {
  const output = await runSilenceDetect(inputAbsolutePath);
  const duration = parseDuration(output);

  if (!duration || duration <= 0) {
    throw new Error("No se pudo leer la duración del vídeo con FFmpeg.");
  }

  return {
    duration,
    silences: parseSilences(output, duration),
  };
}

function runSilenceDetect(inputAbsolutePath: string) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(
      ffmpegCommand,
      [
        "-hide_banner",
        "-i",
        inputAbsolutePath,
        "-af",
        `silencedetect=noise=${silenceNoise}:d=${silenceDuration}`,
        "-f",
        "null",
        "-",
      ],
      { shell: false, windowsHide: true },
    );
    let stderr = "";

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr = `${stderr}${chunk.toString()}`;
    });

    child.once("error", (error) => reject(error));
    child.once("close", (code) => {
      if (code === 0) {
        resolve(stderr);
        return;
      }

      reject(
        new Error(
          `FFmpeg silencedetect terminó con código ${code ?? "desconocido"}. ${stderr.slice(-maxFfmpegOutputLength).trim()}`.trim(),
        ),
      );
    });
  });
}

function parseDuration(output: string) {
  const durationMatch = output.match(
    /Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/,
  );

  if (!durationMatch) {
    return null;
  }

  const [, hours, minutes, seconds] = durationMatch;

  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function parseSilences(output: string, mediaDuration: number) {
  const silences: VideoEditorSilence[] = [];
  let currentStart: number | null = null;

  for (const line of output.split(/\r?\n/)) {
    const startMatch = line.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/);
    const endMatch = line.match(
      /silence_end:\s*(-?\d+(?:\.\d+)?)(?:\s*\|\s*silence_duration:\s*(-?\d+(?:\.\d+)?))?/,
    );

    if (startMatch) {
      currentStart = clampTime(Number(startMatch[1]), mediaDuration);
    }

    if (endMatch && currentStart !== null) {
      const end = clampTime(Number(endMatch[1]), mediaDuration);
      const duration = Number(endMatch[2]) || end - currentStart;

      if (end > currentStart && duration >= silenceDuration) {
        silences.push(toSilence(currentStart, end));
      }

      currentStart = null;
    }
  }

  if (currentStart !== null && mediaDuration > currentStart) {
    silences.push(toSilence(currentStart, mediaDuration));
  }

  return silences;
}

function toSilence(start: number, end: number) {
  return {
    start: roundTime(start),
    end: roundTime(end),
    duration: roundTime(end - start),
  };
}

function clampTime(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

function roundTime(value: number) {
  return Math.round(value * 1000) / 1000;
}
