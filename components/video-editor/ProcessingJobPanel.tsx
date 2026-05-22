"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { LiveLogsPanel } from "@/components/video-editor/LiveLogsPanel";
import { ProcessingTimeline } from "@/components/video-editor/ProcessingTimeline";
import { ProgressStatusCard } from "@/components/video-editor/ProgressStatusCard";
import type { VideoEditorJob } from "@/lib/video-editor/types";
import { getTemplateById } from "@/lib/video-editor/templates";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";

export function ProcessingJobPanel({ jobId }: { jobId: string }) {
  const router = useRouter();
  const processingStartedRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [job, setJob] = useState<VideoEditorJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function startProcessing() {
      try {
        const response = await fetch(
          `/api/video-editor/jobs/${encodeURIComponent(jobId)}/process`,
          { method: "POST" },
        );
        const payload = (await response.json()) as {
          error?: string;
          job?: VideoEditorJob;
        };

        if (!response.ok && response.status !== 202) {
          throw new Error(payload.error || "No se pudo iniciar el procesamiento.");
        }

        if (active && payload.job) {
          setJob(payload.job);
          setError(null);
        }
      } catch (processError) {
        if (active) {
          setError(
            processError instanceof Error
              ? processError.message
              : "No se pudo iniciar el procesamiento.",
          );
        }
      }
    }

    async function pollJob() {
      try {
        const response = await fetch(
          `/api/video-editor/jobs/${encodeURIComponent(jobId)}`,
          { cache: "no-store" },
        );
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

    pollJob();
    if (!processingStartedRef.current) {
      processingStartedRef.current = true;
      startProcessing();
    }
    const timer = window.setInterval(pollJob, 1500);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [jobId, retryAttempt]);

  // Auto-redirect to result page 2 seconds after completion
  useEffect(() => {
    if (job?.status === "completed") {
      redirectTimerRef.current = setTimeout(() => {
        router.push(`/video-editor/result?jobId=${encodeURIComponent(jobId)}`);
      }, 2000);
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [job?.status, jobId, router]);

  const template = getTemplateById(job?.templateId);
  const config = normalizeVideoEditorConfig(job?.config ?? {
    templateId: job?.templateId,
  });

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {error ? (
        <div className="rounded-[8px] border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-rose-100">
          {error}
        </div>
      ) : null}

      <ProgressStatusCard job={job} />

      <div className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.06] p-5 text-sm text-zinc-200 shadow-[0_28px_90px_-60px_rgba(0,0,0,1)] backdrop-blur-xl md:grid-cols-[0.7fr_1fr_1fr]">
        <p>
          <span className="block text-xs font-medium uppercase text-[#d6b26e]">
            Plantilla
          </span>
          <span className="mt-1 block text-base font-semibold text-white">
            {template.name}
          </span>
        </p>
        <p className="md:col-span-3">
          <span className="text-xs uppercase text-zinc-400">Preset</span>
          <span className="ml-2 text-zinc-200">
            {config.outputFormat} · subtítulos {config.subtitleStyle}
          </span>
        </p>
        <p>
          <span className="block text-xs uppercase text-zinc-400">Hook</span>
          <span className="mt-1 block">{job?.hookText || template.hook}</span>
        </p>
        <p>
          <span className="block text-xs uppercase text-zinc-400">CTA</span>
          <span className="mt-1 block">{job?.ctaText || template.cta}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
        <ProcessingTimeline job={job} />
        <LiveLogsPanel
          active={job?.status === "processing" || job?.status === "rendering_final"}
          logs={job?.logs ?? []}
        />
      </div>

      {job?.status === "failed" && job.errorMessage ? (
        <div className="rounded-[8px] border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-rose-100">
          <p className="text-xs font-medium uppercase text-rose-300">Error</p>
          <p className="mt-2">{job.errorMessage}</p>
        </div>
      ) : null}

      {job?.status === "completed" ? (
        <div className="rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-emerald-100">
          <p className="text-xs font-medium uppercase text-emerald-300">
            Completado
          </p>
          <p className="mt-2">
            Redirigiendo al resultado...
          </p>
        </div>
      ) : null}

      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        {job?.status === "awaiting_copy_review" ||
        job?.status === "copy_approved" ? (
          <Link
            href={`/video-editor/copy?jobId=${encodeURIComponent(jobId)}`}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#ecd3a3]/30 bg-[linear-gradient(135deg,#ead0a0,#b8853b)] px-7 text-base font-semibold text-zinc-950 shadow-[0_22px_80px_-28px_rgba(214,178,110,0.95)] transition hover:brightness-110 sm:w-auto"
          >
            Revisar copy
          </Link>
        ) : null}
        {job?.status === "completed" ? (
          <Link
            href={`/video-editor/result?jobId=${encodeURIComponent(jobId)}`}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#ecd3a3]/30 bg-[linear-gradient(135deg,#ead0a0,#b8853b)] px-7 text-base font-semibold text-zinc-950 shadow-[0_22px_80px_-28px_rgba(214,178,110,0.95)] transition hover:brightness-110 sm:w-auto"
          >
            Ver resultado
          </Link>
        ) : null}
        {job?.status === "failed" ? (
          <>
            <button
              className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#ecd3a3]/30 bg-[linear-gradient(135deg,#ead0a0,#b8853b)] px-7 text-base font-semibold text-zinc-950 sm:w-auto"
              onClick={() => {
                processingStartedRef.current = false;
                setRetryAttempt((attempt) => attempt + 1);
              }}
              type="button"
            >
              Reintentar
            </button>
            <Link
              href="/video-editor/library"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-7 text-base font-semibold text-white sm:w-auto"
            >
              Volver a biblioteca
            </Link>
          </>
        ) : null}
      </div>
    </section>
  );
}
