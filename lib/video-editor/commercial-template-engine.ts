import { getTemplateById } from "@/lib/video-editor/templates";
import type { VideoEditorJob } from "@/lib/video-editor/types";

export function selectCommercialTemplate(job: VideoEditorJob) {
  return getTemplateById(job.templateId);
}
