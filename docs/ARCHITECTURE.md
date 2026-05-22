# Architecture

## Scope

ANDRES VIDEO STUDIO is a local Next.js app. The UI, route handlers, file stores,
and video pipeline live in one workspace and persist data under `storage/`.

## Main routes

- `/video-editor` uploads and configures a job.
- `/video-editor/processing` starts processing and polls progress.
- `/video-editor/copy` reviews generated copy before final render.
- `/video-editor/result` previews final output and delivery packs.
- `/video-editor/library` lists jobs.
- `/video-editor/clients` manages local clients.
- `/video-editor/dashboard` aggregates local agency metrics.

## Main layers

- `app/api/video-editor/` contains route handlers.
- `components/video-editor/` contains editor panels and client-side controls.
- `lib/video-editor/job-store.ts` and `client-store.ts` guard JSON storage.
- `lib/video-editor/config.ts` normalizes user configuration.
- `lib/video-editor/legacy-job-normalizer.ts` adapts older job JSON at read time.
- Engine modules under `lib/video-editor/` handle FFmpeg, transcription,
  subtitles, motion, QR, copy, publishing packs, and export packages.

## Safety boundaries

- Public job and client IDs are UUID-shaped before JSON files are read.
- Final video responses are restricted to MP4 files under `storage/output`.
- ZIP responses are restricted to export paths owned by the job.
- Local commands use argument arrays with `shell: false`.
- Storage path helpers are centralized in `safe-paths.ts` for future changes.

## Current tradeoffs

The FFmpeg pipeline is still synchronous with the local Next process. That keeps
the dev loop small, but `ffmpeg-engine.ts` remains the highest complexity module
and should be separated only after the local contracts are stable.
