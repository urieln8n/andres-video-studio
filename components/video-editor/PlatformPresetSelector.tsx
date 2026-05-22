"use client";

import {
  platformPresets,
  type VideoEditorPlatformPreset,
} from "@/lib/video-editor/platform-presets";
import type { VideoEditorPlatformPresetId } from "@/lib/video-editor/types";

export function PlatformPresetSelector({
  onSelect,
  value,
}: {
  onSelect: (preset: VideoEditorPlatformPreset) => void;
  value: VideoEditorPlatformPresetId;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">
        Plataforma de destino
      </legend>
      <p className="mt-1 text-sm text-zinc-400">
        Selecciona dónde vas a publicar este vídeo
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {platformPresets.map((preset) => (
          <button
            key={preset.id}
            aria-pressed={preset.id === value}
            className={`rounded-[8px] border p-4 text-left transition ${
              preset.id === value
                ? "border-[#efd8ad] bg-[#d6b26e]/15 text-white"
                : "border-white/10 bg-black/20 text-zinc-200 hover:border-white/25"
            }`}
            onClick={() => onSelect(preset)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold">{preset.label}</span>
              <span className="rounded-[4px] border border-[#efd8ad]/25 bg-[#d6b26e]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#efd8ad]">
                {preset.badge}
              </span>
            </span>
            <span className="mt-1 block text-sm leading-5 text-zinc-400">
              {preset.description}
            </span>
            <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span>{preset.outputFormat.replace("_", " ")}</span>
              <span>{preset.exportQuality}</span>
              <span>{preset.subtitleStyle}</span>
              <span>{preset.recommendedDurationSeconds}s</span>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
