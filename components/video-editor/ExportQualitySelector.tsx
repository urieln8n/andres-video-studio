"use client";

import { exportQualityProfiles } from "@/lib/video-editor/export-profiles";
import type { VideoEditorExportQuality } from "@/lib/video-editor/types";

export function ExportQualitySelector({
  onSelect,
  value,
}: {
  onSelect: (value: VideoEditorExportQuality) => void;
  value: VideoEditorExportQuality;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">
        Calidad de exportación
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {exportQualityProfiles.map((profile) => (
          <button
            key={profile.id}
            aria-pressed={profile.id === value}
            className={`min-h-24 rounded-[8px] border p-3 text-left transition ${
              profile.id === value
                ? "border-[#efd8ad] bg-[#d6b26e]/15 text-white"
                : "border-white/10 bg-black/20 text-zinc-200 hover:border-white/25"
            }`}
            onClick={() => onSelect(profile.id)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold">{profile.label}</span>
              {profile.recommended ? (
                <span className="rounded-[4px] border border-[#efd8ad]/30 bg-[#d6b26e]/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#efd8ad]">
                  Recomendado
                </span>
              ) : null}
            </span>
            <span className="mt-1 block text-sm leading-5 text-zinc-400">
              {profile.description}
            </span>
            <span className="mt-2 block text-xs text-zinc-500">
              CRF {profile.crf} · {profile.preset} · {profile.audioBitrate}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
