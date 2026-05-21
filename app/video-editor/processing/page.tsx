import Link from "next/link";

import { ProcessingJobPanel } from "@/components/video-editor/ProcessingJobPanel";

type ProcessingPageProps = {
  searchParams: Promise<{ jobId?: string | string[] }>;
};

export default async function ProcessingPage({
  searchParams,
}: ProcessingPageProps) {
  const jobId = getSearchValue((await searchParams).jobId);

  if (!jobId) {
    return (
      <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-[8px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_34px_120px_-70px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-medium uppercase text-[#d6b26e]">
            Job requerido
          </p>
          <h1 className="text-3xl font-semibold text-white">
            No hay un job para procesar.
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

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <ProcessingJobPanel jobId={jobId} />
    </main>
  );
}

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
