import type { VideoDetail } from "@/lib/video-editor/mock-data";

export function VideoDetailsCard({ details }: { details: VideoDetail[] }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_28px_100px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <p className="text-xs font-medium uppercase text-zinc-400">
        Exportación
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        Detalles del vídeo
      </h2>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-4"
          >
            <dt className="text-sm text-zinc-400">{detail.label}</dt>
            <dd className="mt-2 break-words text-base font-medium text-zinc-100">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
