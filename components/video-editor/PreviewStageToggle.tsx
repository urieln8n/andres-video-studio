"use client";

import type { VideoEditorCopyPreviewStage } from "@/lib/video-editor/types";

const stages = [
  { id: "hook", label: "Inicio", detail: "Hook" },
  { id: "subtitle", label: "Medio", detail: "Subtitulos" },
  { id: "cta", label: "Final", detail: "CTA" },
] as const;

export function PreviewStageToggle({
  onChange,
  value,
}: {
  onChange: (stage: VideoEditorCopyPreviewStage) => void;
  value: VideoEditorCopyPreviewStage;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-[8px] border border-white/10 bg-black/25 p-1">
      {stages.map((stage) => (
        <button
          key={stage.id}
          aria-pressed={value === stage.id}
          className={`min-h-12 rounded-[8px] px-2 py-1 text-center transition ${
            value === stage.id
              ? "border border-[#efd8ad]/35 bg-[#d6b26e]/18 text-[#efd8ad]"
              : "border border-transparent text-zinc-400 hover:text-white"
          }`}
          onClick={() => onChange(stage.id)}
          type="button"
        >
          <span className="block text-xs font-semibold">{stage.label}</span>
          <span className="block text-[11px]">{stage.detail}</span>
        </button>
      ))}
    </div>
  );
}
