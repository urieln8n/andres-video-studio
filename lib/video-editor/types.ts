export type VideoEditorJobStatus =
  | "uploaded"
  | "processing"
  | "awaiting_copy_review"
  | "copy_approved"
  | "rendering_final"
  | "completed"
  | "failed";

export type VideoEditorPipelineStepId =
  | "uploaded"
  | "starting"
  | "preparing"
  | "trim_silences"
  | "extracting_audio"
  | "transcribing"
  | "detecting_fillers"
  | "cleaning_fillers"
  | "generating_subtitles"
  | "reviewing_copy"
  | "rendering_subtitles"
  | "applying_hook_cta"
  | "applying_motion"
  | "exporting"
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

export type VideoEditorMotionEngine = "hyperframes" | "fallback";

export type VideoEditorOutputFormat =
  | "vertical_9_16"
  | "square_1_1"
  | "horizontal_16_9";

export type VideoEditorSubtitleStyle = "premium" | "viral" | "minimal";

export type VideoEditorTextMode = "auto" | "custom";

export type VideoEditorMode = "standard" | "barberiaos";

export type VideoEditorMotionMode = "auto" | "fallback";

export type VideoEditorExportQuality = "draft" | "standard" | "premium";

export type VideoEditorCopyPreviewStage = "hook" | "subtitle" | "cta";

export type VideoEditorPlatformPresetId =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "instagram_feed"
  | "youtube_horizontal"
  | "linkedin"
  | "custom";

export type VideoEditorSafeZone = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type VideoEditorCommercialPresetId =
  | "barberia_reels"
  | "barberia_promo"
  | "barberia_huecos_libres"
  | "barberia_antes_despues"
  | "barberia_qr_reservas"
  | "barberia_combo_corte_barba"
  | "barberia_reactivar_clientes"
  | "barberia_pedir_resenas"
  | "negocio_local_vitrina"
  | "negocio_local_testimonio"
  | "agencia_ia_demo"
  | "agencia_ia_caso"
  | "podcast_clip"
  | "fotografo_portfolio"
  | "restaurante_plato"
  | "generico_viral"
  | "custom";

export type VideoEditorConfig = {
  mode: VideoEditorMode;
  commercialPreset: VideoEditorCommercialPresetId;
  platformPreset: VideoEditorPlatformPresetId;
  templateId: VideoEditorCommercialTemplate["id"];
  outputFormat: VideoEditorOutputFormat;
  exportQuality: VideoEditorExportQuality;
  subtitleStyle: VideoEditorSubtitleStyle;
  hookMode: VideoEditorTextMode;
  hookText: string | null;
  ctaMode: VideoEditorTextMode;
  ctaText: string | null;
  trimSilences: boolean;
  removeFillers: boolean;
  motionEnabled: boolean;
  motionMode: VideoEditorMotionMode;
  copyReviewEnabled: boolean;
};

export type VideoEditorCopyPack = {
  hooks: string[];
  ctas: string[];
  title: string;
  description: string;
  hashtags: string[];
  summary?: string | null;
};

export type VideoEditorFinalCopy = {
  selectedHook: string;
  selectedCta: string;
  title: string;
  description: string;
  hashtags: string[];
  source: "generated" | "edited";
  approvedAt: string;
};

export type VideoEditorJobMetrics = {
  originalDuration?: number | null;
  finalEstimatedDuration?: number | null;
  removedSeconds?: number | null;
  detectedSilencesCount?: number | null;
  fillersCount?: number | null;
  fillerRemovedSeconds?: number | null;
  outputWidth?: number | null;
  outputHeight?: number | null;
  outputCrf?: number | null;
  outputPreset?: string | null;
  outputAudioBitrate?: string | null;
  finalFileSizeBytes?: number | null;
  finalFileSizeLabel?: string | null;
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
  finalHookText?: string | null;
  finalCtaText?: string | null;
  generatedTitle?: string | null;
  generatedDescription?: string | null;
  generatedHashtags?: string[];
  copyPack?: VideoEditorCopyPack | null;
  copyPackPath?: string | null;
  finalCopy?: VideoEditorFinalCopy | null;
  config?: VideoEditorConfig;
  overlayPath?: string | null;
  finalVideoPath?: string | null;
  motionEngine?: VideoEditorMotionEngine | null;
  hookOverlayPath?: string | null;
  ctaOverlayPath?: string | null;
  motionWarnings?: string[];
  originalDuration?: number | null;
  finalEstimatedDuration?: number | null;
  removedSeconds?: number | null;
  detectedSilencesCount?: number | null;
  status: VideoEditorJobStatus;
  progress: number;
  currentStep: string;
  currentStepLabel?: string;
  logs: string[];
  metrics?: VideoEditorJobMetrics;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type VideoEditorLibraryJob = VideoEditorJob & {
  hasFinalVideo: boolean;
};
