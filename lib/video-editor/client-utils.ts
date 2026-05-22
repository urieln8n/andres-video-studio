import type {
  VideoEditorClient,
  VideoEditorClientSector,
  VideoEditorClientSnapshot,
} from "@/lib/video-editor/client-types";
import { validateClientId } from "@/lib/video-editor/safe-paths";
import {
  sanitizeMultilineText,
  sanitizeText,
} from "@/lib/video-editor/text-sanitize";

export const clientSectors: VideoEditorClientSector[] = [
  "barberia",
  "fotografia",
  "restaurante",
  "clinica",
  "agencia",
  "negocio_local",
  "otro",
];

export const clientSectorLabels: Record<VideoEditorClientSector, string> = {
  barberia: "Barbería",
  fotografia: "Fotografía",
  restaurante: "Restaurante",
  clinica: "Clínica",
  agencia: "Agencia",
  negocio_local: "Negocio local",
  otro: "Otro",
};

export function normalizeClientInput(
  value: unknown,
  current?: VideoEditorClient,
) {
  const candidate = toRecord(value);
  const businessName = cleanText(candidate.businessName, 120);
  const name = cleanText(candidate.name, 120) || businessName;

  if (!name || !businessName) {
    throw new Error("Nombre y nombre de negocio son obligatorios.");
  }

  const now = new Date().toISOString();

  return {
    name,
    businessName,
    sector: isClientSector(candidate.sector) ? candidate.sector : "otro",
    contactName: optionalText(candidate.contactName, 120),
    email: optionalText(candidate.email, 180),
    phone: optionalText(candidate.phone, 80),
    website: optionalHttpUrl(candidate.website),
    instagram: optionalText(candidate.instagram, 120),
    bookingUrl: optionalHttpUrl(candidate.bookingUrl),
    brandColor: optionalBrandColor(candidate.brandColor),
    logoPath: current?.logoPath ?? null,
    notes: optionalMultilineText(candidate.notes, 1_200),
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
}

export function normalizeClientSnapshot(value: unknown) {
  const candidate = toRecord(value);

  if (
    typeof candidate.id !== "string" ||
    !cleanText(candidate.businessName, 120) ||
    !isClientSector(candidate.sector)
  ) {
    return null;
  }

  return {
    id: cleanText(candidate.id, 80),
    businessName: cleanText(candidate.businessName, 120),
    sector: candidate.sector,
    website: optionalHttpUrl(candidate.website) ?? null,
    instagram: optionalText(candidate.instagram, 120) ?? null,
    bookingUrl: optionalHttpUrl(candidate.bookingUrl) ?? null,
    brandColor: optionalBrandColor(candidate.brandColor) ?? null,
  } satisfies VideoEditorClientSnapshot;
}

export function createClientSnapshot(client: VideoEditorClient) {
  return normalizeClientSnapshot(client);
}

export function isClientSector(value: unknown): value is VideoEditorClientSector {
  return clientSectors.includes(value as VideoEditorClientSector);
}

export function isValidClientId(value: string) {
  return validateClientId(value);
}

export function sanitizeClientSlug(value: string) {
  return cleanText(value, 100)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

export function cleanClientText(value: unknown, maxLength: number) {
  return cleanText(value, maxLength);
}

function optionalText(value: unknown, maxLength: number) {
  return cleanText(value, maxLength) || undefined;
}

function optionalMultilineText(value: unknown, maxLength: number) {
  return sanitizeMultilineText(value, maxLength) || undefined;
}

function optionalHttpUrl(value: unknown) {
  const text = cleanText(value, 500);

  if (!text) {
    return undefined;
  }

  try {
    const url = new URL(text);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function optionalBrandColor(value: unknown) {
  const color = cleanText(value, 16);

  return /^#[0-9a-f]{6}$/i.test(color) ? color : undefined;
}

function cleanText(value: unknown, maxLength: number) {
  return sanitizeText(value, maxLength);
}

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}
