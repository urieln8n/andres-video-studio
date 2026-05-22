import path from "node:path";

export function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string" || maxLength <= 0) {
    return "";
  }

  return stripUnsafeText(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultilineText(value: unknown, maxLength: number) {
  if (typeof value !== "string" || maxLength <= 0) {
    return "";
  }

  return stripUnsafeText(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFileName(value: string, fallback = "file") {
  const extension = path.extname(value).toLowerCase();
  const baseName = path
    .basename(value, path.extname(value))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return `${baseName || fallback}${extension}`;
}

export function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const amount = value / 1024 ** index;

  return `${new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: index === 0 ? 0 : index === 2 ? 2 : 1,
  }).format(amount)} ${units[index]}`;
}

function stripUnsafeText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0009\u000b-\u001f]/g, " ");
}
