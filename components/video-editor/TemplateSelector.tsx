"use client";

import { videoEditorTemplates } from "@/lib/video-editor/templates";
import type { VideoEditorCommercialTemplate } from "@/lib/video-editor/types";

export function TemplateSelector({
  selectedTemplateId,
  onSelect,
}: {
  selectedTemplateId: VideoEditorCommercialTemplate["id"];
  onSelect: (templateId: VideoEditorCommercialTemplate["id"]) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase text-[#d6b26e]">
          Plantilla visual
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Elige el ángulo comercial del vídeo
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {videoEditorTemplates.map((template) => {
          const selected = template.id === selectedTemplateId;

          return (
            <button
              key={template.id}
              aria-pressed={selected}
              className={`group flex min-h-[19rem] flex-col overflow-hidden rounded-[8px] border p-4 text-left shadow-[0_28px_90px_-56px_rgba(0,0,0,1)] backdrop-blur-xl transition ${
                selected
                  ? "border-[#efd8ad] bg-[#d6b26e]/15 shadow-[0_30px_100px_-44px_rgba(214,178,110,0.8)]"
                  : "border-white/10 bg-white/[0.06] hover:border-white/25 hover:bg-white/[0.09]"
              }`}
              onClick={() => onSelect(template.id)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="mb-4 block h-1.5 w-16 rounded-full"
                style={{ backgroundColor: template.accentColor }}
              />
              <span className="mb-4 inline-flex w-fit rounded-[8px] border border-white/10 bg-black/25 px-2.5 py-1 text-xs font-medium uppercase text-zinc-200">
                {template.niche}
              </span>
              <strong className="text-lg font-semibold text-white">
                {template.name}
              </strong>
              <span className="mt-2 text-sm leading-6 text-zinc-300">
                {template.description}
              </span>
              <span className="mt-auto pt-5 text-sm leading-6 text-zinc-100">
                <span className="block text-xs uppercase text-zinc-400">
                  Hook
                </span>
                {template.hook}
              </span>
              <span className="mt-3 text-sm leading-6 text-zinc-100">
                <span className="block text-xs uppercase text-zinc-400">
                  CTA
                </span>
                {template.cta}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
