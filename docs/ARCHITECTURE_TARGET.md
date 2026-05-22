# Architecture Target — Andres Video Studio

This document describes the current architecture, the target architecture for
each deployment level, the technical decisions behind the design, and the risks
to manage at each step.

---

## Current Architecture (Phase 3B — Local Monolith)

A single Next.js process hosts the UI, all API route handlers, the file stores,
and the entire video processing pipeline. Everything runs on one Windows machine.

### Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 / React 19 / TypeScript |
| Styling | Tailwind CSS 4 |
| Video processing | FFmpeg (system PATH dependency) |
| Transcription | Python + faster-whisper (.venv in workspace) |
| Job persistence | JSON files — `storage/jobs/{uuid}.json` |
| Client persistence | JSON files — `storage/clients/{uuid}.json` |
| Media storage | Local filesystem — `storage/` |
| Concurrency guard | Lock file — `storage/temp/{uuid}.lock` |

### Request / Data Flow
```
Browser → Next.js API route
  → job-store.ts  (JSON read/write, lock)
  → ffmpeg-engine.ts  (fire-and-forget, child_process.spawn)
    → FFmpeg subprocesses  (silence, subtitles, render)
    → Python subprocess    (faster-whisper transcription)
  → storage/  (all artifacts on disk)
```

### Module Map
```
app/
  api/video-editor/          ← HTTP boundary: validates, delegates to lib/
  video-editor/              ← UI pages (upload, processing, copy, result, …)

lib/video-editor/
  job-store.ts               ← all job I/O + lock management
  client-store.ts            ← all client I/O
  config.ts                  ← VideoEditorConfig normalisation
  safe-paths.ts              ← single source of truth for storage paths
  ffmpeg-engine.ts           ← pipeline orchestrator (highest complexity)
  silence-detector.ts        ← FFmpeg silencedetect wrapper
  filler-detector.ts         ← transcript-based filler word cuts
  subtitle-engine.ts         ← ASS subtitle generation
  transcription-engine.ts    ← Python faster-whisper wrapper
  motion-engine.ts           ← Hyperframes / fallback overlay
  overlay-engine.ts          ← FFmpeg commercial overlay composition
  qr-engine.ts               ← QR SVG generation (BarberiaOS)
  qr-overlay-engine.ts       ← QR burned into video (BarberiaOS)
  publishing-pack-engine.ts  ← social media copy packages
  export-package-engine.ts   ← ZIP delivery assembly
  dashboard-analytics.ts     ← agency metrics aggregation
  limits.ts                  ← centralised limits (Phase 3B)
  feature-flags.ts           ← feature toggles (Phase 3B)
  stores/                    ← store interfaces for future migration (Phase 3B)
```

### Safety Boundaries (already in place)
- `safe-paths.ts` — all storage paths resolve through a single validated helper
- UUID validation on every job ID and client ID before any file I/O
- Filenames sanitised via `text-sanitize.ts` before storage
- Child processes use argument arrays (`shell: false`) — no shell injection
- Video download endpoint restricted to `storage/output/` only
- ZIP download endpoint restricted to the job's own export directory

---

## Level 1: Local Professional (Phase 3B — current)

No infrastructure change. One machine, one user, zero cost.

**What Phase 3B adds without breaking anything:**
- `limits.ts` — single place to change upload size, lock threshold, folder names
- `feature-flags.ts` — toggle features without deploy (ENABLE_HYPERFRAMES via env)
- `stores/*.interface.ts` — TypeScript contracts that will anchor future migration
- `docs/` — this document and the five companion docs
- `.env.example` — documented environment surface
- `README.md` — professional onboarding

**Constraints accepted at Level 1:**
- Single user only
- No remote access (localhost:3000)
- No automatic backups
- Heavy renders block the Next.js process (acceptable for one user)
- `storage/temp` and `storage/exports` grow unbounded until manual cleanup

---

## Level 2: Agency with VPS (Phase 4)

Decouple the video worker from Next.js. Deploy to a small Linux VPS.
No database migration required — JSON stores stay.

