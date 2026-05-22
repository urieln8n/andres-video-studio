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
- `storage/input` and `storage/output` grow until manually deleted.

## Retention policy

Phase 3C introduced a read-only audit and a confirmation-gated cleanup:

| Category | Threshold | Location |
|---|---|---|
| Temp files | > 3 days old | `storage/temp/` |
| Export directories | > 7 days old | `storage/exports/` |
| Orphan temp files | No matching job UUID | `storage/temp/` |

### Safe boundaries

The cleanup function (`cleanupOldFiles`) **only** deletes inside `storage/temp`
and `storage/exports`. It will never touch `storage/input`, `storage/output`,
`storage/jobs`, or `storage/clients`. Every path is validated with
`isPathInsideRoot` before deletion.

### How to run a cleanup

1. **Audit first** — GET `/api/video-editor/storage/retention` to preview
   what would be deleted and how much space is recoverable.
2. **Confirm deletion** — POST `/api/video-editor/storage/retention/cleanup`
   with body `{ "confirm": "DELETE_TEMP_AND_OLD_EXPORTS" }`.
3. **Visual summary** — open `/video-editor/system` to see live counts and
   reclaim estimates without leaving the UI.

Do not automate cleanup without reviewing the audit report first.
