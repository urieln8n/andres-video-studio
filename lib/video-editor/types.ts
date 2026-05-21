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
  status: VideoEditorJobStatus;
  progress: number;
  currentStep: string;
  logs: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};
