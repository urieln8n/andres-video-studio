# Andres Video Studio

Professional video production tool for content agencies. Automates silence
removal, filler word cuts, subtitle generation, copy review, and social media
delivery packaging — all locally, with no cloud dependencies.

---

## What it does

| Feature | Description |
|---|---|
| **Silence trim** | Detects and removes silent gaps with FFmpeg |
| **Filler cut** | Identifies and cuts "eh", "um", "bueno" etc. via transcription |
| **Subtitles** | Generates premium ASS subtitles burned into the video |
| **Copy review** | Pauses for manual hook/CTA approval before final render |
| **Publishing pack** | Platform captions for Instagram, TikTok, YouTube, WhatsApp |
| **Export ZIP** | One-click delivery package with video + copy + captions |
| **Client manager** | Assign videos to clients, track by sector and project |
| **Agency dashboard** | Weekly production chart, storage usage, recent activity |
| **BarberiaOS mode** | QR booking overlay for barbershop clients |

---

## Requirements

| Dependency | Version | Required |
|---|---|---|
| Node.js | 20 LTS or later | Yes |
| npm | 10+ | Yes |
| FFmpeg | Any recent stable | Yes |
| Python | 3.10+ | Optional (enables real transcription) |
| faster-whisper | Latest | Optional (transcription model) |

### Install FFmpeg (Windows)

```powershell
# Option 1 — winget
winget install Gyan.FFmpeg

# Option 2 — manual
# Download from https://www.gyan.dev/ffmpeg/builds/
# Extract and add the bin/ folder to your PATH
```

Verify with: `ffmpeg -version`

### Install faster-whisper (optional but recommended)

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install faster-whisper
```

The pipeline uses `.venv\Scripts\python.exe` when it exists, or falls back to
the `py` launcher. Without faster-whisper the transcription step is skipped
and subtitles are generated from a mock transcript — the rest of the pipeline
works normally.

---

## Installation

```powershell
git clone <repo-url>
cd andres-video-studio
npm install
cp .env.example .env.local   # edit if needed
```

---

## Running Locally

```powershell
# Development (hot reload)
npm run dev

# Production-like (stop npm run dev first on Windows)
npm run build
npm start
```

Open [http://localhost:3000/video-editor](http://localhost:3000/video-editor).

---

## Testing the Full Flow

### Core video flow
1. Open `/video-editor`
2. Select a platform preset (e.g. Instagram Reels)
3. Choose a commercial preset matching your content
4. Upload an MP4, MOV, M4V, or WEBM file (max 250 MB)
5. Click "Iniciar procesamiento"
6. Watch the progress and logs update in real time
7. When paused for copy review → approve or edit hook and CTA
8. Verify the final video preview on `/video-editor/result`
9. Download the final MP4

### Agency flow
1. Create a client at `/video-editor/clients`
2. Upload a video and assign it to that client
3. Open `/video-editor/dashboard` and verify metrics reflect the new job
4. Open the client detail page and verify the video appears

### Delivery flow
1. On a completed result, click "Generar publishing pack"
2. Click "Generar ZIP de entrega"
3. Download the ZIP and verify it contains MP4 + JSON files
4. **(BarberiaOS)** Set mode to BarberiaOS, enter a valid `https://` booking URL,
   process, and verify the QR overlay appears on the end screen

See [`docs/LOCAL_TEST_CHECKLIST.md`](docs/LOCAL_TEST_CHECKLIST.md) for the
complete manual QA checklist.

---

## Useful Routes

| Route | Description |
|---|---|
| `/video-editor` | Upload and configure a job |
| `/video-editor/processing` | Live progress and logs |
| `/video-editor/copy` | Copy review and approval |
| `/video-editor/result` | Final video preview and delivery |
| `/video-editor/library` | All jobs with filters |
| `/video-editor/clients` | Client management |
| `/video-editor/dashboard` | Agency metrics |
| `/video-editor/barberiaos` | BarberiaOS Content Studio info |
| `/video-editor/system` | System health, dependency checks, storage audit |
| `/api/video-editor/health` | JSON health check (200 healthy / 503 degraded) |
| `/api/video-editor/storage/retention` | JSON retention audit — files safe to delete |

---

## Where Videos Are Stored

All runtime files are stored under `storage/` in the project root:

```
storage/
  input/        ← uploaded source files
  jobs/         ← job metadata (JSON)
  output/       ← processed MP4 outputs
  temp/         ← intermediate files, ASS subtitles, lock files
  transcripts/  ← transcription JSON
  exports/      ← delivery ZIPs per job
  clients/      ← client JSON files and logos
```

