import Link from "next/link";

export function ResultActions({
  outputAvailable,
  outputPath,
}: {
  outputAvailable: boolean;
  outputPath: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <button
        className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-5 text-base font-semibold text-zinc-950 shadow-[0_22px_80px_-36px_rgba(214,178,110,0.95)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-none disabled:bg-white/10 disabled:text-zinc-400 disabled:shadow-none"
        disabled
        type="button"
      >
        Descargar vídeo
      </button>
      <button
        className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.08] px-5 text-base font-semibold text-white transition hover:bg-white/[0.13]"
        type="button"
      >
        Mostrar en carpeta
      </button>
      <Link
        href="/video-editor"
        className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-white/15 bg-transparent px-5 text-base font-semibold text-zinc-100 transition hover:border-[#efd8ad]/30 hover:text-[#efd8ad] sm:col-span-2 xl:col-span-1"
      >
        Editar otro vídeo
      </Link>
      <p className="text-sm leading-6 text-zinc-300 sm:col-span-2 xl:col-span-3">
        {outputAvailable && outputPath
          ? `Archivo final disponible en ${outputPath}.`
          : "El archivo final todavía no existe en storage/output."}
      </p>
    </div>
  );
}
