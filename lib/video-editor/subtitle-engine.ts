import { writeFile } from "node:fs/promises";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getSubtitleAbsolutePath,
  getSubtitleRelativePath,
} from "@/lib/video-editor/job-store";
import { getOutputDimensions, normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import type {
  VideoEditorJob,
  VideoEditorSubtitleSegment,
  VideoEditorSubtitleStyle,
} from "@/lib/video-editor/types";

const mockSubtitleSegments = [
  { start: 0.5, end: 2.5, text: "Tu vídeo ya se edita en automático" },
  { start: 2.6, end: 5, text: "Subtítulos, recortes y motion graphics" },
  { start: 5.1, end: 8, text: "Listo para Reels, TikTok y Shorts" },
  { start: 8.1, end: 11, text: "Andrés Video Studio" },
] satisfies VideoEditorSubtitleSegment[];

const premiumKeywords =
  /(automático|reels|tiktok|shorts|andrés|studio)/giu;

export async function createPremiumAssSubtitles(job: VideoEditorJob) {
  const subtitleAbsolutePath = getSubtitleAbsolutePath(job.id);
  const segments = getSubtitleSegments(job);

  await ensureVideoEditorStorage();
  await writeFile(subtitleAbsolutePath, buildAssDocument(segments, job), "utf8");

  if (!(await fileHasContent(subtitleAbsolutePath))) {
    throw new Error("No se pudo crear el archivo ASS de subtítulos.");
  }

  return {
    subtitleAbsolutePath,
    subtitleRelativePath: getSubtitleRelativePath(job.id),
  };
}

function getSubtitleSegments(job: VideoEditorJob) {
  const transcriptSegments = job.transcriptSegments?.filter(
    (segment) =>
      Number.isFinite(segment.start) &&
      Number.isFinite(segment.end) &&
      segment.end > segment.start &&
      segment.text.trim().length > 0,
  );

  return transcriptSegments?.length ? transcriptSegments : mockSubtitleSegments;
}

function buildAssDocument(
  segments: VideoEditorSubtitleSegment[],
  job: VideoEditorJob,
) {
  const config = normalizeVideoEditorConfig(job.config);
  const dimensions = getOutputDimensions(config.outputFormat);
  const style = getSubtitleStyle(config.subtitleStyle);
  const events = segments
    .map(
      (segment) =>
        `Dialogue: 0,${formatAssTime(segment.start)},${formatAssTime(segment.end)},${style.name},,0,0,0,,${formatSubtitleText(segment.text, config.subtitleStyle)}`,
    )
    .join("\n");

  return `[Script Info]
Title: Andres Video Studio Premium Subtitles
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
PlayResX: ${dimensions.width}
PlayResY: ${dimensions.height}

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
${style.ass}

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
${events}
`;
}

function formatSubtitleText(
  text: string,
  style: VideoEditorSubtitleStyle,
) {
  const wrappedText = wrapTwoLines(escapeAssText(text.trim()));

  if (style === "minimal") {
    return wrappedText;
  }

  return wrappedText.replace(
    premiumKeywords,
    "{\\1c&H0000D7FF&}$1{\\1c&H00FFFFFF&}",
  );
}

function getSubtitleStyle(style: VideoEditorSubtitleStyle) {
  switch (style) {
    case "viral":
      return {
        name: "Viral",
        ass: "Style: Viral,Arial,96,&H00FFFFFF,&H0000D7FF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,8,4,2,72,72,210,1",
      };
    case "minimal":
      return {
        name: "Minimal",
        ass: "Style: Minimal,Arial,58,&H00FFFFFF,&H00FFFFFF,&H00000000,&H50000000,0,0,0,0,100,100,0,0,1,3,1,2,96,96,160,1",
      };
    default:
      return {
        name: "Premium",
        ass: "Style: Premium,Arial,82,&H00FFFFFF,&H0000D7FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,6,2,2,90,90,250,1",
      };
  }
}

function wrapTwoLines(text: string) {
  const words = text.split(/\s+/);

  if (text.length <= 34 || words.length < 4) {
    return text;
  }

  const targetLength = Math.ceil(text.length / 2);
  let firstLine = "";
  let secondLine = "";

  for (const word of words) {
    if (!secondLine && `${firstLine} ${word}`.trim().length <= targetLength) {
      firstLine = `${firstLine} ${word}`.trim();
      continue;
    }

    secondLine = `${secondLine} ${word}`.trim();
  }

  return secondLine ? `${firstLine}\\N${secondLine}` : firstLine;
}

function escapeAssText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/{/g, "(")
    .replace(/}/g, ")")
    .replace(/\r?\n+/g, " ");
}

function formatAssTime(seconds: number) {
  const centiseconds = Math.max(0, Math.round(seconds * 100));
  const hours = Math.floor(centiseconds / 360_000);
  const minutes = Math.floor((centiseconds % 360_000) / 6_000);
  const remainingSeconds = Math.floor((centiseconds % 6_000) / 100);
  const fraction = centiseconds % 100;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}.${String(fraction).padStart(2, "0")}`;
}
