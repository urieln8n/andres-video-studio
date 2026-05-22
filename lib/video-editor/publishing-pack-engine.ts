import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

import { loadCopyPack, parseHashtags } from "@/lib/video-editor/copy-review";
import { getCommercialPresetById, isValidCommercialPreset } from "@/lib/video-editor/commercial-presets";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import {
  ensureVideoEditorStorage,
  getPublishingPackAbsolutePath,
  getPublishingPackRelativePath,
  isValidVideoEditorJobId,
  updateJob,
} from "@/lib/video-editor/job-store";
import { getPlatformPresetById } from "@/lib/video-editor/platform-presets";
import { touchJob } from "@/lib/video-editor/progress";
import type {
  VideoEditorCopyPack,
  VideoEditorJob,
  VideoEditorPublishingPack,
} from "@/lib/video-editor/types";

const postingChecklist = [
  "Revisar el vídeo antes de publicar",
  "Descargar el MP4",
  "Copiar el caption adecuado",
  "Publicar en la plataforma elegida",
  "Añadir link de reserva en bio o descripción",
  "Compartir en historias",
  "Responder comentarios/mensajes",
];

const barberiaosTips = [
  "Añade el link de reserva en la bio",
  "Comparte el vídeo por WhatsApp",
  "Fija el reel si es una promoción",
  "Pon el QR en historias",
  "Usa el vídeo para llenar huecos libres",
  "Añade ubicación de la barbería",
];

export async function createPublishingPack(job: VideoEditorJob) {
  const config = normalizeVideoEditorConfig(job.config ?? {
    templateId: job.templateId,
    hookText: job.hookText,
    ctaText: job.ctaText,
  });
  const copyPack = await loadCopyPack(job);
  const copy = resolvePublishingCopy(job, copyPack);
  const preset = getPlatformPresetById(config.platformPreset);
  const commercialLabel = isValidCommercialPreset(config.commercialPreset)
    ? getCommercialPresetById(config.commercialPreset).label
    : "Contenido comercial";
  const summary = cleanMultilineText(copyPack.summary || job.transcriptionText, 220);
  const hashtags = ensureHashtags(copy.hashtags, config.mode === "barberiaos");
  const hashtagLine = hashtags.join(" ");
  const client = config.clientSnapshot;
  const businessName = cleanText(client?.businessName, 120);
  const bookingUrl = cleanUrl(
    client?.bookingUrl || config.barberiaos.bookingUrl,
  );
  const bookingPrompt = bookingUrl
    ? `Reserva tu cita aquí: ${bookingUrl}`
    : copy.cta;
  const explain =
    copy.description ||
    summary ||
    `Nuevo vídeo para ${businessName || commercialLabel}.`;
  const pack = {
    id: randomUUID(),
    jobId: job.id,
    provider: "local_rules",
    title: copy.title,
    instagramCaption: joinParagraphs([
      copy.hook,
      explain,
      copy.cta,
      hashtagLine,
    ]),
    tiktokCaption: joinParagraphs([
      copy.hook,
      bookingPrompt,
      hashtags.slice(0, 5).join(" "),
    ]),
    youtubeShortsDescription: joinParagraphs([
      copy.title,
      explain,
      copy.cta,
      hashtagLine,
    ]),
    whatsappText:
      config.mode === "barberiaos" || client?.sector === "barberia"
        ? joinInline([
            `Nuevo vídeo de ${businessName || cleanText(config.barberiaos.barbershopName, 80) || "nuestra barbería"}.`,
            bookingPrompt,
          ])
        : joinInline([copy.title, explain, copy.cta]),
    instagramStoryText:
      config.mode === "barberiaos" || client?.sector === "barberia"
        ? bookingUrl
          ? `Nuevo reel listo. Escanea o entra al link para reservar: ${bookingUrl}`
          : "Nuevo reel listo. Escanea o entra al link para reservar."
        : joinInline(["Nuevo reel listo.", copy.hook, copy.cta]),
    hashtags,
    postingChecklist,
    platformTips: createPlatformTips(
      preset.platform,
      preset.recommendedDurationSeconds,
      businessName,
      bookingUrl,
    ),
    barberiaosTips:
      config.mode === "barberiaos" || client?.sector === "barberia"
        ? barberiaosTips
        : undefined,
    createdAt: new Date().toISOString(),
  } satisfies VideoEditorPublishingPack;

  const normalizedPack = normalizePublishingPack(pack, job.id);

  if (!normalizedPack) {
    throw new Error("No se pudo normalizar el paquete de publicación.");
  }

  return normalizedPack;
}

export async function createAndSavePublishingPack(job: VideoEditorJob) {
  const publishingPack = await createPublishingPack(job);

  await ensureVideoEditorStorage();
  await writeFile(
    getPublishingPackAbsolutePath(job.id),
    JSON.stringify(publishingPack, null, 2),
    "utf8",
  );

  const nextJob = await updateJob(job.id, (currentJob) =>
    touchJob({
      ...currentJob,
      publishingPackPath: getPublishingPackRelativePath(currentJob.id),
      publishingPackCreated: true,
      publishingTitle: publishingPack.title,
      publishingHashtags: publishingPack.hashtags,
      publishingProvider: publishingPack.provider,
    }),
  );

  return { publishingPack, job: nextJob ?? job };
}

