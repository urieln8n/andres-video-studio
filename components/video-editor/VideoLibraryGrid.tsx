"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  LibraryFilters,
  type LibraryFilter,
} from "@/components/video-editor/LibraryFilters";
import { VideoJobCard } from "@/components/video-editor/VideoJobCard";
import type { VideoEditorLibraryJob } from "@/lib/video-editor/types";

export function VideoLibraryGrid({
  initialJobs,
}: {
  initialJobs: VideoEditorLibraryJob[];
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleJobs = useMemo(
    () =>
      jobs.filter(
        (job) => matchesFilter(job, filter) && matchesSearch(job, search),
      ),
    [filter, jobs, search],
  );

  async function deleteJob(jobId: string) {
    if (!window.confirm("¿Borrar este job y sus artefactos locales?")) {
      return;
    }

    setDeletingId(jobId);
    setError(null);

    try {
      const response = await fetch(
        `/api/video-editor/jobs/${encodeURIComponent(jobId)}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo borrar el job.");
      }

      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo borrar el job.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (jobs.length === 0) {
    return <EmptyLibrary />;
  }

  return (
    <section className="flex flex-col gap-5">
      <LibraryFilters
        filter={filter}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        search={search}
      />
      {error ? (
        <p className="rounded-[8px] border border-rose-200/20 bg-rose-200/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      {visibleJobs.length ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => (
            <VideoJobCard
              key={job.id}
              deleting={deletingId === job.id}
              job={job}
              onDelete={deleteJob}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-[8px] border border-white/10 bg-white/[0.055] px-5 py-8 text-center text-zinc-300">
          No hay vídeos que coincidan con el filtro o la búsqueda.
        </p>
      )}
    </section>
  );
}

function EmptyLibrary() {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.065] p-8 text-center shadow-[0_36px_120px_-76px_rgba(0,0,0,1)] backdrop-blur-xl">
      <p className="text-xs font-medium uppercase text-[#d6b26e]">
        Biblioteca vacía
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">
        Todavía no tienes vídeos procesados
      </h2>
      <Link
        href="/video-editor"
        className="mt-6 inline-flex min-h-14 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-6 font-semibold text-zinc-950"
      >
        Crear mi primer vídeo
      </Link>
    </section>
  );
}

function matchesFilter(job: VideoEditorLibraryJob, filter: LibraryFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "pending") {
    return (
      job.status === "uploaded" ||
      job.status === "processing" ||
      job.status === "rendering_final" ||
      job.status === "awaiting_copy_review" ||
      job.status === "copy_approved"
    );
  }

  return job.status === filter;
}

function matchesSearch(job: VideoEditorLibraryJob, search: string) {
  const query = normalize(search);

  if (!query) {
    return true;
  }

  return normalize(
    [
      job.originalFileName,
      job.templateId,
      job.config?.templateId,
      job.hookText,
      job.ctaText,
    ]
      .filter(Boolean)
      .join(" "),
  ).includes(query);
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