### Target Architecture
```
[VPS — Ubuntu 22.04, 4 vCPU / 8 GB RAM]
├── Nginx                   ← HTTPS termination (Let's Encrypt), reverse proxy
├── Next.js  :3000          ← thin API: accepts jobs, returns status
├── Worker   (systemd)      ← long-running Node.js process, owns FFmpeg pipeline
├── Redis    :6379           ← BullMQ job queue (localhost-only, not exposed)
└── storage/                ← same folder layout, same JSON stores
```

### What Changes at Level 2
| Concern | Level 1 | Level 2 |
|---|---|---|
| Pipeline execution | fire-and-forget in Next.js | BullMQ worker process |
| Job queue | in-memory Map | Redis + BullMQ |
| Authentication | none (localhost) | NextAuth.js session cookie |
| HTTPS | none | Nginx + Let's Encrypt |
| Storage | Windows local disk | VPS disk (same layout) |
| Temp cleanup | manual | nightly cron job |
| Process management | manual | systemd units |

### What Stays the Same at Level 2
- JSON file stores (jobs, clients) — no database migration yet
- Storage folder layout — identical paths
- All pipeline logic in `ffmpeg-engine.ts`
- All TypeScript modules — no refactor

### Migration Path
See `WORKER_MIGRATION_PLAN.md` for the step-by-step separation plan.

---

## Level 3: SaaS Multiuser (Phase 5+)

Full cloud migration. Multiple users, subscription billing, cloud storage.

### Target Architecture
```
[Cloud]
├── Next.js (Vercel / Railway)    ← UI + thin API gateway
├── Worker  (Railway / Fly.io)    ← stateless, horizontally scalable
├── Supabase
│   ├── Auth                       ← user accounts, sessions, RLS
│   └── Postgres                   ← jobs table, clients table, users table
├── Cloudflare R2                  ← input, output, exports, client logos
├── Upstash Redis                  ← BullMQ queue (serverless Redis)
└── Stripe                         ← subscription billing + plan limits
```

### Data Model Changes at Level 3
- `VideoEditorJob` gains `userId` and `orgId` columns
- `VideoEditorClient` gains `userId` and `orgId` columns
- Row Level Security in Supabase enforces tenant isolation
- Storage paths become R2 object keys, not local paths

### Store Interface Migration
The interfaces in `lib/video-editor/stores/` define the contract.
Replace `job-store.ts` and `client-store.ts` with Supabase-backed implementations
without changing any API route or pipeline code that calls them.

See `SAAS_MIGRATION_PLAN.md` for the full migration plan.

---

## Technical Decisions

| Decision | Why |
|---|---|
| JSON files for jobs | Zero dependencies, fully debuggable, portable across machines |
| Lock file for concurrency | No Redis required locally; stale threshold prevents deadlocks after crashes |
| Fire-and-forget in Next.js | Simplest path for local single-user use; acceptable at Level 1 |
| `safe-paths.ts` centralised | One place to audit all path resolution; prevents traversal bugs at scale |
| Legacy job normaliser | JSON schema can evolve without breaking existing records |
| ASS subtitles | Full typographic control; no external subtitle service dependency |
| `satisfies` in feature flags | Preserves literal types where possible; env var override stays type-safe |
| Interfaces in `stores/` | Define the migration contract now so refactors are predictable later |

---

## Risks by Level

| Risk | Severity | Level | Mitigation |
|---|---|---|---|
| Pipeline OOM kills Next.js | High | 1 | Acceptable locally; fixed in Level 2 by worker separation |
| Stale lock after crash | Medium | 1–2 | 6h threshold auto-clears; retry from UI |
| Disk full (no retention) | Medium | 1–2 | Manual cleanup; add retention policy in Phase 3C |
| JSON store corruption | Low | 1–2 | Atomic writes; legacy normaliser repairs corrupt reads |
| FFmpeg missing at startup | High | 1–2 | Document installation; add startup health check in Phase 3C |
| ZIP assembled in memory | Medium | 1–2 | Warn when export exceeds MAX_EXPORT_PACKAGE_WARNING_MB |
| No auth → data exposure | Low | 1 | Localhost only; unacceptable at Level 2 (add NextAuth) |
| Single namespace → data leak | Critical | 3 | Supabase RLS enforces tenant isolation; do not skip |
