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

export type VideoEditorJob = {
  id: string;
  originalFileName: string;
  storedFileName: string;
  inputPath: string;
  outputPath: string | null;
  subtitlesPath?: string | null;
  transcriptSegments?: VideoEditorSubtitleSegment[];
  status: VideoEditorJobStatus;
  progress: number;
  currentStep: string;
  logs: string[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};