**Do not move or delete `storage/` while a job is processing.**

`storage/temp` and `storage/exports` grow unbounded. Clean them manually when
disk usage grows — check the dashboard storage widget for current usage.

---

## Commands

```powershell
npm run dev            # local dev server
npm run build          # production build (stop dev server first on Windows)
npm start              # run production build
npm run lint           # ESLint
npm run check:quality  # node:test quality checks (no compile needed)
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
VIDEO_EDITOR_AI_PROVIDER=local   # local | openai | anthropic | gemini
OPENAI_API_KEY=                  # optional — AI copy generation
ANTHROPIC_API_KEY=               # optional
GEMINI_API_KEY=                  # optional
MAX_UPLOAD_SIZE_MB=250           # max file size accepted at upload
LOCAL_STORAGE_PATH=storage       # relative path for all runtime files
ENABLE_HYPERFRAMES=false         # true to activate Hyperframes motion engine
```

---

## Current Limitations

| Limitation | Detail |
|---|---|
| Single user | No multi-user support |
| One job at a time | Lock file prevents concurrent processing |
| Local only | No cloud storage, no remote access |
| No authentication | Anyone on the local network can access the app |
| Retention audit only | `/video-editor/system` shows candidates; no automatic deletion |
| ZIP in memory | Large export packages (>500 MB) may be slow |
| Transcription optional | Without faster-whisper, mock subtitles are used |
| Heavy renders | FFmpeg runs in the same Node.js process as the UI |

---

## Architecture

See [`docs/ARCHITECTURE_TARGET.md`](docs/ARCHITECTURE_TARGET.md) for the
three-level architecture plan (Local → Agency VPS → SaaS).

| Document | Description |
|---|---|
| [`docs/ARCHITECTURE_TARGET.md`](docs/ARCHITECTURE_TARGET.md) | Current and target architecture |
| [`docs/DEPLOYMENT_OPTIONS.md`](docs/DEPLOYMENT_OPTIONS.md) | Local, VPS, Docker, SaaS options |
| [`docs/WORKER_MIGRATION_PLAN.md`](docs/WORKER_MIGRATION_PLAN.md) | How to separate the video worker |
| [`docs/SAAS_MIGRATION_PLAN.md`](docs/SAAS_MIGRATION_PLAN.md) | Supabase + R2 + billing migration |
| [`docs/BARBERIAOS_INTEGRATION_PLAN.md`](docs/BARBERIAOS_INTEGRATION_PLAN.md) | BarberíaOS Content Studio |
| [`docs/AGENCY_OPERATING_MODEL.md`](docs/AGENCY_OPERATING_MODEL.md) | Workflow, pricing, delivery SOP |
| [`docs/PIPELINE.md`](docs/PIPELINE.md) | Job lifecycle and failure behavior |
| [`docs/STORAGE.md`](docs/STORAGE.md) | Storage layout and safety rules |
| [`docs/LOCAL_TEST_CHECKLIST.md`](docs/LOCAL_TEST_CHECKLIST.md) | Manual QA checklist |

---

## Roadmap

### Completed — Phase 3A (Stabilization)
- Path traversal prevention and UUID validation
- Legacy job normalizer for JSON schema evolution
- Consistent API response helpers
- Architecture, pipeline, storage, and test documentation

### Phase 3B (current)
- Centralized limits (`lib/video-editor/limits.ts`)
- Feature flags with env override (`lib/video-editor/feature-flags.ts`)
- Store interfaces for future migration (`lib/video-editor/stores/`)
- Professional documentation suite (`docs/`)
- `.env.example` and this README

### Completed — Phase 3C (Hardening)
- Quality check scripts for path security, API responses, and normalizers (`npm run check:quality`)
- Health check endpoint (`/api/video-editor/health`) and system page (`/video-editor/system`)
- Streaming responses for MP4 and ZIP downloads (no full-file buffer)
- Retention policy audit (`/api/video-editor/storage/retention`) with confirmation-gated cleanup

### Phase 4 — Agency VPS
- Worker process separated from Next.js (BullMQ + Redis)
- NextAuth.js session authentication
- HTTPS via Nginx + Let's Encrypt
- Nightly temp cleanup cron

### Phase 5 — SaaS (future)
- Supabase Auth + Postgres
- Cloudflare R2 media storage
- Stripe subscription billing
- Multi-tenant isolation

---

## License

Private — internal tool for Andres Agency. Not licensed for redistribution.
