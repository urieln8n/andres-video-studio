"use client";

import Link from "next/link";

import { getCommercialPresetById, isValidCommercialPreset } from "@/lib/video-editor/commercial-presets";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import {
  getExportQualityProfile,
  getOutputFormatProfile,
} from "@/lib/video-editor/export-profiles";
import { getPlatformPresetById } from "@/lib/video-editor/platform-presets";
import { getTemplateById } from "@/lib/video-editor/templates";
import type { VideoEditorLibraryJob } from "@/lib/video-editor/types";

export function VideoJobCard({
  deleting,
  job,
  onDelete,
}: {
  deleting: boolean;
  job: VideoEditorLibraryJob;
  onDelete: (jobId: string) => void;
}) {
  const config = normalizeVideoEditorConfig(job.config ?? {
    templateId: job.templateId,
  });
  const template = getTemplateById(config.templateId);
  const formatProfile = getOutputFormatProfile(config.outputFormat);
  const qualityProfile = getExportQualityProfile(config.exportQuality);
  const commercialPresetLabel = isValidCommercialPreset(config.commercialPreset)
    ? getCommercialPresetById(config.commercialPreset).label
    : "Personalizado";
  const canProcess = job.status === "uploaded" || job.status === "failed";
  const canDownload = job.status === "completed" && job.hasFinalVideo;

  return (
    <article className="flex min-h-[31rem] flex-col rounded-[8px] border border-white/10 bg-white/[0.065] p-5 shadow-[0_32px_110px_-74px_rgba(0,0,0,1)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-[#d6b26e]">
            {template.name}
          </p>
          <h2 className="mt-2 break-words text-xl font-semibold text-white">
            {job.originalFileName}
          </h2>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <dl className="mt-5 grid gap-2 text-sm">
        <Meta label="Preset" value={commercialPresetLabel} />
        <Meta label="Creado" value={formatDate(job.createdAt)} />
        <Meta
          label="Plataforma"
          value={
            config.platformPreset === "custom"
              ? "Personalizado"
              : getPlatformPresetById(config.platformPreset).label
          }
        />
        <Meta
          label="Formato"
          value={`${formatProfile.label} · ${formatProfile.width}x${formatProfile.height}`}
        />
        <Meta label="Calidad" value={qualityProfile.label} />
        {job.metrics?.finalFileSizeLabel ? (
          <Meta label="Tamaño" value={job.metrics.finalFileSizeLabel} />
        ) : null}
      </dl>

      <div className="mt-4 rounded-[8px] border border-white/[0.08] bg-black/20 p-3 text-sm text-zinc-300">
        {job.hasFinalVideo
          ? "Vídeo final disponible para preview y descarga."
          : job.status === "processing"
            ? `Procesando: ${job.progress}% · ${job.currentStepLabel || job.currentStep}`
            : job.status === "failed" && job.errorMessage
              ? job.errorMessage
              : "Todavía no hay un MP4 final disponible."}
        {job.status === "processing" ? (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-white/10 bg-black/35">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8f6736,#efd8ad,#c68a3d)] transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <Link
          href={`/video-editor/result?jobId=${encodeURIComponent(job.id)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[#d6b26e]/15 px-3 text-sm font-semibold text-[#efd8ad] transition hover:bg-[#d6b26e]/25"
        >
          Ver resultado
        </Link>
        {job.status === "processing" ? (
          <Link
            href={`/video-editor/processing?jobId=${encodeURIComponent(job.id)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-3 text-sm font-semibold text-white transition hover:bg-white/[0.13]"
          >
            Ver progreso
          </Link>
        ) : null}
        {canProcess ? (
          <Link
            href={`/video-editor/processing?jobId=${encodeURIComponent(job.id)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-3 text-sm font-semibold text-white transition hover:bg-white/[0.13]"
          >
            {job.status === "failed" ? "Reintentar" : "Procesar"}
          </Link>
        ) : null}
        {canDownload ? (
          <a
            href={`/api/video-editor/jobs/${encodeURIComponent(job.id)}/download`}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-emerald-200/20 bg-emerald-200/10 px-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-200/15"
          >
            Descargar
          </a>
        ) : null}
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-rose-200/15 bg-rose-200/[0.08] px-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-200/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={deleting}
          onClick={() => onDelete(job.id)}
          type="button"
        >
          {deleting ? "Borrando..." : "Borrar"}
        </button>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-[8px] border border-white/[0.06] bg-black/15 px-3 py-2 sm:grid-cols-[6.2rem_1fr]">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="break-words text-zinc-100">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: VideoEditorLibraryJob["status"] }) {
  const styles = {
    completed: "border-emerald-200/20 bg-emerald-200/10 text-emerald-100",
    failed: "border-rose-200/20 bg-rose-200/10 text-rose-100",
    processing: "border-[#efd8ad]/25 bg-[#d6b26e]/12 text-[#efd8ad]",
    uploaded: "border-sky-200/20 bg-sky-200/10 text-sky-100",
  };

  return (
    <span
      className={`shrink-0 rounded-[8px] border px-2.5 py-1 text-xs font-semibold uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(value: string) {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp)
    ? "Pendiente"
    : new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(timestamp);
}
