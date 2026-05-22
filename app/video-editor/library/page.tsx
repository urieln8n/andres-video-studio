import Link from "next/link";

import { VideoLibraryGrid } from "@/components/video-editor/VideoLibraryGrid";
import { resolveFinalVideoFile } from "@/lib/video-editor/file-response";
import { listJobs } from "@/lib/video-editor/job-store";
import type { VideoEditorLibraryJob } from "@/lib/video-editor/types";

export const dynamic = "force-dynamic";

export default async function VideoEditorLibraryPage() {
  const jobs = await listJobs();
  const libraryJobs = await Promise.all(
    jobs.map(async (job) => ({
      ...job,
      hasFinalVideo: Boolean(await resolveFinalVideoFile(job)),
    })),
  );

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-7">
        <header className="flex flex-col gap-5 rounded-[8px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_36px_120px_-76px_rgba(0,0,0,1)] backdrop-blur-xl md:flex-row md:items-end md:justify-between sm:p-8">
          <div>
            <p className="text-xs font-medium uppercase text-[#d6b26e]">
              Andrés Video Studio
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-6xl">
              Biblioteca de vídeos
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
              Revisa, descarga o vuelve a procesar tus vídeos creados con
              Andrés Video Studio.
            </p>
          </div>
          <Link
            href="/video-editor"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-6 font-semibold text-zinc-950 shadow-[0_22px_80px_-36px_rgba(214,178,110,0.95)] transition hover:brightness-110 md:w-auto"
          >
            Nuevo vídeo
          </Link>
        </header>

        <VideoLibraryGrid
          initialJobs={libraryJobs satisfies VideoEditorLibraryJob[]}
        />
      </section>
    </main>
  );
}
