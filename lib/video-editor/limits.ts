// Centralized limits for Andres Video Studio.
//
// These values document the authoritative limits for the system. Values that
// currently appear hardcoded in job-store.ts or config.ts should be migrated
// here in a future cleanup phase — do NOT refactor those files now.

/** Maximum upload size accepted by the upload route (bytes). */
export const MAX_UPLOAD_SIZE_MB = 250;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

/** Video container formats accepted at upload. */
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm"] as const;
export type AllowedVideoExtension = (typeof ALLOWED_VIDEO_EXTENSIONS)[number];

/**
 * Recommended maximum source duration.
 * Longer videos work but transcription and render times grow proportionally.
 */
export const MAX_RECOMMENDED_DURATION_SECONDS = 30 * 60; // 30 minutes

/** Only one job can be processed at a time on a local single-machine install. */
export const MAX_CONCURRENT_LOCAL_JOBS = 1;

/**
 * A lock file older than this threshold is considered stale and will be
 * cleared automatically before a new processing attempt starts.
 */
export const STALE_PROCESSING_LOCK_MS = 6 * 60 * 60 * 1_000; // 6 hours

/** Storage folder paths relative to process.cwd(). */
export const STORAGE_FOLDERS = {
  root: "storage",
  input: "storage/input",
  jobs: "storage/jobs",
  output: "storage/output",
  temp: "storage/temp",
  transcripts: "storage/transcripts",
  exports: "storage/exports",
  clients: "storage/clients",
  clientLogos: "storage/clients/logos",
} as const;

/**
 * When filler cuts exceed this number, show a warning to the user.
 * Very high cut counts can produce jump-cut artifacts.
 */
export const MAX_SAFE_FILLER_CUTS = 50;

/**
 * Show a size warning when an export ZIP exceeds this threshold.
 * ZIPs are currently assembled in memory, so large packages may cause OOM.
 */
export const MAX_EXPORT_PACKAGE_WARNING_MB = 500;

/** Maximum length of free-text overlay fields (hook, CTA) in characters. */
export const MAX_OVERLAY_TEXT_LENGTH = 180;

/** Maximum length accepted for booking URLs. */
export const MAX_BOOKING_URL_LENGTH = 800;

/** Maximum length for barbershop/brand name fields. */
export const MAX_BRAND_NAME_LENGTH = 80;

/**
 * Local mode flag — true when the app runs without cloud services.
 * Feature flags and UI warnings should read this to adapt behaviour.
 */
export const IS_LOCAL_MODE = true;

/** False at Level 1 and Level 2. True only in SaaS (Level 3). */
export const SUPPORTS_MULTIUSER = false;

/** False until Cloudflare R2 or equivalent is wired in (Level 3). */
export const SUPPORTS_CLOUD_STORAGE = false;
