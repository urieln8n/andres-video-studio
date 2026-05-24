import { getQrPreviewPositionClass, QrPreviewCard } from "@/components/video-editor/QrPreviewCard";
import type { VideoEditorBarberiaOSConfig } from "@/lib/video-editor/types";

export function BarberiaOSPreviewMock({
  barberiaos,
}: {
  barberiaos: VideoEditorBarberiaOSConfig;
}) {
  return (
    <section className="grid items-center gap-6 rounded-[8px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_34px_120px_-82px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.55fr)]">
      <div>
        <p className="text-xs font-medium uppercase text-[#d6b26e]">
          QR y reserva visibles
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
          El reel ya nace con intención comercial.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
          Usa un vídeo del corte, del local o de una promoción. El resultado
          combina hook, subtítulos, CTA y QR para llevar al cliente a reservar.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Huecos libres", "Antes/después", "Promociones", "Reseñas"].map((item) => (
            <span
              className="rounded-[8px] border border-white/10 bg-black/24 px-3 py-1 text-xs font-semibold uppercase text-zinc-300"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[20rem] rounded-[32px] border border-white/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] p-2 shadow-[0_38px_110px_-48px_rgba(0,0,0,1)]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[26px] border border-black/40 bg-[linear-gradient(145deg,#090807,#21180f_46%,#111924)]">
          <div className="absolute inset-0 opacity-85 [background:radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(125deg,transparent_15%,rgba(214,178,110,0.22)_48%,transparent_78%)]" />
          <div className="absolute inset-x-[9%] top-[13%] rounded-[8px] border border-[#efd8ad]/28 bg-black/48 p-4 backdrop-blur">
            <span className="block h-1 w-14 rounded-full bg-[#d6b26e]" />
            <p className="mt-3 text-xl font-semibold leading-tight text-white">
              Hoy tenemos huecos disponibles
            </p>
          </div>
          <p className="absolute inset-x-[13%] bottom-[30%] rounded-[8px] border border-white/12 bg-black/65 px-3 py-2 text-center text-sm font-bold text-white">
            Escanea y reserva tu cita
          </p>
          <div className={`absolute ${getQrPreviewPositionClass(barberiaos.qrPosition)}`}>
            <QrPreviewCard barberiaos={barberiaos} compact />
          </div>
        </div>
      </div>
    </section>
  );
}
