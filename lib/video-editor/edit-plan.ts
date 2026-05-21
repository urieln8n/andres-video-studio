import { writeFile } from "node:fs/promises";

import {
  ensureVideoEditorStorage,
  getEditPlanAbsolutePath,
  getEditPlanRelativePath,
} from "@/lib/video-editor/job-store";
import type {
  VideoEditorEditPlan,
  VideoEditorKeepRange,
  VideoEditorSilence,
} from "@/lib/video-editor/types";

const keepPaddingSeconds = 0.2;
const maxKeepRanges = 24;
const minimumRemovalSeconds = 0.08;

export function createEditPlan({
  jobId,
  inputPath,
  cleanPath,
  duration,
  silences,
}: {
  jobId: string;
  inputPath: string;
  cleanPath: string;
  duration: number;
  silences: VideoEditorSilence[];
}) {
  const removableRanges = silences
    .map((silence) => ({
      start: roundTime(Math.min(duration, silence.start + keepPaddingSeconds)),
      end: roundTime(Math.max(0, silence.end - keepPaddingSeconds)),
    }))
    .filter((range) => range.end - range.start >= minimumRemovalSeconds);
  const keepRanges = createKeepRanges(duration, removableRanges);
  const requestedTrim = removableRanges.length > 0 && keepRanges.length > 0;
  const trimAllowed = requestedTrim && keepRanges.length <= maxKeepRanges;
  const selectedKeepRanges = trimAllowed ? keepRanges : [toKeepRange(0, duration)];
  const removedSeconds = trimAllowed
    ? roundTime(duration - selectedKeepRanges.reduce((sum, range) => sum + range.duration, 0))
    : 0;

  return {
    jobId,
    inputPath,
    cleanPath: trimAllowed ? cleanPath : inputPath,
    duration: roundTime(duration),
    silences,
    keepRanges: selectedKeepRanges,
    removedSeconds,
    originalDuration: roundTime(duration),
    finalEstimatedDuration: roundTime(duration - removedSeconds),
    trimApplied: trimAllowed,
    warning:
      requestedTrim && !trimAllowed
        ? `Plan con ${keepRanges.length} segmentos; se omite recorte para mantener un comando FFmpeg razonable.`
        : undefined,
  } satisfies VideoEditorEditPlan;
}

export async function writeEditPlan(plan: VideoEditorEditPlan) {
  await ensureVideoEditorStorage();

  const absolutePath = getEditPlanAbsolutePath(plan.jobId);

  await writeFile(absolutePath, JSON.stringify(plan, null, 2), "utf8");

  return {
    absolutePath,
    relativePath: getEditPlanRelativePath(plan.jobId),
  };
}

function createKeepRanges(
  duration: number,
  removalRanges: Array<{ start: number; end: number }>,
) {
  const ranges: VideoEditorKeepRange[] = [];
  let cursor = 0;

  for (const removal of removalRanges) {
    if (removal.start > cursor) {
      ranges.push(toKeepRange(cursor, removal.start));
    }

    cursor = Math.max(cursor, removal.end);
  }

  if (cursor < duration) {
    ranges.push(toKeepRange(cursor, duration));
  }

  return ranges.filter((range) => range.duration > 0);
}

function toKeepRange(start: number, end: number) {
  return {
    start: roundTime(start),
    end: roundTime(end),
    duration: roundTime(end - start),
  };
}

function roundTime(value: number) {
  return Math.round(value * 1000) / 1000;
}
