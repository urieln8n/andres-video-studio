"use client";

import { FormatSelector } from "@/components/video-editor/FormatSelector";
import { SubtitleStyleSelector } from "@/components/video-editor/SubtitleStyleSelector";
import { TemplateSelector } from "@/components/video-editor/TemplateSelector";
import { ToggleOption } from "@/components/video-editor/ToggleOption";
import type { VideoEditorConfig } from "@/lib/video-editor/types";

export function EditorConfigPanel({
  config,
  onChange,
}: {
  config: VideoEditorConfig;
  onChange: (config: VideoEditorConfig) => void;
}) {
  function update(value: Partial<VideoEditorConfig>) {
    onChange({ ...config, ...value });
  }

  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_120px_-72px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <div className="mb-6 flex items-start gap-4">
        <StepNumber value="2" />
        <div>
          <p className="text-xs font-medium uppercase text-[#d6b26e]">
            Configurar edición
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Define el preset antes del render
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <TemplateSelector
          onSelect={(templateId) => update({ templateId })}
          selectedTemplateId={config.templateId}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <FormatSelector
            onSelect={(outputFormat) => update({ outputFormat })}
            value={config.outputFormat}
          />
          <SubtitleStyleSelector
            onSelect={(subtitleStyle) => update({ subtitleStyle })}
            value={config.subtitleStyle}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <TextOption
            label="Hook inicial"
            mode={config.hookMode}
            onModeChange={(hookMode) => update({ hookMode })}
            onTextChange={(hookText) => update({ hookText })}
            placeholder="Escribe un hook si quieres sustituir el automático"
            value={config.hookText ?? ""}
          />
          <TextOption
            label="CTA final"
            mode={config.ctaMode}
            onModeChange={(ctaMode) => update({ ctaMode })}
            onTextChange={(ctaText) => update({ ctaText })}
            placeholder="Escribe un CTA si quieres sustituir el automático"
            value={config.ctaText ?? ""}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ToggleOption
            checked={config.trimSilences}
            description="Recorta pausas largas detectadas localmente."
            label="Recorte de silencios"
            onChange={(trimSilences) => update({ trimSilences })}
          />
          <ToggleOption
            checked={config.removeFillers}
            description="Quita muletillas seguras con timestamps."
            label="Limpieza de fillers"
            onChange={(removeFillers) => update({ removeFillers })}
          />
          <ToggleOption
            checked={config.motionEnabled}
            description="Intenta motion premium y conserva fallback."
            label="Motion graphics"
            onChange={(motionEnabled) => update({ motionEnabled })}
          />
          <label className="rounded-[8px] border border-white/10 bg-black/20 p-4">
            <span className="block text-sm font-semibold text-white">
              Modo motion
            </span>
            <span className="mt-1 block text-sm leading-6 text-zinc-400">
              Usa fallback para forzar FFmpeg simple.
            </span>
            <select
              className="mt-3 min-h-11 w-full rounded-[8px] border border-white/15 bg-zinc-950 px-3 text-sm text-white"
              onChange={(event) =>
                update({
                  motionMode:
                    event.target.value === "fallback" ? "fallback" : "auto",
                })
              }
              value={config.motionMode}
            >
              <option value="auto">Auto</option>
              <option value="fallback">Fallback FFmpeg</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}

function TextOption({
  label,
  mode,
  onModeChange,
  onTextChange,
  placeholder,
  value,
}: {
  label: string;
  mode: VideoEditorConfig["hookMode"];
  onModeChange: (mode: VideoEditorConfig["hookMode"]) => void;
  onTextChange: (value: string | null) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="rounded-[8px] border border-white/10 bg-black/20 p-4">
      <span className="block text-sm font-semibold text-white">{label}</span>
      <span className="mt-3 flex rounded-[8px] border border-white/10 bg-zinc-950/80 p-1">
        {(["auto", "custom"] as const).map((option) => (
          <button
            key={option}
            className={`min-h-10 flex-1 rounded-[8px] px-3 text-sm transition ${
              option === mode
                ? "bg-[#d6b26e] font-semibold text-zinc-950"
                : "text-zinc-300"
            }`}
            onClick={() => onModeChange(option)}
            type="button"
          >
            {option === "auto" ? "Automático" : "Personalizado"}
          </button>
        ))}
      </span>
      <input
        className="mt-3 min-h-12 w-full rounded-[8px] border border-white/15 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={mode !== "custom"}
        onChange={(event) => onTextChange(event.target.value || null)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function StepNumber({ value }: { value: string }) {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-[8px] border border-[#efd8ad]/35 bg-[#d6b26e]/15 text-base font-semibold text-[#efd8ad]">
      {value}
    </span>
  );
}
