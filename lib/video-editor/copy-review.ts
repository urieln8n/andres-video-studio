import { readFile, writeFile } from "node:fs/promises";

import { selectCommercialTemplate } from "@/lib/video-editor/commercial-template-engine";
import {
  ensureVideoEditorStorage,
  getCopyPackAbsolutePath,
  getCopyPackRelativePath,
  updateJob,
} from "@/lib/video-editor/job-store";
import { touchJob } from "@/lib/video-editor/progress";
import type {
  VideoEditorCopyPack,
  VideoEditorFinalCopy,
  VideoEditorJob,
} from "@/lib/video-editor/types";

const fallbackTitle = "Video generado con Andres Video Studio";
const fallbackHook = "Tu video ya se edita en automatico";
const fallbackCta = "Sigueme para mas";
const maxCopyTextLength = 240;

export async function loadCopyPack(job: VideoEditorJob) {
  if (job.copyPack) {
    return normalizeCopyPack(job.copyPack, job);
  }

  try {
    const rawCopyPack = JSON.parse(
      await readFile(getCopyPackAbsolutePath(job.id), "utf8"),
    ) as unknown;

    return normalizeCopyPack(rawCopyPack, job);
  } catch {
    return createFallbackCopyPack(job);
  }
}

export async function prepareCopyPack(job: VideoEditorJob) {
  const copyPack = await loadCopyPack(job);

  await ensureVideoEditorStorage();
  await writeFile(
    getCopyPackAbsolutePath(job.id),
    JSON.stringify(copyPack, null, 2),
    "utf8",
  );

  return (
    (await updateJob(job.id, (currentJob) =>
      touchJob({
        ...currentJob,
        copyPack,
        copyPackPath: getCopyPackRelativePath(currentJob.id),
        generatedTitle: currentJob.generatedTitle ?? copyPack.title,
        generatedDescription:
          currentJob.generatedDescription ?? copyPack.description,
        generatedHashtags: currentJob.generatedHashtags?.length
          ? currentJob.generatedHashtags
          : copyPack.hashtags,
      }),
    )) ?? job
  );
}

export function normalizeFinalCopy(
  value: unknown,
  copyPack: VideoEditorCopyPack,
): VideoEditorFinalCopy {
  const candidate = toRecord(value);
  const selectedHook =
    normalizeText(candidate.selectedHook, 180) || copyPack.hooks[0] || fallbackHook;
  const selectedCta =
    normalizeText(candidate.selectedCta, 160) || copyPack.ctas[0] || fallbackCta;

  return {
    selectedHook,
    selectedCta,
    title: normalizeText(candidate.title, 100) || copyPack.title || fallbackTitle,
    description:
      normalizeMultilineText(candidate.description, 1_200) ||
      copyPack.description ||
      "",
    hashtags: parseHashtags(candidate.hashtags ?? copyPack.hashtags),
    source: candidate.source === "generated" ? "generated" : "edited",
    approvedAt: new Date().toISOString(),
  };
}

export async function saveFinalCopy(
  job: VideoEditorJob,
  value: unknown,
  copyPack?: VideoEditorCopyPack,
) {
  const availableCopyPack = copyPack ?? (await loadCopyPack(job));
  const finalCopy = normalizeFinalCopy(value, availableCopyPack);

  const nextJob = await updateJob(job.id, (currentJob) =>
    touchJob({
      ...currentJob,
      finalHookText: finalCopy.selectedHook,
      finalCtaText: finalCopy.selectedCta,
      hookText: finalCopy.selectedHook,
      ctaText: finalCopy.selectedCta,
      generatedTitle: finalCopy.title,
      generatedDescription: finalCopy.description,
      generatedHashtags: finalCopy.hashtags,
      finalCopy,
      status: "copy_approved",
      currentStep: "reviewing_copy",
      currentStepLabel: "Copy aprobado para render final",
      logs: [...currentJob.logs, "Copy revisado y aprobado por el usuario"],
      errorMessage: undefined,
    }),
  );

  return { finalCopy, job: nextJob };
}

