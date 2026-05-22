import Link from "next/link";
import path from "node:path";

import { ResultActions } from "@/components/video-editor/ResultActions";
import { ResultVideoPreview } from "@/components/video-editor/ResultVideoPreview";
import { VideoDetailsCard } from "@/components/video-editor/VideoDetailsCard";
import type { VideoDetail } from "@/lib/video-editor/mock-data";
import {
  fileHasContent,
  getOutputAbsolutePathFromRelative,
  getSubtitleAbsolutePath,
  readJob,
} from "@/lib/video-editor/job-store";

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

  const outputAvailable = Boolean(
    job.outputPath &&
      (await fileHasContent(getOutputAbsolutePathFromRelative(job.outputPath))),
  );
  const subtitlesAvailable = Boolean(
    job.subtitlesPath && (await fileHasContent(getSubtitleAbsolutePath(job.id))),
  );
  const outputFileName = job.outputPath
    ? path.posix.basename(job.outputPath)
    : "Pendiente";
  const details: VideoDetail[] = [
    { label: "Job ID", value: job.id },
    { label: "Archivo subido", value: job.originalFileName },
    { label: "Archivo guardado", value: job.storedFileName },
    { label: "Input", value: job.inputPath },
    { label: "Vídeo limpio", value: job.cleanVideoPath || "Pendiente" },
    { label: "Plan de edición", value: job.editPlanPath || "Pendiente" },
    {
      label: "Plan de fillers",
      value: job.fillerPlanPath || "Pendiente",
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
    {
      label: "Vídeo limpio de fillers",
      value: job.fillerCleanVideoPath || "Pendiente",
    },
    {
      label: "Duración original",
      value: formatSeconds(job.originalDuration),
    },
    {
      label: "Duración estimada final",
      value: formatSeconds(job.finalEstimatedDuration),
    },
    { label: "Output", value: job.outputPath || "Pendiente" },
    { label: "Transcript", value: job.transcriptPath || "Pendiente" },
    {
      label: "Transcript final",
      value: job.finalTranscriptPath || "Pendiente",
    },
    { label: "Idioma", value: job.language || "Pendiente" },
    {
      label: "Texto transcrito",
      value: job.transcriptionText || "Usando segmentos mock",
    },
    { label: "Subtítulos ASS", value: job.subtitlesPath || "Pendiente" },
    {
      label: "Archivo final",
      value: outputAvailable ? outputFileName : "Pendiente",
    },
    {
      label: "ASS creado",
      value: subtitlesAvailable ? "Disponible" : "Pendiente",
    },
    { label: "Formato", value: "9:16 vertical FFmpeg con subtítulos" },
    { label: "Estado", value: job.status },
    { label: "Paso actual", value: job.currentStep },
  ];

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto grid w-full max-w-7xl items-start gap-6 lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
        <ResultVideoPreview />

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
                ? "El render final ya existe en el storage local."
                : "El job existe, pero todavía no hay un archivo final válido."}
            </p>

            <div className="mt-8">
              <ResultActions
                outputAvailable={outputAvailable}
                outputPath={job.outputPath}
              />
            </div>
          </div>

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
