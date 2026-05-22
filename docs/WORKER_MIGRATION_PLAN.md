# Worker Migration Plan — Andres Video Studio

This document describes how to separate the FFmpeg video pipeline from the
Next.js process in a future phase. Do NOT implement this until Level 2 is
actively needed (VPS deploy with multiple users or frequent crashes).

---

## Why Separate the Worker?

At Level 1, the pipeline runs inside the Next.js process via fire-and-forget:

```typescript
// app/api/video-editor/jobs/[jobId]/process/route.ts
processVideoEditorJob(job.id, mode)
  .catch(() => { /* errors persisted by markJobFailed */ })
  .finally(() => { releaseProcessingLock(job.id); });
```

This is safe for a single local user because:
- Only one job runs at a time (lock file)
- A crash only affects one person's session
- The stale lock threshold (6h) unblocks the next attempt

It becomes unsafe when:
- Multiple users submit jobs concurrently → resource contention
- A heavy render OOMs the process → the Next.js UI goes down too
- You want to restart Next.js without killing active renders

---

## Current Components to Separate

```
[ Next.js process ]
  ├── UI pages
  ├── API routes (upload, jobs, clients, dashboard)
  └── ffmpeg-engine.ts  ← THIS needs to move out
        ├── FFmpeg child processes
        └── Python/Whisper child processes
```

## Target Architecture (Level 2)

```
[ Next.js process :3000 ]
  ├── UI pages
  ├── API routes (thin: create job, poll status, read results)
  └── Queue client (BullMQ producer) → adds job to Redis queue

[ Worker process (systemd service) ]
  └── BullMQ consumer
        └── ffmpeg-engine.ts (unchanged logic)
              ├── FFmpeg child processes
              └── Python/Whisper child processes

[ Redis :6379 ] ← BullMQ queue (localhost-only)
```

---

## Migration Steps

### Step 1 — Install BullMQ and Redis

```bash
npm install bullmq
# Redis must be running on the same machine
```

### Step 2 — Create the queue contract

```typescript
// lib/video-editor/queue/video-job-queue.ts
import { Queue, Worker } from "bullmq";

export const VIDEO_QUEUE_NAME = "video-processing";

export type VideoJobPayload = {
  jobId: string;
  mode: "full" | "prepare_copy";
};

export function createVideoQueue() {
  return new Queue<VideoJobPayload>(VIDEO_QUEUE_NAME, {
    connection: { host: "127.0.0.1", port: 6379 },
  });
}
```

### Step 3 — Replace fire-and-forget in the process route

Before (current):
```typescript
// fire-and-forget inside Next.js
processVideoEditorJob(job.id, mode).catch(...).finally(...);
```

After (Level 2):
```typescript
const queue = createVideoQueue();
await queue.add("process", { jobId: job.id, mode });
```

### Step 4 — Create the worker entry point

```typescript
// worker.ts  (new file, runs as separate Node.js process)
import { Worker } from "bullmq";
import { processVideoEditorJob } from "@/lib/video-editor/ffmpeg-engine";
import { acquireProcessingLock, releaseProcessingLock } from "@/lib/video-editor/job-store";
import type { VideoJobPayload } from "@/lib/video-editor/queue/video-job-queue";

const worker = new Worker<VideoJobPayload>(
  "video-processing",
  async (job) => {
    const { jobId, mode } = job.data;
    const locked = await acquireProcessingLock(jobId);
    if (!locked) return;
    try {
      await processVideoEditorJob(jobId, mode);
    } finally {
      await releaseProcessingLock(jobId);
    }
  },
  {
    connection: { host: "127.0.0.1", port: 6379 },
    concurrency: 1,  // one video at a time
  },
);

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err.message);
});
```

### Step 5 — Systemd unit for the worker

```ini
# /etc/systemd/system/andres-video-studio-worker.service
[Unit]
Description=Andres Video Studio Worker
After=redis.service

[Service]
Type=simple
WorkingDirectory=/opt/andres-video-studio
ExecStart=/usr/bin/node worker.js
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/opt/andres-video-studio/.env.local

[Install]
WantedBy=multi-user.target
```

---

## What Does NOT Change

- `ffmpeg-engine.ts` — zero changes to pipeline logic
- `job-store.ts` — JSON store and lock mechanism unchanged
- `storage/` — same folder layout
- All API routes except `/process` and `/render` — unchanged
- All frontend components — unchanged
- All types in `types.ts` — unchanged

The separation is purely about **where** the pipeline runs, not **how**.

---

## Status Polling (no change needed)

The frontend already polls `GET /api/video-editor/jobs/[jobId]` to get status.
Since the worker updates the same JSON file, polling works identically whether
the pipeline runs in-process or in the worker. No frontend changes required.

---

## Rollback Plan

If BullMQ/Redis causes problems, revert the process route to the original
fire-and-forget pattern. The pipeline code is untouched, so rollback is a
two-line change in the route handler.

---

## Prerequisites Before Starting

- [ ] Level 1 is stable (no crashes in normal use)
- [ ] Redis is installed and running on the target machine
- [ ] `npm run build` passes with BullMQ added
- [ ] The worker runs and processes a test job end-to-end
- [ ] Systemd units are tested with a reboot
