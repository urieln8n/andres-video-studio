import { getTemplateById } from "@/lib/video-editor/templates";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import type { VideoEditorJob } from "@/lib/video-editor/types";

export function selectCommercialTemplate(job: VideoEditorJob) {
  const config = normalizeVideoEditorConfig(job.config ?? {
    templateId: job.templateId,
  });
  const template = getTemplateById(config.templateId);

  return {
    ...template,
    hook: config.hookText ?? template.hook,
    cta: config.ctaText ?? template.cta,
  };
}
