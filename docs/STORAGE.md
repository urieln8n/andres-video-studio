# Storage

All runtime files stay inside `storage/` in this workspace.

## Folders

- `storage/input`: uploaded source videos.
- `storage/jobs`: job JSON files.
- `storage/output`: subtitled and final MP4 outputs.
- `storage/temp`: WAV, ASS, filter graphs, lock files, and intermediate video.
- `storage/transcripts`: transcript JSON files.
- `storage/exports`: per-job delivery files and ZIPs.
- `storage/clients`: client JSON files and optional logo folder.

## Safety rules

- Do not move or delete production local storage during stabilization.
- Route handlers must not resolve user-supplied paths outside known roots.
- Job and client filenames are derived from validated UUIDs.
- Input originals are not served by the final video endpoints.

## Growth risks

- Originals, output MP4s, intermediates, and export ZIPs can duplicate bytes.
- ZIP generation currently reads package entries into memory.
- No automatic retention policy exists yet for temp or exports.

Any cleanup phase needs an explicit user-facing retention policy, preview of
files to remove, and safeguards for active jobs.
