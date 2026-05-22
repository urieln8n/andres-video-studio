import { PreviewDeviceFrame } from "@/components/video-editor/PreviewDeviceFrame";
import { getQrPreviewPositionClass, QrPreviewCard } from "@/components/video-editor/QrPreviewCard";
import { SafeZoneOverlay } from "@/components/video-editor/SafeZoneOverlay";
import type {
  VideoEditorBarberiaOSConfig,
  VideoEditorCommercialPresetId,
  VideoEditorCommercialTemplate,
  VideoEditorCopyPreviewStage,
  VideoEditorOutputFormat,
  VideoEditorPlatformPresetId,
  VideoEditorSafeZone,
  VideoEditorSubtitleStyle,
} from "@/lib/video-editor/types";

export function CopyVisualPreview({
  accentColor,
  commercialPresetId,
  hashtags,
  barberiaos,
  mode,
  outputFormat,
  platformBadge,
  platformPreset,
  presetBadge,
  previewStage,
  safeZone,
  selectedCta,
  selectedHook,
  subtitleStyle,
  templateId,
  title,
}: {
  accentColor: string;
  barberiaos: VideoEditorBarberiaOSConfig;
  commercialPresetId: VideoEditorCommercialPresetId;
  hashtags: string;
  mode: "standard" | "barberiaos";
  outputFormat: VideoEditorOutputFormat;
  platformBadge: string;
  platformPreset: VideoEditorPlatformPresetId;
  presetBadge: string;
  previewStage: VideoEditorCopyPreviewStage;
  safeZone: VideoEditorSafeZone;
  selectedCta: string;
  selectedHook: string;
  subtitleStyle: VideoEditorSubtitleStyle;
  templateId: VideoEditorCommercialTemplate["id"];
  title: string;
}) {
  const visualStage =
    previewStage === "hook"
      ? "Inicio"
      : previewStage === "cta"
        ? "Final"
        : "Medio";
  const subtitleClass =
    subtitleStyle === "viral"
      ? "text-lg font-black uppercase"
      : subtitleStyle === "minimal"
        ? "text-sm font-medium"
        : "text-base font-bold";

  return (
    <section className="flex flex-col gap-4 rounded-[8px] border border-[#efd8ad]/18 bg-white/[0.07] p-5 shadow-[0_34px_110px_-68px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase text-[#d6b26e]">
          Previsualizacion rapida
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Copy sobre mock de video
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Esto no renderiza el video todavia. Es una vista previa visual para
          revisar posicion, formato y copy.
        </p>
      </div>

      <PreviewDeviceFrame outputFormat={outputFormat}>
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#060606_0%,#171411_38%,#121921_100%)]" />
        <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(115deg,transparent_10%,rgba(214,178,110,0.13)_44%,transparent_76%)]" />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.32),transparent_28%,transparent_62%,rgba(0,0,0,0.72))]" />
        <SafeZoneOverlay outputFormat={outputFormat} safeZone={safeZone} />

        <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap gap-2">
          <Badge value={platformBadge || platformPreset} />
          <Badge value={presetBadge || commercialPresetId} />
        </div>

        <div className="absolute inset-0 z-20">
          <div
            className={`absolute inset-x-[9%] top-[14%] rounded-[8px] border bg-black/45 px-4 py-4 backdrop-blur-sm transition ${
              previewStage === "hook"
                ? "border-white/20 opacity-100"
                : "border-white/10 opacity-35"
            }`}
            style={{ boxShadow: previewStage === "hook" ? `0 0 0 1px ${accentColor}55` : undefined }}
          >
            <span
              className="mb-3 block h-1 w-14 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <p className="break-words text-balance text-xl font-semibold leading-tight text-white sm:text-2xl">
              {selectedHook || "Tu hook aparecera aqui"}
            </p>
          </div>

          <div
            className={`absolute inset-x-[12%] bottom-[24%] flex justify-center transition ${
              previewStage === "subtitle" ? "opacity-100" : "opacity-35"
            }`}
          >
            <p className={`max-w-full rounded-[8px] border border-white/14 bg-black/68 px-3 py-2 text-center leading-tight text-white shadow-lg ${subtitleClass}`}>
              El subtitulo acompana la escena
            </p>
          </div>

          <div
            className={`absolute inset-x-[10%] bottom-[10%] rounded-[8px] border px-4 py-4 text-center backdrop-blur-sm transition ${
              previewStage === "cta"
                ? "border-[#efd8ad]/45 bg-black/58 opacity-100"
                : "border-white/10 bg-black/38 opacity-35"
            }`}
          >
            <p className="text-xs font-semibold uppercase text-[#efd8ad]">
              CTA final
            </p>
            <p className="mt-2 break-words text-lg font-semibold leading-tight text-white">
              {selectedCta || "Tu CTA aparecera aqui"}
            </p>
          </div>

          {mode === "barberiaos" && previewStage === "cta" ? (
            <div className={`absolute z-30 ${getQrPreviewPositionClass(barberiaos.qrPosition)}`}>
              <QrPreviewCard barberiaos={barberiaos} compact />
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-3 text-[10px] text-white/65">
          <div className="min-w-0 rounded-[8px] border border-white/10 bg-black/32 px-2 py-1 backdrop-blur">
            <p className="truncate font-semibold text-white/85">
              {title || "Titulo del video"}
            </p>
            <p className="truncate">{formatHashtags(hashtags)}</p>
          </div>
          <span className="shrink-0 rounded-[8px] border border-white/10 bg-black/32 px-2 py-1 uppercase backdrop-blur">
            {visualStage} / {templateId}
          </span>
        </div>
      </PreviewDeviceFrame>
    </section>
  );
}

function Badge({ value }: { value: string }) {
  return (
    <span className="rounded-[8px] border border-white/12 bg-black/38 px-2 py-1 text-[10px] font-semibold uppercase text-white/80 backdrop-blur">
      {value}
    </span>
  );
}

function formatHashtags(value: string) {
  const hashtags = value.trim().split(/\s+/).filter(Boolean).slice(0, 3);

  return hashtags.length ? hashtags.join(" ") : "#copy #video";
}
