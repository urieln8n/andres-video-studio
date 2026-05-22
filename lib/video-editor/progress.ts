import { updateJob } from "@/lib/video-editor/job-store";
import { getPipelineStep } from "@/lib/video-editor/pipeline-steps";
import type {
  VideoEditorJob,
  VideoEditorJobMetrics,
  VideoEditorPipelineStepId,
} from "@/lib/video-editor/types";

export function setJobProgress(
  jobId: string,
  progress: number,
  currentStep: VideoEditorPipelineStepId,
) {
  const step = getPipelineStep(currentStep);

  return updateJob(jobId, (job) =>
    touchJob({
      ...job,
      progress: clampProgress(progress),
      currentStep: currentStep,
      currentStepLabel: step?.label ?? job.currentStepLabel,
    }),
  );
}

export function appendJobLog(jobId: string, message: string) {
  return updateJob(jobId, (job) =>
    touchJob({
      ...job,
      logs: [...job.logs, message],
    }),
  );
}

export function markJobProcessing(jobId: string) {
  return updateJob(jobId, (job) =>
    touchJob({
      ...job,
      status: "processing",
      progress: 5,
      currentStep: "starting",
      currentStepLabel: getPipelineStep("starting")?.label,
      errorMessage: undefined,
    }),
  );
}

export function markJobCompleted(jobId: string) {
  return updateJob(jobId, (job) =>
    touchJob({
      ...job,
      status: "completed",
      progress: 100,
      currentStep: "completed",
      currentStepLabel: getPipelineStep("completed")?.label,
      errorMessage: undefined,
    }),
  );
}

export function markJobFailed(jobId: string, error: string) {
  return updateJob(jobId, (job) =>
    touchJob({
      ...job,
      status: "failed",
      currentStep: "failed",
      currentStepLabel: getPipelineStep("failed")?.label,
      errorMessage: error,
      logs: [...job.logs, `Error: ${error}`],
    }),
  );
}

export function updateJobMetrics(
  jobId: string,
  partialData: Partial<VideoEditorJobMetrics>,
) {
  return updateJob(jobId, (job) =>
    touchJob({
      ...job,
      metrics: {
        ...job.metrics,
        ...partialData,
      },
    }),
  );
}

export function touchJob(job: VideoEditorJob) {
  return {
    ...job,
    updatedAt: new Date().toISOString(),
  } satisfies VideoEditorJob;
}

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, Math.round(progress)));
}
