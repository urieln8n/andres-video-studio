# Local Test Checklist

## Core flow

- [ ] Run `npm run build`.
- [ ] Upload a valid MP4/MOV/M4V/WEBM in `/video-editor`.
- [ ] Start processing and confirm progress and logs update.
- [ ] Review copy when the job pauses for review.
- [ ] Open result preview and verify final MP4 renders.
- [ ] Download final MP4.
- [ ] Open library and find the job.

## Agency flow

- [ ] Create a client.
- [ ] Upload a job assigned to that client.
- [ ] Open client detail and verify associated jobs.
- [ ] Open dashboard and verify metrics, weekly chart, and activity.

## Delivery flow

- [ ] Generate publishing pack on a completed result.
- [ ] Generate export ZIP.
- [ ] Download export ZIP and inspect expected text files and MP4.
- [ ] Run BarberiaOS mode with a valid booking URL and verify QR/CTA state.

## Failure flow

- [ ] Try a video over the configured file-size limit and verify Spanish error.
- [ ] Open result with invalid `jobId` and verify safe missing-job state.
- [ ] Open processing with no `jobId` and verify safe missing-job state.
- [ ] Open copy with invalid or missing `jobId` and verify controlled error UI.
- [ ] Retry a failed job and verify the lock does not duplicate processing.

## Quality checks

- [ ] Run `npm run check:quality` and confirm all tests pass.
- [ ] Verify `check-path-security.mjs` passes all UUID, path traversal, and extension tests.
- [ ] Verify `check-api-response.mjs` passes all payload shape and status code tests.
- [ ] Verify `check-normalizer.mjs` passes all normalization and 500-entry truncation tests.

## System health

- [ ] GET `/api/video-editor/health` returns `{ ok: true, status: "healthy" }` when FFmpeg is installed.
- [ ] Open `/video-editor/system` and verify all required checks (storage, FFmpeg) show green.
- [ ] Confirm warnings section appears correctly when Python or faster-whisper is missing.

## Retention audit

- [ ] GET `/api/video-editor/storage/retention` returns `{ ok: true, summary, candidates }`.
- [ ] Confirm `totalCandidates` is 0 on a fresh install.
- [ ] POST `/api/video-editor/storage/retention/cleanup` without confirm token returns 400.
- [ ] POST with wrong confirm string returns 400.
- [ ] Open `/video-editor/system` and confirm the retention summary matches the API response.
