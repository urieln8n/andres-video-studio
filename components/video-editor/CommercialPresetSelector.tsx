"use client";

import {
  commercialPresets,
  type VideoEditorCommercialPreset,
} from "@/lib/video-editor/commercial-presets";
import type { VideoEditorCommercialPresetId } from "@/lib/video-editor/types";

const niches = [...new Set(commercialPresets.map((p) => p.niche))];

export function CommercialPresetSelector({
  onSelect,
  value,
}: {
  onSelect: (preset: VideoEditorCommercialPreset) => void;
  value: VideoEditorCommercialPresetId;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">
        Preset comercial
      </legend>
      <p className="mt-1 text-sm text-zinc-400">
        Selecciona un preset por nicho para autoconfigurar hook, CTA y ajustes
      </p>
      <div className="mt-3 flex flex-col gap-4">
        {niches.map((niche) => (
          <div key={niche}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {niche}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {commercialPresets
                .filter((p) => p.niche === niche)
                .map((preset) => (
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
                      <span className="text-sm font-semibold">
                        {preset.label}
                      </span>
                      <span className="rounded-[4px] border border-[#efd8ad]/25 bg-[#d6b26e]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#efd8ad]">
                        {preset.badge}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-zinc-400">
                      {preset.description}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span>{preset.outputFormat.replace(/_/g, " ")}</span>
                      <span>{preset.exportQuality}</span>
                      <span>{preset.subtitleStyle}</span>
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
        <button
          aria-pressed={value === "custom"}
          className={`rounded-[8px] border p-4 text-left transition ${
            value === "custom"
              ? "border-[#efd8ad] bg-[#d6b26e]/15 text-white"
              : "border-white/10 bg-black/20 text-zinc-200 hover:border-white/25"
          }`}
          onClick={() =>
            onSelect({
              id: "custom" as never,
              label: "Personalizado",
              description: "Configura todos los ajustes manualmente",
              niche: "Custom",
              badge: "Custom",
              templateId: "generico",
              hook: "",
              cta: "",
              outputFormat: "vertical_9_16",
              exportQuality: "standard",
              subtitleStyle: "premium",
              motionEnabled: true,
              trimSilences: true,
              removeFillers: true,
            })
          }
          type="button"
        >
          <span className="flex items-center gap-2">
            <span className="text-sm font-semibold">Personalizado</span>
            <span className="rounded-[4px] border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-400">
              Custom
            </span>
          </span>
          <span className="mt-1 block text-sm leading-5 text-zinc-400">
            Configura todos los ajustes manualmente
          </span>
        </button>
      </div>
    </fieldset>
  );
}
