import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  fileHasContent,
  getOutputRootAbsolutePath,
} from "@/lib/video-editor/job-store";
import type { VideoEditorJob } from "@/lib/video-editor/types";

export type FinalVideoFile = {
  absolutePath: string;
  fileName: string;
  relativePath: string;
  size: number;
};

export async function resolveFinalVideoFile(job: VideoEditorJob) {
  const relativePath = job.finalVideoPath || job.outputPath;

  if (!relativePath) {
    return null;
  }

  const outputRoot = getOutputRootAbsolutePath();
  const normalizedRelativePath = relativePath.replace(/\\/g, "/");

  if (
    path.isAbsolute(relativePath) ||
    !normalizedRelativePath.startsWith("storage/output/") ||
    normalizedRelativePath.includes("../")
  ) {
    return null;
  }

  const absolutePath = path.resolve(
    outputRoot,
    path.posix.basename(normalizedRelativePath),
  );

  if (!isInsideDirectory(outputRoot, absolutePath)) {
    return null;
  }

  if (path.extname(absolutePath).toLowerCase() !== ".mp4") {
    return null;
  }

  if (!(await fileHasContent(absolutePath))) {
    return null;
  }

  const fileStat = await stat(absolutePath);

  return {
    absolutePath,
    fileName: path.basename(absolutePath),
    relativePath,
    size: fileStat.size,
  } satisfies FinalVideoFile;
}

export async function createMp4Response({
  disposition,
  file,
  rangeHeader,
}: {
  disposition: "attachment" | "inline";
  file: FinalVideoFile;
  rangeHeader?: string | null;
}) {
  const range = parseByteRange(rangeHeader, file.size);
  const video = await readFile(file.absolutePath);
  const body = range ? video.subarray(range.start, range.end + 1) : video;
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Content-Disposition": `${disposition}; filename="${escapeHeaderFileName(file.fileName)}"`,
    "Content-Length": String(body.byteLength),
    "Content-Type": "video/mp4",
  });

  if (range) {
    headers.set(
      "Content-Range",
      `bytes ${range.start}-${range.end}/${file.size}`,
    );
  }

  return new Response(body, {
    headers,
    status: range ? 206 : 200,
  });
}

export function withDownloadName(file: FinalVideoFile, jobId: string) {
  return {
    ...file,
    fileName: `andres-video-studio-${jobId}.mp4`,
  } satisfies FinalVideoFile;
}

function isInsideDirectory(directory: string, candidate: string) {
  const relative = path.relative(directory, candidate);

  return (
    relative.length > 0 &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}

function parseByteRange(value: string | null | undefined, size: number) {
  if (!value) {
    return null;
  }

  const match = value.match(/^bytes=(\d*)-(\d*)$/);

  if (!match) {
    return null;
  }

  const [, rawStart, rawEnd] = match;
  const suffixLength = rawStart ? null : Number(rawEnd);
  const start = rawStart
    ? Number(rawStart)
    : Math.max(0, size - (Number.isFinite(suffixLength) ? suffixLength! : 0));
  const requestedEnd = rawEnd && rawStart ? Number(rawEnd) : size - 1;
  const end = Math.min(requestedEnd, size - 1);

  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
    return null;
  }

  return { start, end };
}

function escapeHeaderFileName(value: string) {
  return value.replace(/[\r\n"]/g, "_");
}
