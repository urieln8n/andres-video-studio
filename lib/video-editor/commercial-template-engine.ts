import { getCommercialPresetById, isValidCommercialPreset } from "@/lib/video-editor/commercial-presets";
import { getTemplateById } from "@/lib/video-editor/templates";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import type { VideoEditorJob } from "@/lib/video-editor/types";

export function selectCommercialTemplate(job: VideoEditorJob) {
  const config = normalizeVideoEditorConfig(job.config ?? {
    templateId: job.templateId,
  });
  const template = getTemplateById(config.templateId);

  // If a commercial preset is selected (not "custom"), use its hook/cta as auto defaults
  const presetDefaults =
    isValidCommercialPreset(config.commercialPreset)
      ? getCommercialPresetById(config.commercialPreset)
      : null;

  const autoHook = presetDefaults?.hook ?? template.hook;
  const autoCta = presetDefaults?.cta ?? template.cta;

  return {
    ...template,
    hook: job.finalCopy?.selectedHook ?? job.finalHookText ?? config.hookText ?? autoHook,
    cta: job.finalCopy?.selectedCta ?? job.finalCtaText ?? config.ctaText ?? autoCta,
  };
}