export function resolveApprovedHookAndCta(job: VideoEditorJob) {
  const template = selectCommercialTemplate(job);

  return {
    hook:
      job.finalCopy?.selectedHook ||
      job.finalHookText ||
      template.hook ||
      fallbackHook,
    cta:
      job.finalCopy?.selectedCta ||
      job.finalCtaText ||
      template.cta ||
      fallbackCta,
  };
}

export function parseHashtags(value: unknown) {
  const tokens = Array.isArray(value)
    ? value.flatMap((item) => String(item).split(/[\s,]+/))
    : typeof value === "string"
      ? value.split(/[\s,]+/)
      : [];
  const unique = new Map<string, string>();

  for (const token of tokens) {
    const cleaned = token
      .trim()
      .replace(/[<>]/g, "")
      .replace(/^#+/, "")
      .replace(/[^\w-]/g, "")
      .slice(0, 48);

    if (!cleaned) {
      continue;
    }

    const hashtag = `#${cleaned}`;
    unique.set(hashtag.toLowerCase(), hashtag);
  }

  return [...unique.values()].slice(0, 30);
}

export function createFallbackCopyPack(job: VideoEditorJob): VideoEditorCopyPack {
  const template = selectCommercialTemplate(job);
  const hook = cleanCopyValue(job.finalHookText || job.hookText || template.hook) || fallbackHook;
  const cta = cleanCopyValue(job.finalCtaText || job.ctaText || template.cta) || fallbackCta;
  const transcriptLead = getTranscriptLead(job.transcriptionText);

  return {
    hooks: uniqueCopy([
      hook,
      transcriptLead ? `Mira esto: ${transcriptLead}` : template.hook,
      "Convierte este momento en contenido que vende",
      "Este clip merece verse hasta el final",
    ]).slice(0, 3),
    ctas: uniqueCopy([
      cta,
      template.cta,
      "Guarda este video y sigueme para mas",
    ]),
    title: cleanCopyValue(job.generatedTitle) || fallbackTitle,
    description: cleanCopyValue(job.generatedDescription) || "",
    hashtags: parseHashtags(job.generatedHashtags),
    summary: transcriptLead || null,
  };
}

function normalizeCopyPack(value: unknown, job: VideoEditorJob): VideoEditorCopyPack {
  const candidate = toRecord(value);
  const fallback = createFallbackCopyPack(job);
  const hooks = normalizeOptions(candidate.hooks ?? candidate.hookOptions, fallback.hooks);
  const ctas = normalizeOptions(candidate.ctas ?? candidate.ctaOptions, fallback.ctas);

  return {
    hooks: fillOptions(hooks, fallback.hooks, 3),
    ctas: fillOptions(ctas, fallback.ctas, 1),
    title: normalizeText(candidate.title, 100) || fallback.title,
    description:
      normalizeMultilineText(candidate.description, 1_200) ||
      fallback.description,
    hashtags: parseHashtags(candidate.hashtags ?? fallback.hashtags),
    summary:
      normalizeMultilineText(candidate.summary, 480) || fallback.summary || null,
  };
}

function normalizeOptions(value: unknown, fallback: string[]) {
  const options = Array.isArray(value) ? value : [];

  return uniqueCopy(
    options
      .map((item) => normalizeText(item, maxCopyTextLength))
      .filter((item): item is string => Boolean(item)),
  ).concat(fallback);
}

function fillOptions(options: string[], fallback: string[], minimum: number) {
  return uniqueCopy([...options, ...fallback]).slice(
    0,
    Math.max(minimum, options.length),
  );
}

function getTranscriptLead(value: string | null | undefined) {
  const text = normalizeText(value, 72);

  return text && text.length > 18 ? text : null;
}

function uniqueCopy(values: Array<string | null | undefined>) {
  const options = new Map<string, string>();

  for (const value of values) {
    const cleaned = cleanCopyValue(value);

    if (cleaned) {
      options.set(cleaned.toLowerCase(), cleaned);
    }
  }

  return [...options.values()];
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return cleanCopyValue(value).replace(/\s+/g, " ").slice(0, maxLength).trim();
}

function normalizeMultilineText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return cleanCopyValue(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, maxLength)
    .trim();
}

function cleanCopyValue(value: unknown) {
  return typeof value === "string"
    ? value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/[\u0000-\u001f]/g, " ").trim()
    : "";
}

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}
