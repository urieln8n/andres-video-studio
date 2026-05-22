import { writeFile } from "node:fs/promises";

import {
  ensureVideoEditorStorage,
  getFillerPlanAbsolutePath,
  getFillerPlanRelativePath,
} from "@/lib/video-editor/job-store";
import type {
  VideoEditorCutRange,
  VideoEditorFiller,
  VideoEditorFillerPlan,
  VideoEditorTranscript,
  VideoEditorTranscriptWord,
} from "@/lib/video-editor/types";

const fillerPhrases = [
  ["o", "sea"],
  ["eh"],
  ["em"],
  ["mmm"],
  ["umm"],
  ["este"],
  ["pues"],
  ["bueno"],
  ["vale"],
  ["osea"],
  ["tipo"],
  ["sabes"],
] as const;
const beforeBufferSeconds = 0.05;
const afterBufferSeconds = 0.08;
const minimumPauseSeconds = 0.08;
const minimumCutSeconds = 0.12;
const maximumFillerSeconds = 0.7;
const maximumPhraseFillerSeconds = 0.9;
const maximumCuts = 30;
const maximumRemovedShare = 0.15;
const maximumRemovedSeconds = 12;

export function createFillerPlan({
  jobId,
  inputPath,
  outputPath,
  transcript,
}: {
  jobId: string;
  inputPath: string;
  outputPath: string;
  transcript: VideoEditorTranscript | null;
}) {
  const transcriptDuration = transcript?.duration ?? lastTranscriptEnd(transcript);
  const words = flattenWords(transcript);
  const warnings: string[] = [];

  if (!transcript || words.length === 0) {
    warnings.push(
      "No hay timestamps de palabra; se omite limpieza de muletillas.",
    );

    return toPlan({
      jobId,
      inputPath,
      outputPath,
      detectedFillers: [],
      cutRanges: [],
      mode: "skipped",
      warnings,
    });
  }

  const detectedFillers = detectSafeFillers(words);
  const cutRanges = mergeCutRanges(
    detectedFillers.map((filler) => toCutRange(filler, transcriptDuration)),
  );
  const removedSeconds = sumDurations(cutRanges);

  if (detectedFillers.length > maximumCuts) {
    warnings.push(
      `Se detectaron ${detectedFillers.length} fillers seguros; esta versión solo recorta hasta ${maximumCuts}.`,
    );
  }

  if (
    transcriptDuration > 0 &&
    (removedSeconds > maximumRemovedSeconds ||
      removedSeconds / transcriptDuration > maximumRemovedShare)
  ) {
    warnings.push(
      "El recorte de fillers podría alterar demasiado la sincronía; se genera solo reporte.",
    );
  }

  const mode =
    detectedFillers.length === 0
      ? "report_only"
      : warnings.length > 0
        ? "report_only"
        : "cut";

  return toPlan({
    jobId,
    inputPath,
    outputPath,
    detectedFillers,
    cutRanges: mode === "cut" ? cutRanges : [],
    mode,
    warnings,
  });
}

export async function writeFillerPlan(plan: VideoEditorFillerPlan) {
  await ensureVideoEditorStorage();

  const absolutePath = getFillerPlanAbsolutePath(plan.jobId);

  await writeFile(absolutePath, JSON.stringify(plan, null, 2), "utf8");

  return {
    absolutePath,
    relativePath: getFillerPlanRelativePath(plan.jobId),
  };
}

function detectSafeFillers(words: VideoEditorTranscriptWord[]) {
  const fillers: VideoEditorFiller[] = [];
  let index = 0;

  while (index < words.length) {
    const phrase = matchPhrase(words, index);

    if (!phrase) {
      index += 1;
      continue;
    }

    const firstWord = words[index];
    const lastWord = words[index + phrase.length - 1];
    const duration = lastWord.end - firstWord.start;

    if (
      isShortFiller(duration, phrase.length) &&
      hasSafePause(words[index - 1], firstWord) &&
      hasSafePause(lastWord, words[index + phrase.length])
    ) {
      fillers.push({
        text: phrase.join(" "),
        start: roundTime(firstWord.start),
        end: roundTime(lastWord.end),
        duration: roundTime(duration),
        confidence: "safe",
      });
    }

    index += phrase.length;
  }

  return fillers;
}

function matchPhrase(words: VideoEditorTranscriptWord[], index: number) {
  return fillerPhrases.find((phrase) =>
    phrase.every((token, offset) => normalizeWord(words[index + offset]?.word) === token),
  );
}

function normalizeWord(word: string | undefined) {
  return (word ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function hasSafePause(
  leftWord: VideoEditorTranscriptWord | undefined,
  rightWord: VideoEditorTranscriptWord | undefined,
) {
  if (!leftWord || !rightWord) {
    return true;
  }

  const gap = rightWord.start - leftWord.end;

  return gap >= minimumPauseSeconds;
}

function toCutRange(filler: VideoEditorFiller, transcriptDuration: number) {
  const start = roundTime(Math.max(0, filler.start - beforeBufferSeconds));
  const end = roundTime(
    transcriptDuration > 0
      ? Math.min(transcriptDuration, filler.end + afterBufferSeconds)
      : filler.end + afterBufferSeconds,
  );

  return {
    start,
    end,
    duration: roundTime(end - start),
  } satisfies VideoEditorCutRange;
}

function toPlan({
  jobId,
  inputPath,
  outputPath,
  detectedFillers,
  cutRanges,
  mode,
  warnings,
}: Omit<VideoEditorFillerPlan, "fillersCount" | "removedSeconds">) {
  const usableCutRanges = cutRanges.filter(
    (range) => range.duration >= minimumCutSeconds,
  );

  return {
    jobId,
    inputPath,
    outputPath,
    detectedFillers,
    cutRanges: usableCutRanges,
    removedSeconds: sumDurations(usableCutRanges),
    fillersCount: detectedFillers.length,
    mode,
    warnings,
  } satisfies VideoEditorFillerPlan;
}

function mergeCutRanges(ranges: VideoEditorCutRange[]) {
  const merged: VideoEditorCutRange[] = [];

  for (const range of ranges.sort((left, right) => left.start - right.start)) {
    const previous = merged.at(-1);

    if (!previous || range.start > previous.end) {
      merged.push(range);
      continue;
    }

    previous.end = roundTime(Math.max(previous.end, range.end));
    previous.duration = roundTime(previous.end - previous.start);
  }

  return merged;
}

function flattenWords(transcript: VideoEditorTranscript | null) {
  return (transcript?.segments ?? [])
    .flatMap((segment) => segment.words ?? [])
    .filter((word) => word.end > word.start)
    .sort((left, right) => left.start - right.start);
}

function isShortFiller(duration: number, wordsCount: number) {
  return (
    duration > 0 &&
    duration <= (wordsCount > 1 ? maximumPhraseFillerSeconds : maximumFillerSeconds)
  );
}

function lastTranscriptEnd(transcript: VideoEditorTranscript | null) {
  return transcript?.segments.at(-1)?.end ?? 0;
}

function sumDurations(ranges: VideoEditorCutRange[]) {
  return roundTime(ranges.reduce((sum, range) => sum + range.duration, 0));
}

function roundTime(value: number) {
  return Math.round(value * 1000) / 1000;
}
