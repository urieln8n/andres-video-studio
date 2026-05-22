# BarberíaOS Integration Plan — Andres Video Studio

This document describes how to integrate Andres Video Studio as the
**BarberíaOS Content Studio** feature inside the BarberíaOS SaaS platform.
Do NOT wire any real connection until BarberíaOS has stable users, an API,
and a plan system.

---

## Concept

Andres Video Studio can function as an embedded content production module for
BarberíaOS barbershop clients. A barbershop with a Pro or Premium BarberíaOS
plan would access Content Studio from their dashboard, and the video editor
would be pre-configured with their booking URL, branding, and QR settings.

---

## What Already Exists in Video Studio

The BarberiaOS mode is fully implemented and works in isolation:

| Feature | Status |
|---|---|
| `mode: "barberiaos"` in `VideoEditorConfig` | ✅ Active |
| `bookingUrl` validation (https only, no localhost) | ✅ Active |
| `barbershopName` field (max 80 chars, XSS-sanitised) | ✅ Active |
| QR SVG generation via `qr-engine.ts` | ✅ Active |
| QR overlay burned into video end-screen | ✅ Active |
| QR CTA text and position options | ✅ Active |
| BarberiaOS-specific publishing tips in pack | ✅ Active |
| Commercial preset `barberia_qr_reservas` | ✅ Active |
| UI page `/video-editor/barberiaos` | ✅ Active |

The mode is currently activated manually by the user in the config panel.
At integration time, BarberíaOS would activate it automatically by passing
context data.

---

## Data Contract from BarberíaOS

When launching Content Studio, BarberíaOS passes the following context:

```typescript
// Passed as query params, POST body, or a signed JWT
type BarberiaOSLaunchContext = {
  // Required
  barbershopId: string;        // UUID of the barbershop in BarberíaOS
  barbershopName: string;      // Display name, max 80 chars
  bookingUrl: string;          // https:// URL for the QR overlay

  // Optional branding
  brandColor?: string;         // hex color, e.g. "#c8a96e"
  logoUrl?: string;            // https:// URL to the logo image

  // Plan information
  plan: "pro" | "premium";     // determines which features are unlocked

  // Auth
  userId: string;              // BarberíaOS user ID
  sessionToken: string;        // signed JWT validated server-side
};
```

### Validation rules (already enforced in config.ts)
- `bookingUrl` must be `https://`, not localhost, not IP — ✅ already validated
- `barbershopName` stripped of HTML, max 80 chars — ✅ already validated
- `brandColor` normalised to hex — needs minor addition in config.ts
- `logoUrl` must be `https://` — needs addition in config.ts

---

## Integration Architecture

### Option 1 — Embedded iframe (simpler)

BarberíaOS renders the Video Studio URL in an iframe with context as query
parameters (URL-encoded, signed with HMAC to prevent tampering).

```
https://studio.yourdomain.com/video-editor?
  mode=barberiaos&
  barbershopName=Barbería+Elite&
  bookingUrl=https%3A%2F%2Fbarberiaelite.com%2Freservas&
  plan=pro&
  sig=abc123  ← HMAC-SHA256 of all params with shared secret
```

Pros: No code coupling, BarberíaOS deploys independently  
Cons: iframe UX limitations, shared secret management

### Option 2 — Shared auth (preferred long-term)

Both apps share a Supabase Auth instance. BarberíaOS logs in the user, passes
a Supabase session token to Video Studio, and Video Studio reads the user's
barbershop profile from a shared Supabase table.

```sql
-- Shared Supabase table (owned by BarberíaOS schema)
create table barbershop_profiles (
  id            uuid primary key,
  user_id       uuid references auth.users(id),
  barbershop_name text not null,
  booking_url   text,
  brand_color   text,
  logo_url      text,
  plan          text not null  -- 'pro' | 'premium'
);
```

Video Studio reads this table at job creation time to pre-fill BarberiaOS config.

---

## Feature Access by Plan

| Feature | Free | Pro | Premium |
|---|---|---|---|
| Core video pipeline | ✅ | ✅ | ✅ |
| Subtitles + filler cut | ✅ | ✅ | ✅ |
| BarberiaOS mode | ❌ | ✅ | ✅ |
| QR overlay | ❌ | ✅ | ✅ |
| Copy review | ❌ | ✅ | ✅ |
| Publishing pack | ❌ | ✅ | ✅ |
| Export ZIP | ❌ | ❌ | ✅ |
| Brand color in overlays | ❌ | ❌ | ✅ |
| Custom logo in overlays | ❌ | ❌ | ✅ |
| Jobs per month | 5 | 20 | Unlimited |

---

## Changes Required in Video Studio

When integration begins (Phase 5 or later):

1. **Config normaliser** — accept `LaunchContext` as input and pre-fill `VideoEditorConfig`
2. **Auth middleware** — validate `sessionToken` from BarberíaOS
3. **Plan enforcement** — read plan from context and enforce feature limits
4. **Brand color** — pass to overlay engine for colored borders/backgrounds
5. **Logo overlay** — download from `logoUrl` and composite onto video (Premium only)
6. **Client auto-creation** — create a `VideoEditorClient` record from the barbershop profile
7. **Filtered library** — show only jobs for the current `barbershopId`

---

## What NOT to Connect Yet

- Do not share a Supabase project with BarberíaOS until both apps are stable
- Do not add logo overlay feature until the integration is actively requested
- Do not add billing logic in Video Studio — billing belongs to BarberíaOS
- Do not hardcode BarberíaOS domain or API URLs in Video Studio code
- Do not touch the existing BarberiaOS UI page or components — they work correctly

---

## Current BarberiaOS Integration Test

The BarberiaOS mode can be tested today without any integration:

1. Open `/video-editor`
2. Select mode "BarberiaOS" in the config panel
3. Enter a valid `https://` booking URL
4. Upload and process a video
5. Verify the QR overlay appears on the end screen

See `docs/LOCAL_TEST_CHECKLIST.md` for the delivery flow test.
