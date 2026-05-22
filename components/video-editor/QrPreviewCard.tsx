import type {
  VideoEditorBarberiaOSConfig,
  VideoEditorBarberiaOSQrPosition,
} from "@/lib/video-editor/types";

export function QrPreviewCard({
  barberiaos,
  compact = false,
}: {
  barberiaos: VideoEditorBarberiaOSConfig;
  compact?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-3 rounded-[8px] border border-[#efd8ad]/25 bg-black/48 backdrop-blur ${
        compact ? "grid-cols-[1fr_auto] p-2.5" : "grid-cols-[1fr_auto] p-4"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase text-[#efd8ad]">
          {barberiaos.barbershopName || "Tu barbería"}
        </p>
        <p className={`mt-1 font-semibold text-white ${compact ? "text-xs" : "text-sm"}`}>
          {barberiaos.qrCtaText}
        </p>
        <p className="mt-1 truncate text-[11px] text-zinc-300">
          {shortBookingUrl(barberiaos.bookingUrl)}
        </p>
      </div>
      <QrPattern value={barberiaos.bookingUrl || barberiaos.qrCtaText} compact={compact} />
    </div>
  );
}

export function getQrPreviewPositionClass(position: VideoEditorBarberiaOSQrPosition) {
  if (position === "bottom_right") {
    return "bottom-[11%] left-[48%] right-[7%]";
  }

  if (position === "bottom_center") {
    return "bottom-[11%] inset-x-[10%]";
  }

  return "bottom-[9%] inset-x-[8%]";
}

function QrPattern({ compact, value }: { compact: boolean; value: string }) {
  const cells = Array.from({ length: 36 }, (_, index) => {
    const x = index % 6;
    const y = Math.floor(index / 6);
    const finder =
      (x < 2 && y < 2) || (x > 3 && y < 2) || (x < 2 && y > 3);
    const seed = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);

    return finder || (seed + index * 13 + x * y) % 5 < 2;
  });

  return (
    <span
      aria-label={value ? "QR visual de reserva" : "QR simulado"}
      className={`relative grid shrink-0 grid-cols-6 gap-0.5 rounded-[8px] border border-white/15 bg-white p-2 ${
        compact ? "size-14" : "size-20"
      }`}
    >
      {cells.map((active, index) => (
        <span key={index} className={active ? "bg-zinc-950" : "bg-white"} />
      ))}
      <span className="absolute inset-x-0 bottom-0 bg-white/90 text-center text-[8px] font-bold text-zinc-950">
        QR
      </span>
    </span>
  );
}

function shortBookingUrl(value: string | null) {
  if (!value) {
    return "QR simulado hasta añadir tu link";
  }

  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`.slice(0, 48);
  } catch {
    return "Link de reserva";
  }
}
