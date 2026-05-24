"use client";

import Link from "next/link";

import { QrPreviewCard } from "@/components/video-editor/QrPreviewCard";
import type {
  VideoEditorBarberiaOSConfig,
  VideoEditorCommercialPresetId,
} from "@/lib/video-editor/types";

export function BarberiaOSQrPanel({
  barberiaos,
  onChange,
  presetId = "barberia_qr_reservas",
  showOverlayControls = false,
  showStartAction = false,
}: {
  barberiaos: VideoEditorBarberiaOSConfig;
  onChange: (value: VideoEditorBarberiaOSConfig) => void;
  presetId?: VideoEditorCommercialPresetId;
  showOverlayControls?: boolean;
  showStartAction?: boolean;
}) {
  function update(value: Partial<VideoEditorBarberiaOSConfig>) {
    onChange({ ...barberiaos, ...value });
  }

  return (
    <section className="grid gap-5 rounded-[8px] border border-[#efd8ad]/18 bg-white/[0.065] p-5 shadow-[0_28px_100px_-72px_rgba(0,0,0,1)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.52fr)]">
      <div>
        <p className="text-xs font-medium uppercase text-[#d6b26e]">
          Reserva por QR
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Conecta tu reserva por QR
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Pega aquí el link público de reservas de tu barbería. Lo usaremos
          para generar un QR visual en el vídeo.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Field
            label="Nombre de la barbería"
            maxLength={80}
            onChange={(barbershopName) => update({ barbershopName })}
            placeholder="Tu barbería"
            value={barberiaos.barbershopName || ""}
          />
          <Field
            label="Link de reserva"
            onChange={(bookingUrl) => update({ bookingUrl })}
            placeholder="https://barberiaos.com/r/demo-barber"
            value={barberiaos.bookingUrl || ""}
          />
          <Field
            className="md:col-span-2"
            label="Texto CTA del QR"
            maxLength={80}
            onChange={(qrCtaText) => update({ qrCtaText })}
            placeholder="Escanea y reserva tu cita"
            value={barberiaos.qrCtaText}
          />
        </div>
        {showOverlayControls ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex min-h-14 items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-black/20 px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-white">
                  Mostrar QR en el vídeo
                </span>
                <span className="mt-1 block text-xs text-zinc-400">
                  El CTA textual mantiene fallback seguro.
                </span>
              </span>
              <input
                checked={barberiaos.showQrOverlay}
                className="size-5 accent-[#d6b26e]"
                onChange={(event) => update({ showQrOverlay: event.target.checked })}
                type="checkbox"
              />
            </label>
            <label className="rounded-[8px] border border-white/10 bg-black/20 px-4 py-3">
              <span className="block text-sm font-semibold text-white">
                Posición
              </span>
              <select
                className="mt-2 min-h-11 w-full rounded-[8px] border border-white/15 bg-zinc-950 px-3 text-sm text-white"
                onChange={(event) =>
                  update({
                    qrPosition:
                      event.target.value === "bottom_right" ||
                      event.target.value === "bottom_center"
                        ? event.target.value
                        : "end_screen",
                  })
                }
                value={barberiaos.qrPosition}
              >
                <option value="end_screen">Al final del vídeo</option>
                <option value="bottom_right">Abajo derecha</option>
                <option value="bottom_center">Abajo centro</option>
              </select>
            </label>
          </div>
        ) : null}

        {!barberiaos.bookingUrl ? (
          <p className="mt-3 rounded-[8px] border border-[#efd8ad]/18 bg-[#d6b26e]/10 px-3 py-2 text-sm text-[#efd8ad]">
            Podrás añadir el link real más adelante.
          </p>
        ) : null}

        {showStartAction ? (
          <Link
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/32 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-5 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
            href={getBarberiaOSEditorHref(presetId, barberiaos)}
          >
            Crear vídeo con QR de reservas
          </Link>
        ) : null}
      </div>
      <QrPreviewCard barberiaos={barberiaos} />
    </section>
  );
}

export function getBarberiaOSEditorHref(
  presetId: VideoEditorCommercialPresetId,
  barberiaos: VideoEditorBarberiaOSConfig,
  subtitleStyle?: "premium" | "viral",
) {
  const params = new URLSearchParams({
    mode: "barberiaos",
    commercialPresetId: presetId,
    platformPreset: "instagram_reels",
    templateId: "barberia",
    barbershopName: barberiaos.barbershopName || "Tu barbería",
    qrCtaText: barberiaos.qrCtaText,
  });

  if (barberiaos.bookingUrl) {
    params.set("bookingUrl", barberiaos.bookingUrl);
  }

  if (subtitleStyle) {
    params.set("subtitleStyle", subtitleStyle);
  }

  return `/video-editor/create?${params.toString()}`;
}

function Field({
  className = "",
  label,
  maxLength,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-white">{label}</span>
      <input
        className="mt-2 min-h-12 w-full rounded-[8px] border border-white/15 bg-zinc-950/90 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#efd8ad]/55"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
