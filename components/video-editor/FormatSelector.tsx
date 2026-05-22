"use client";

import type { VideoEditorOutputFormat } from "@/lib/video-editor/types";

const outputFormats = [
  {
    id: "vertical_9_16",
    label: "Vertical 9:16",
    description: "Reels, TikTok y Shorts",
  },
  {
    id: "square_1_1",
    label: "Cuadrado 1:1",
    description: "Feed y publicaciones compactas",
  },
  {
    id: "horizontal_16_9",
    label: "Horizontal 16:9",
    description: "YouTube y vídeo panorámico",
  },
] as const;

export function FormatSelector({
  onSelect,
  value,
}: {
  onSelect: (value: VideoEditorOutputFormat) => void;
  value: VideoEditorOutputFormat;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">
        Formato de salida
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {outputFormats.map((format) => (
          <button
            key={format.id}
            aria-pressed={format.id === value}
            className={`min-h-24 rounded-[8px] border p-3 text-left transition ${
              format.id === value
                ? "border-[#efd8ad] bg-[#d6b26e]/15 text-white"
                : "border-white/10 bg-black/20 text-zinc-200 hover:border-white/25"
            }`}
            onClick={() => onSelect(format.id)}
            type="button"
          >
            <span className="block text-sm font-semibold">{format.label}</span>
            <span className="mt-1 block text-sm leading-5 text-zinc-400">
              {format.description}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
