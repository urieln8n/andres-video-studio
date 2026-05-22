import type { VideoEditorJob } from "@/lib/video-editor/types";

// Current implementation: lib/video-editor/job-store.ts  (local JSON files)
// Future implementations:
//   - SupabaseJobStore    — Supabase/Postgres, Level 3 SaaS
//   - PostgresJobStore    — direct pg, Level 2 VPS if Redis/BullMQ added
//
// The interface intentionally mirrors the public surface of job-store.ts so
// that callers can be migrated to depend on IJobStore without changing logic.

export interface IJobStore {
  /** Validate a raw string as a job ID (UUID format). */
  isValidJobId(value: unknown): value is string;

  /** Create a new job record for an uploaded file. */
  createJob(fileName: string, configValue?: unknown): Promise<VideoEditorJob>;

  /** Read a single job by ID. Returns null when the job does not exist. */
  readJob(jobId: string): Promise<VideoEditorJob | null>;

  /** Persist a job record, overwriting any existing data. */
  writeJob(job: VideoEditorJob): Promise<VideoEditorJob>;

  /**
   * Read, transform, and persist a job atomically.
   * Returns null when the job does not exist.
   */
  updateJob(
    jobId: string,
    updater: (job: VideoEditorJob) => VideoEditorJob,
  ): Promise<VideoEditorJob | null>;

  /** Return all jobs sorted by most recently updated. */
  listJobs(): Promise<VideoEditorJob[]>;

  /**
   * Delete all artifacts (input, output, temp, transcripts, exports)
   * and the job record itself.
   * Returns null when the job does not exist.
   */
  deleteJobArtifacts(
    jobId: string,
  ): Promise<{ job: VideoEditorJob; deletedFiles: number } | null>;

  /**
   * Acquire an exclusive processing lock for a job.
   * Returns false when another process already holds the lock.
   */
  acquireProcessingLock(jobId: string): Promise<boolean>;

  /** Release the processing lock for a job. */
  releaseProcessingLock(jobId: string): Promise<void>;
}
