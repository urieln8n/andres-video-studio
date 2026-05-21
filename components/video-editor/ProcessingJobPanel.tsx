"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { LiveLogsPanel } from "@/components/video-editor/LiveLogsPanel";
import { ProcessingPhaseList } from "@/components/video-editor/ProcessingPhaseList";
import { ProgressStatusCard } from "@/components/video-editor/ProgressStatusCard";
import type {
  LiveLog,
  ProcessingPhase,
  ProcessingStatus,
} from "@/lib/video-editor/mock-data";
import type { VideoEditorJob } from "@/lib/video-editor/types";

const phases = [
  { label: "Subida y guardado", progress: 0 },
  { label: "Validación local", progress: 12 },
  { label: "Detección de silencios", progress: 18 },
  { label: "Plan de edición", progress: 26 },
  { label: "Recorte limpio", progress: 34 },
  { label: "Audio WAV", progress: 42 },
  { label: "Transcripción Whisper", progress: 50 },
  { label: "Render FFmpeg 9:16", progress: 66 },
  { label: "Subtítulos premium ASS", progress: 74 },
  { label: "Quemado de subtítulos", progress: 90 },
  { label: "Vídeo final", progress: 100 },
] as const;

export function ProcessingJobPanel({ jobId }: { jobId: string }) {
  const processingStartedRef = useRef(false);
  const [job, setJob] = useState<VideoEditorJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function processJob() {
      try {
        const response = await fetch(
          `/api/video-editor/jobs/${encodeURIComponent(jobId)}/process`,
          { method: "POST" },
        );
        const payload = (await response.json()) as {
          error?: string;
          job?: VideoEditorJob;
        };

        if (!response.ok || !payload.job) {
          throw new Error(payload.error || "No se pudo procesar el job.");
        }

        if (active) {
          setJob(payload.job);
          setError(null);
        }
      } catch (processError) {
        if (active) {
          setError(
            processError instanceof Error
              ? processError.message
              : "No se pudo procesar el job.",
          );
        }
      }
    }

    async function loadJob() {
      try {
        const response = await fetch(`/api/video-editor/jobs/${jobId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          error?: string;
          job?: VideoEditorJob;
        };

        if (!response.ok || !payload.job) {
          throw new Error(payload.error || "No se pudo consultar el job.");
        }

        if (active) {
          setJob(payload.job);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo consultar el job.",
          );
        }
      }
    }

    loadJob();
    if (!processingStartedRef.current) {
      processingStartedRef.current = true;
      processJob();
    }
    const timer = window.setInterval(loadJob, 1200);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [jobId]);

  const status = useMemo(() => buildStatus(job), [job]);
  const phaseList = useMemo(() => buildPhases(job?.progress ?? 0), [job]);
  const logs = useMemo(() => buildLogs(job), [job]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {error ? (
        <div className="rounded-[8px] border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-rose-100">
          {error}
        </div>
      ) : null}

      <ProgressStatusCard status={status} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
        <ProcessingPhaseList phases={phaseList} />
        <LiveLogsPanel logs={logs} />
      </div>

      <div className="flex justify-end">
        {job?.status === "completed" ? (
          <Link
            href={`/video-editor/result?jobId=${encodeURIComponent(jobId)}`}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#ecd3a3]/30 bg-[linear-gradient(135deg,#ead0a0,#b8853b)] px-7 text-base font-semibold text-zinc-950 shadow-[0_22px_80px_-28px_rgba(214,178,110,0.95)] transition hover:brightness-110 sm:w-auto"
          >
            Ver resultado
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function buildStatus(job: VideoEditorJob | null): ProcessingStatus {
  if (!job) {
    return {
      eta: "--",
      message: "Consultando job",
      progress: 0,
    };
  }

  return {
    eta: job.status === "completed" ? "0s" : "--",
    message: job.currentStep,
    progress: job.progress,
  };
}

function buildPhases(progress: number): ProcessingPhase[] {
  const currentIndex = phases.findLastIndex((phase) => progress >= phase.progress);

  return phases.map((phase, index) => ({
    step: String(index + 1),
    label: phase.label,
    status:
      progress >= 100 || index < currentIndex
        ? "completed"
        : index === Math.max(currentIndex, 0)
          ? "current"
          : "upcoming",
  }));
}

function buildLogs(job: VideoEditorJob | null): LiveLog[] {
  if (!job) {
    return [
      {
        time: "00:00",
        message: "Esperando estado del job...",
        active: true,
      },
    ];
  }

  return job.logs.map((message, index) => ({
    time: `00:${String(index * 3 + 1).padStart(2, "0")}`,
    message,
    active: index === job.logs.length - 1 && job.status !== "completed",
  }));
}
