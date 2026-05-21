export type VideoEditorJobStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";

export type VideoEditorSubtitleSegment = {
  start: number;
  end: number;
  text: string;
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
