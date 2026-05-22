# SaaS Migration Plan — Andres Video Studio

This document describes how to evolve Andres Video Studio from a local agency
tool into a multi-tenant SaaS product. Do NOT start this until Level 2 is
stable and you have validated demand from at least 3 paying external users.

---

## Prerequisites

- [ ] Level 2 (VPS + worker) is deployed and stable
- [ ] At least 3 external clients are using the tool and paying for it
- [ ] A pricing model is defined (see `AGENCY_OPERATING_MODEL.md`)
- [ ] Supabase project is created (free tier is enough to start)
- [ ] Cloudflare R2 bucket is created
- [ ] Stripe account is active with at least one product configured

---

## What Changes at Level 3

| Concern | Level 2 (VPS) | Level 3 (SaaS) |
|---|---|---|
| Auth | NextAuth basic session | Supabase Auth (email/OAuth) |
| Job store | JSON files | Supabase Postgres `video_jobs` table |
| Client store | JSON files | Supabase Postgres `video_clients` table |
| Media storage | VPS local disk | Cloudflare R2 |
| Queue | BullMQ + local Redis | BullMQ + Upstash Redis |
| Worker | Single VPS process | Stateless Railway/Fly.io service |
| Multi-tenant | No isolation | Row Level Security per user/org |
| Billing | Manual invoicing | Stripe subscriptions + webhooks |
| Limits | Fixed constants | Per-plan limits from Stripe metadata |

---

## Phase 5A — Supabase Auth

### Step 1 — Install and configure
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 2 — Environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3 — Middleware
Add Supabase Auth middleware to protect all `/video-editor` and `/api/video-editor` routes.
Unauthenticated requests redirect to `/login`.

### Step 4 — User context in API routes
Every API route must resolve the current user from the session before accessing
jobs or clients. Never trust `userId` from request body.

---

## Phase 5B — Postgres Job and Client Stores

### Database schema
```sql
-- Enable Row Level Security
create table video_jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id),
  org_id      uuid,  -- for team accounts (future)
  data        jsonb not null,  -- serialised VideoEditorJob
  status      text not null default 'uploaded',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table video_jobs enable row level security;
create policy "users own their jobs"
  on video_jobs for all using (auth.uid() = user_id);

create table video_clients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id),
  org_id        uuid,
  data          jsonb not null,  -- serialised VideoEditorClient
  business_name text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table video_clients enable row level security;
create policy "users own their clients"
  on video_clients for all using (auth.uid() = user_id);
```

### Store migration strategy
1. Create `SupabaseJobStore` implementing `IJobStore` (see `stores/job-store.interface.ts`)
2. Create `SupabaseClientStore` implementing `IClientStore`
3. Swap the store in each API route — route logic is unchanged
4. Run both stores in parallel for 1 week (write to both, read from Supabase)
5. Drop JSON files after confirming data integrity

---

## Phase 5C — Cloudflare R2 Media Storage

### Why R2
- S3-compatible API (works with `@aws-sdk/client-s3`)
- No egress fees (important for video delivery)
- 10 GB free tier

### Environment variables
```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=andres-video-studio
R2_PUBLIC_URL=https://your-bucket.r2.dev  # or custom domain
```

### Storage provider migration strategy
1. Implement `CloudflareR2StorageProvider` using `IStorageProvider`
2. Keep local disk as fallback during transition
3. Migrate new uploads to R2 first, then backfill old files
4. Update video streaming endpoint to return pre-signed R2 URLs
5. Remove local disk storage references after full migration

### Object key structure (mirrors current folder layout)
```
{userId}/input/{jobId}-{filename}
{userId}/output/{jobId}_final.mp4
{userId}/output/{jobId}_subtitled.mp4
{userId}/transcripts/{jobId}.json
{userId}/exports/{jobId}/{filename}
{userId}/clients/logos/{clientId}-{filename}
```

---

## Phase 5D — Queue with Upstash Redis

Replace local Redis with [Upstash](https://upstash.com) (serverless Redis, free tier available).

```env
UPSTASH_REDIS_REST_URL=https://your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

BullMQ supports Upstash via the `@upstash/redis` adapter. Worker stays identical;
only the Redis connection configuration changes.

---

## Phase 5E — Billing with Stripe

### Plans (suggested)
| Plan | Price | Jobs/month | Max file size | Features |
|---|---|---|---|---|
| Free | $0 | 5 | 100 MB | Core pipeline |
| Pro | $29/month | 50 | 250 MB | + Copy review, Publishing pack |
| Agency | $99/month | Unlimited | 500 MB | + Export ZIP, Dashboard, BarberiaOS |

### Implementation
1. Create Stripe products and prices
2. Store `stripe_customer_id` and `stripe_subscription_id` on the Supabase user profile
3. Webhook handler `/api/webhooks/stripe` syncs subscription status
4. Middleware reads plan limits from Stripe metadata and enforces at upload and job creation
5. Show usage counters in the dashboard

---

## Multi-Tenant Security Checklist

Before launching SaaS:

- [ ] Every API route resolves user from session — never from request body
- [ ] Every Supabase query uses the authenticated client (not service role)
- [ ] Row Level Security policies are enabled on all tables
- [ ] Storage object keys are prefixed with `userId` — no shared namespace
- [ ] Job IDs are validated as UUIDs before any query
- [ ] File downloads require ownership check before serving pre-signed URL
- [ ] Rate limiting is in place on upload and process endpoints
- [ ] Webhook endpoint validates Stripe signature before processing
- [ ] No `console.log` of user data, job content, or file paths in production

---

## What NOT to Do During Migration

- Do not skip RLS — a missing policy exposes all user data
- Do not store API keys in the database — use environment variables
- Do not serve R2 objects from Next.js for large files — use pre-signed URLs
- Do not run FFmpeg inside a Vercel serverless function — it times out
- Do not migrate jobs and storage in the same deploy — do them separately
- Do not delete local JSON files until the Supabase data is verified
