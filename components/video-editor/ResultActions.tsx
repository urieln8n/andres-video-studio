import Link from "next/link";

export function ResultActions({
  jobId,
  outputAvailable,
  outputPath,
}: {
  jobId: string;
  outputAvailable: boolean;
  outputPath: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {outputAvailable ? (
        <a
          href={`/api/video-editor/jobs/${encodeURIComponent(jobId)}/download`}
          className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-5 text-base font-semibold text-zinc-950 shadow-[0_22px_80px_-36px_rgba(214,178,110,0.95)] transition hover:brightness-110"
        >
          Descargar vídeo
        </a>
      ) : (
        <span className="inline-flex min-h-14 cursor-not-allowed items-center justify-center rounded-[8px] border border-white/10 bg-white/10 px-5 text-base font-semibold text-zinc-400">
          Descargar vídeo
        </span>
      )}
      <Link
        href="/video-editor"
        className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.08] px-5 text-base font-semibold text-white transition hover:bg-white/[0.13]"
      >
        Editar otro vídeo
      </Link>
      <Link
        href={`/video-editor/processing?jobId=${encodeURIComponent(jobId)}`}
        className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-white/15 bg-transparent px-5 text-base font-semibold text-zinc-100 transition hover:border-[#efd8ad]/30 hover:text-[#efd8ad] sm:col-span-2 xl:col-span-1"
      >
        Volver al procesamiento
      </Link>
      <p className="text-sm leading-6 text-zinc-300 sm:col-span-2 xl:col-span-3">
        {outputAvailable && outputPath
          ? `Archivo final disponible en ${outputPath}.`
          : "El vídeo final todavía no está disponible."}
      </p>
    </div>
  );
}
