"use client";

import type { VideoEditorSubtitleStyle } from "@/lib/video-editor/types";

const subtitleStyles = [
  { id: "premium", label: "Premium", description: "Bold con acento dorado" },
  { id: "viral", label: "Viral", description: "Impacto alto y lectura rápida" },
  { id: "minimal", label: "Minimal", description: "Limpio y discreto" },
] as const;

export function SubtitleStyleSelector({
  onSelect,
  value,
}: {
  onSelect: (value: VideoEditorSubtitleStyle) => void;
  value: VideoEditorSubtitleStyle;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">
        Estilo de subtítulos
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {subtitleStyles.map((style) => (
          <button
            key={style.id}
            aria-pressed={style.id === value}
            className={`min-h-24 rounded-[8px] border p-3 text-left transition ${
              style.id === value
                ? "border-[#efd8ad] bg-[#d6b26e]/15"
                : "border-white/10 bg-black/20 hover:border-white/25"
            }`}
            onClick={() => onSelect(style.id)}
            type="button"
          >
            <span className="block text-sm font-semibold text-white">
              {style.label}
            </span>
            <span className="mt-1 block text-sm leading-5 text-zinc-400">
              {style.description}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
