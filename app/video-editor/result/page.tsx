import Link from "next/link";
import path from "node:path";

import { ResultActions } from "@/components/video-editor/ResultActions";
import { ResultVideoPreview } from "@/components/video-editor/ResultVideoPreview";
import { VideoDetailsCard } from "@/components/video-editor/VideoDetailsCard";
import type { VideoDetail } from "@/lib/video-editor/mock-data";
import {
  fileHasContent,
  getSubtitleAbsolutePath,
  readJob,
} from "@/lib/video-editor/job-store";
import { resolveFinalVideoFile } from "@/lib/video-editor/file-response";
import { getTemplateById } from "@/lib/video-editor/templates";
import {
  getCommercialPresetById,
  isValidCommercialPreset,
} from "@/lib/video-editor/commercial-presets";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import {
  getExportQualityProfile,
  getOutputFormatProfile,
} from "@/lib/video-editor/export-profiles";
import { getPlatformPresetById } from "@/lib/video-editor/platform-presets";

type VideoResultPageProps = {
  searchParams: Promise<{ jobId?: string | string[] }>;
};

export default async function VideoResultPage({
  searchParams,
}: VideoResultPageProps) {
  const jobId = getSearchValue((await searchParams).jobId);
  const job = jobId ? await readJob(jobId) : null;

  if (!job) {
    return (
      <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-[8px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_34px_120px_-70px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-medium uppercase text-[#d6b26e]">
            Resultado no disponible
          </p>
          <h1 className="text-3xl font-semibold text-white">
            No se encontró el job solicitado.
          </h1>
          <Link
            href="/video-editor"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#ecd3a3]/30 bg-[linear-gradient(135deg,#ead0a0,#b8853b)] px-7 text-base font-semibold text-zinc-950 sm:w-fit"
          >
            Volver al editor
          </Link>
        </section>
      </main>
    );
  }

  const finalVideo = await resolveFinalVideoFile(job);
  const outputAvailable = Boolean(finalVideo);
  const subtitlesAvailable = Boolean(
    job.subtitlesPath && (await fileHasContent(getSubtitleAbsolutePath(job.id))),
  );
  const outputFileName = finalVideo
    ? path.basename(finalVideo.absolutePath)
    : "Pendiente";
  const template = getTemplateById(job.templateId);
  const config = normalizeVideoEditorConfig(job.config ?? {
    templateId: job.templateId,
  });
  const formatProfile = getOutputFormatProfile(config.outputFormat);
  const qualityProfile = getExportQualityProfile(config.exportQuality);
  const metrics = job.metrics;
  const presetLabel =
    config.platformPreset === "custom"
      ? "Personalizado"
      : getPlatformPresetById(config.platformPreset).label;
  const presetBadge =
    config.platformPreset === "custom"
      ? "Custom"
      : getPlatformPresetById(config.platformPreset).badge;
  const commercialPresetLabel = isValidCommercialPreset(config.commercialPreset)
    ? getCommercialPresetById(config.commercialPreset).label
    : "Personalizado";
  const finalHook =
    job.finalCopy?.selectedHook || job.finalHookText || job.hookText || "Pendiente";
  const finalCta =
    job.finalCopy?.selectedCta || job.finalCtaText || job.ctaText || "Pendiente";

  const details: VideoDetail[] = [
    { label: "Job ID", value: job.id },
    { label: "Preset comercial", value: commercialPresetLabel },
    { label: "Nombre original", value: job.originalFileName },
    { label: "Archivo final", value: outputFileName },
    {
      label: "Plataforma",
      value: `${presetLabel} (${presetBadge})`,
    },
    {
      label: "Formato usado",
      value: `${formatProfile.label} (${formatProfile.aspectRatio})`,
    },
    {
      label: "Resolución final",
      value: `${metrics?.outputWidth ?? formatProfile.width}x${metrics?.outputHeight ?? formatProfile.height}`,
    },
    {
      label: "Calidad usada",
      value: qualityProfile.label,
    },
    {
      label: "CRF",
      value: String(metrics?.outputCrf ?? qualityProfile.crf),
    },
    {
      label: "Preset",
      value: metrics?.outputPreset ?? qualityProfile.preset,
    },
    {
      label: "Audio bitrate",
      value: metrics?.outputAudioBitrate ?? qualityProfile.audioBitrate,
    },
    {
      label: "Tamaño final",
      value: metrics?.finalFileSizeLabel ?? "Pendiente",
    },
    {
      label: "Plataformas",
      value: formatProfile.platformHints,
    },
    {
      label: "Ruta output local",
      value: finalVideo?.relativePath || "Pendiente",
    },
    {
      label: "Duración original",
      value: formatSeconds(job.originalDuration),
    },
    {
      label: "Duración final",
      value: formatSeconds(job.finalEstimatedDuration),
    },
    {
      label: "Silencios detectados",
      value: String(job.detectedSilencesCount ?? "Pendiente"),
    },
    {
      label: "Segundos eliminados",
      value: formatSeconds(job.removedSeconds),
    },
    {
      label: "Fillers detectados",
      value: String(job.fillersCount ?? "Pendiente"),
    },
    {
      label: "Segundos eliminados por fillers",
      value: formatSeconds(job.fillerRemovedSeconds),
    },
    { label: "Plantilla usada", value: template.name },
    { label: "Estilo de subtítulos", value: config.subtitleStyle },
    {
      label: "Hook final usado",
      value: finalHook,
    },
    {
      label: "CTA final usado",
      value: finalCta,
    },
    {
      label: "Titulo final",
      value: job.finalCopy?.title || job.generatedTitle || "Pendiente",
    },
    {
      label: "Descripcion final",
      value: job.finalCopy?.description || job.generatedDescription || "Sin descripcion",
    },
    {
      label: "Hashtags finales",
      value:
        job.finalCopy?.hashtags.join(" ") ||
        job.generatedHashtags?.join(" ") ||
        "Sin hashtags",
    },
    {
      label: "Origen del copy",
      value:
        job.finalCopy?.source === "edited"
          ? "Copy editado manualmente"
          : "Copy automatico",
    },
    {
      label: "Recorte de silencios",
      value: formatToggle(config.trimSilences),
    },
    {
      label: "Limpieza de fillers",
      value: formatToggle(config.removeFillers),
    },
    { label: "Motion graphics", value: formatToggle(config.motionEnabled) },
    { label: "Motor motion", value: job.motionEngine || "Pendiente" },
    {
      label: "Warnings motion",
      value: job.motionWarnings?.join(" ") || "Sin warnings",
    },
    { label: "Idioma", value: job.language || "Pendiente" },
    {
      label: "ASS creado",
      value: subtitlesAvailable ? "Disponible" : "Pendiente",
    },
    { label: "Estado", value: job.status },
  ];

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto grid w-full max-w-7xl items-start gap-6 lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
        <ResultVideoPreview
          outputAvailable={outputAvailable}
          videoSrc={`/api/video-editor/jobs/${encodeURIComponent(job.id)}/video`}
        />

        <div className="flex flex-col gap-6">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_28px_110px_-56px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-emerald-200 shadow-[0_0_50px_-14px_rgba(110,231,183,0.75)]">
              <svg
                aria-hidden="true"
                className="size-8"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m5 12 4 4L19 6"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
              {outputAvailable ? "Tu vídeo está listo." : "El vídeo sigue pendiente."}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              {outputAvailable
                ? "Ya puedes revisarlo, descargarlo o crear otro vídeo."
                : "El vídeo final todavía no está disponible."}
            </p>

            <div className="mt-8">
              <ResultActions
                jobId={job.id}
                outputAvailable={outputAvailable}
                outputPath={finalVideo?.relativePath || null}
              />
            </div>
          </div>

          {config.mode === "barberiaos" ? (
            <section className="rounded-[8px] border border-[#efd8ad]/20 bg-[linear-gradient(135deg,rgba(214,178,110,0.13),rgba(255,255,255,0.05))] p-6 shadow-[0_28px_100px_-68px_rgba(0,0,0,1)] backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase text-[#efd8ad]">
                Vídeo creado para BarberíaOS Content Studio
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {commercialPresetLabel}
              </h2>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <BarberiaResultLine label="Hook final" value={finalHook} />
                <BarberiaResultLine label="CTA final" value={finalCta} />
                <BarberiaResultLine label="Plataforma" value={presetLabel} />
                <BarberiaResultLine
                  label="Caso de uso comercial"
                  value={commercialPresetLabel}
                />
              </dl>
              <p className="mt-5 rounded-[8px] border border-white/10 bg-black/22 px-4 py-3 text-sm leading-6 text-zinc-200">
                Publícalo en Instagram Reels, TikTok o WhatsApp y añade tu
                link/QR de reservas.
              </p>
              {outputAvailable ? (
                <a
                  className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/32 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-5 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
                  href={`/api/video-editor/jobs/${encodeURIComponent(job.id)}/download`}
                >
                  Descargar vídeo
                </a>
              ) : null}
            </section>
          ) : null}

          <VideoDetailsCard details={details} />
        </div>
      </section>
    </main>
  );
}

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatSeconds(value: number | null | undefined) {
  return typeof value === "number" ? `${value.toFixed(2)}s` : "Pendiente";
}

function formatToggle(value: boolean) {
  return value ? "Activo" : "Inactivo";
}

function BarberiaResultLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-2 break-words font-medium text-zinc-100">{value}</dd>
    </div>
  );
}
