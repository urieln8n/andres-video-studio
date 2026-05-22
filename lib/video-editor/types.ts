export type VideoEditorJobStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";

export type VideoEditorSubtitleSegment = {
  start: number;
  end: number;
  text: string;
  words?: VideoEditorTranscriptWord[];
};

export type VideoEditorTranscriptWord = {
  start: number;
  end: number;
  word: string;
};

export type VideoEditorTranscript = {
  language: string | null;
  duration?: number;
  text: string;
  segments: VideoEditorSubtitleSegment[];
};

export type VideoEditorSilence = {
  start: number;
  end: number;
  duration: number;
};

export type VideoEditorKeepRange = {
  start: number;
  end: number;
  duration: number;
};

export type VideoEditorEditPlan = {
  jobId: string;
  inputPath: string;
  cleanPath: string;
  duration: number;
  silences: VideoEditorSilence[];
  keepRanges: VideoEditorKeepRange[];
  removedSeconds: number;
  originalDuration: number;
  finalEstimatedDuration: number;
  trimApplied: boolean;
  warning?: string;
};

export type VideoEditorFiller = {
  text: string;
  start: number;
  end: number;
  duration: number;
  confidence: "safe";
};

export type VideoEditorCutRange = {
  start: number;
  end: number;
  duration: number;
};

export type VideoEditorFillerPlan = {
  jobId: string;
  inputPath: string;
  outputPath: string;
  detectedFillers: VideoEditorFiller[];
  cutRanges: VideoEditorCutRange[];
  removedSeconds: number;
  fillersCount: number;
  mode: "cut" | "report_only" | "skipped";
  warnings: string[];
};

export type VideoEditorCommercialTemplateStyle = "premium-dark";

export type VideoEditorCommercialTemplate = {
  id: "barberia" | "negocio_local" | "agencia_ia" | "podcast" | "generico";
  name: string;
  description: string;
  niche: string;
  hook: string;
  cta: string;
  accentColor: string;
  style: VideoEditorCommercialTemplateStyle;
};

export type VideoEditorJob = {
  id: string;
  originalFileName: string;
  storedFileName: string;
  inputPath: string;
  outputPath: string | null;
  subtitlesPath?: string | null;
  transcriptPath?: string | null;
  language?: string | null;
  transcriptionText?: string | null;
  transcriptSegments?: VideoEditorSubtitleSegment[];
  cleanVideoPath?: string | null;
  editPlanPath?: string | null;
  fillerPlanPath?: string | null;
  fillersCount?: number | null;
  fillerRemovedSeconds?: number | null;
  fillerCleanVideoPath?: string | null;
  finalTranscriptPath?: string | null;
  templateId?: VideoEditorCommercialTemplate["id"] | null;
  hookText?: string | null;
  ctaText?: string | null;
  overlayPath?: string | null;
  finalVideoPath?: string | null;
  originalDuration?: number | null;
  finalEstimatedDuration?: number | null;
  removedSeconds?: number | null;
  detectedSilencesCount?: number | null;
  status: VideoEditorJobStatus;
  progress: number;
  currentStep: string;
  logs: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};
