# Roadmap

## Completed stabilization in 3A

- Central safety helpers for IDs, storage paths, text, filenames, and bytes.
- Legacy job normalization at JSON read boundaries.
- Compatible API response helpers with explicit `ok` on editor responses.
- Readable architecture, pipeline, storage, and local test notes.

## Recommended 3B

- Add focused automated tests for stores, normalizers, path resolution, and API
  failure payloads.
- Define retention policy for `storage/temp` and old exports.
- Add streaming or bounded-memory handling for large media and ZIP responses.
- Add warning surfaces for degraded transcription/motion outcomes.

## Later

- Split long-running processing from request lifecycle with a local worker
  contract.
- Decide persistence abstraction before any Supabase integration.
- Break down `ffmpeg-engine.ts` only after tests cover pipeline contracts.
