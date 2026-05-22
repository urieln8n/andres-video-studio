import { writeFile } from "node:fs/promises";

import {
  ensureVideoEditorStorage,
  getQrAbsolutePath,
  getQrRelativePath,
} from "@/lib/video-editor/job-store";

const qrCells = 25;

export async function createLocalQrVisual(jobId: string, bookingUrl: string) {
  await ensureVideoEditorStorage();

  const absolutePath = getQrAbsolutePath(jobId);
  const relativePath = getQrRelativePath(jobId);

  await writeFile(absolutePath, createQrVisualSvg(bookingUrl), "utf8");

  return { absolutePath, relativePath };
}

export function createQrVisualSvg(value: string) {
  const cells = createQrCells(value);
  const modules = cells
    .flatMap((row, y) =>
      row.map((active, x) =>
        active
          ? `<rect x="${x + 2}" y="${y + 2}" width="1" height="1"/>`
          : "",
      ),
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrCells + 4} ${qrCells + 4}" shape-rendering="crispEdges"><rect width="100%" height="100%" rx="2" fill="#fff"/><g fill="#090909">${modules}</g><text x="${(qrCells + 4) / 2}" y="${qrCells + 2.8}" text-anchor="middle" font-family="Arial,sans-serif" font-size="1.5" fill="#111">QR</text></svg>`;
}

export function createQrCells(value: string) {
  const seed = hash(value || "barberiaos");

  return Array.from({ length: qrCells }, (_, y) =>
    Array.from({ length: qrCells }, (_, x) => {
      const finder =
        inFinder(x, y, 0, 0) ||
        inFinder(x, y, qrCells - 7, 0) ||
        inFinder(x, y, 0, qrCells - 7);

      if (finder !== null) {
        return finder;
      }

      return pseudoRandom(seed, x, y) % 7 < 3;
    }),
  );
}

function inFinder(x: number, y: number, left: number, top: number) {
  const localX = x - left;
  const localY = y - top;

  if (localX < 0 || localX > 6 || localY < 0 || localY > 6) {
    return null;
  }

  return (
    localX === 0 ||
    localX === 6 ||
    localY === 0 ||
    localY === 6 ||
    (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4)
  );
}

function hash(value: string) {
  let result = 2166136261;

  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }

  return result >>> 0;
}

function pseudoRandom(seed: number, x: number, y: number) {
  let value = seed ^ Math.imul(x + 17, 374761393) ^ Math.imul(y + 29, 668265263);
  value ^= value >>> 13;
  value = Math.imul(value, 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}
