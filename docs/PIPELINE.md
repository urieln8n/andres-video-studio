# Pipeline

## Job lifecycle

1. Upload validates extension and size, sanitizes the filename, stores input,
   and writes a job JSON.
2. Processing acquires a local lock file and records progress/logs.
3. FFmpeg detects duration and optionally trims silence.
4. Audio is extracted and faster-whisper is attempted.
5. Safe filler cuts are planned and optionally rendered.
6. Final transcript and ASS subtitles are prepared.
7. Copy can pause the pipeline for manual review.
8. Final render applies format, subtitles, commercial overlays, motion fallback,
   and optional BarberiaOS QR CTA.
9. Publishing pack and result metadata are persisted.
10. Export ZIP is generated on demand from the final result.

## Failure behavior

- Missing FFmpeg fails the job with persisted logs.
- Missing Python or faster-whisper falls back to mock subtitle segments and logs
  the transcription error.
- A failed job can be retried from the processing screen.
- Locks older than the local stale-lock threshold are cleared by the job store
  before a new processing attempt.

## Copy and packs

Copy packs are local-rule fallbacks when generated data is unavailable. Final
copy is sanitized before it is approved. Publishing packs and ZIP deliveries
reuse job snapshots so a later client edit does not rewrite old deliveries.