export async function loadPublishingPack(jobId: string) {
  if (!isValidVideoEditorJobId(jobId)) {
    return null;
  }

  try {
    const value = JSON.parse(
      await readFile(getPublishingPackAbsolutePath(jobId), "utf8"),
    ) as unknown;

    return normalizePublishingPack(value, jobId);
  } catch {
    return null;
  }
}

function resolvePublishingCopy(job: VideoEditorJob, copyPack: VideoEditorCopyPack) {
  const title = job.finalCopy?.title || copyPack.title || "Vídeo listo para publicar";
  const description = job.finalCopy?.description || copyPack.description || "";
  const hook =
    job.finalCopy?.selectedHook ||
    copyPack.hooks[0] ||
    job.finalHookText ||
    job.hookText ||
    title;
  const cta =
    job.finalCopy?.selectedCta ||
    copyPack.ctas[0] ||
    job.finalCtaText ||
    job.ctaText ||
    "Compártelo y guarda este vídeo";

  return {
    title: cleanText(title, 120) || "Vídeo listo para publicar",
    description: cleanMultilineText(description, 800),
    hook: cleanText(hook, 180) || "Nuevo vídeo listo",
    cta: cleanText(cta, 180) || "Compártelo y guarda este vídeo",
    hashtags: parseHashtags(job.finalCopy?.hashtags?.length ? job.finalCopy.hashtags : copyPack.hashtags),
  };
}

function createPlatformTips(
  platform: string,
  recommendedDurationSeconds: number,
  businessName: string,
  bookingUrl: string,
) {
  const platformLabel = cleanText(platform, 40) || "la plataforma elegida";

  return [
    `Usa este texto en ${platformLabel} y revisa que el hook se lea al inicio.`,
    `Comprueba que el vídeo mantenga atención en los primeros ${Math.min(3, recommendedDurationSeconds)} segundos.`,
    bookingUrl
      ? `Usa el enlace comercial de ${businessName || "la marca"} en bio, descripción o mensaje directo.`
      : "Adapta el CTA al enlace disponible en bio, descripción o mensaje directo.",
  ];
}

function ensureHashtags(hashtags: string[], barberiaos: boolean) {
  const fallback = barberiaos
    ? ["#barberia", "#reservas", "#reels"]
    : ["#video", "#shorts", "#contenido"];

  return parseHashtags(hashtags.length ? hashtags : fallback).slice(0, 12);
}

function normalizePublishingPack(value: unknown, expectedJobId?: string) {
  const candidate = toRecord(value);
  const jobId = cleanText(candidate.jobId, 80);

  if (!jobId || (expectedJobId && jobId !== expectedJobId)) {
    return null;
  }

  const provider =
    candidate.provider === "ai" || candidate.provider === "manual"
      ? candidate.provider
      : "local_rules";
  const title = cleanText(candidate.title, 120);

  if (!title) {
    return null;
  }

  return {
    id: cleanText(candidate.id, 80) || randomUUID(),
    jobId,
    provider,
    title,
    instagramCaption: cleanMultilineText(candidate.instagramCaption, 2_000),
    tiktokCaption: cleanMultilineText(candidate.tiktokCaption, 900),
    youtubeShortsDescription: cleanMultilineText(candidate.youtubeShortsDescription, 2_000),
    whatsappText: cleanMultilineText(candidate.whatsappText, 1_200),
    instagramStoryText: cleanMultilineText(candidate.instagramStoryText, 600),
    hashtags: parseHashtags(candidate.hashtags),
    postingChecklist: cleanList(candidate.postingChecklist, postingChecklist),
    platformTips: cleanList(candidate.platformTips, []),
    barberiaosTips: Array.isArray(candidate.barberiaosTips)
      ? cleanList(candidate.barberiaosTips, [])
      : undefined,
    createdAt: cleanText(candidate.createdAt, 80) || new Date().toISOString(),
  } satisfies VideoEditorPublishingPack;
}

function cleanList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .map((item) => cleanText(item, 220))
    .filter((item): item is string => Boolean(item));

  return items.length ? items.slice(0, 16) : fallback;
}

function joinParagraphs(values: string[]) {
  return values.map((value) => cleanMultilineText(value, 1_000)).filter(Boolean).join("\n\n");
}

function joinInline(values: string[]) {
  return values.map((value) => cleanText(value, 500)).filter(Boolean).join(" ");
}

function cleanUrl(value: unknown) {
  const url = cleanText(value, 320);

  if (!/^https?:\/\//i.test(url)) {
    return "";
  }

  return url;
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return stripDangerousText(value).replace(/\s+/g, " ").slice(0, maxLength).trim();
}

function cleanMultilineText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return stripDangerousText(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, maxLength)
    .trim();
}

function stripDangerousText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0009\u000b-\u001f]/g, " ");
}

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}
