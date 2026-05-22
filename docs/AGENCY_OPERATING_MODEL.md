# Agency Operating Model — Andres Video Studio

This document describes how to use Andres Video Studio as an internal
production tool for a content agency. It covers the weekly workflow, client
management, delivery process, and suggested pricing.

---

## What This Tool Does for Your Agency

| Task | Before (manual) | After (studio) |
|---|---|---|
| Silence removal | 30–60 min in Premiere | ~2 min automated |
| Filler word cuts | 20–45 min | ~1 min automated |
| Subtitle generation | 30–60 min | ~2 min automated |
| Copy & hashtags | 15–30 min | ~30 sec (local rules) |
| Social media captions | 20–40 min | Instant (publishing pack) |
| Client delivery ZIP | 10–20 min | 1 click |
| **Total per video** | **2–4 hours** | **10–20 minutes** |

Estimated time saved: **~25 minutes per completed video** (tracked in dashboard).

---

## Client Setup

### Creating a client
1. Go to `/video-editor/clients`
2. Click "Nuevo cliente"
3. Fill in:
   - Business name (required)
   - Sector (barbería, fotografía, restaurante, clínica, agencia, negocio local, otro)
   - Contact name, email, phone (optional)
   - Instagram handle, website, booking URL (optional)
   - Brand color (hex — used in future overlays)
4. Save — the client appears in the selector during upload

### When to create a client
Create one client per business, not per project. Assign every video job to
its client so the dashboard and library filter correctly.

---

## Weekly Production Workflow

### Monday — Client intake
- [ ] Collect raw video files from clients (WhatsApp, Google Drive, WeTransfer)
- [ ] Confirm delivery format for each client (vertical 9:16 / square 1:1 / horizontal 16:9)
- [ ] Confirm platform target (TikTok / Instagram Reels / YouTube Shorts / LinkedIn)
- [ ] Note any specific hook or CTA requests

### Tuesday–Thursday — Production
For each video:
1. Open `/video-editor`
2. Select the client from the dropdown
3. Choose platform preset (Instagram Reels, TikTok, YouTube Shorts…)
4. Choose commercial preset matching the client's niche
5. Set output format and export quality
6. Enable or disable: silence trim, filler cut, motion, copy review
7. Upload the raw video (drag and drop)
8. Click "Iniciar procesamiento"
9. Wait for the progress screen to complete (or pause at copy review)
10. If copy review is on: review and approve hook, CTA, title, hashtags
11. Open result page → preview the final video
12. Generate publishing pack
13. Generate export ZIP
14. Download the ZIP → deliver to client

### Friday — Review and QA
- [ ] Open dashboard `/video-editor/dashboard`
- [ ] Check completed jobs for the week
- [ ] Review any failed jobs and retry or escalate
- [ ] Check storage usage and clean up old temp files if needed
- [ ] Update client notes with any feedback received

---

## Delivery to the Client

The export ZIP contains:
- `video_final.mp4` — the processed video ready to upload
- `copy_pack.json` — hook options, CTA options, title, description, hashtags
- `publishing_pack.json` — platform-specific captions (Instagram, TikTok, YouTube, WhatsApp)
- `subtitles.ass` — subtitle file (for clients who want it)

### Delivery options
1. **Direct WhatsApp** — share the ZIP or just the MP4 + captions text
2. **Google Drive** — upload the ZIP to a shared client folder
3. **Email** — attach the ZIP (check client's email attachment limit)
4. **Notion page** — paste captions from publishing_pack.json into a Notion doc

### Copy from publishing pack (paste directly)
- Instagram caption → from `instagramCaption`
- TikTok description → from `tiktokCaption`
- YouTube Shorts description → from `youtubeShortsDescription`
- WhatsApp broadcast → from `whatsappText`
- Instagram Story text → from `instagramStoryText`
- Hashtags → from `hashtags` array

---

## Suggested Pricing (Andrés Agency)

These are reference prices for the Spanish/Latin American market. Adjust based
on your client relationships and local market rates.

### Per video
| Service | Price | Includes |
|---|---|---|
| Video básico | 25–40 € | Silence cut + subtítulos + descarga |
| Video profesional | 50–80 € | + Filler cut + copy review + publishing pack |
| Video premium | 80–120 € | + Export ZIP + BarberiaOS QR (si aplica) |
| Pack mensual x4 | 150–200 € | 4 vídeos profesionales al mes |
| Pack mensual x8 | 280–350 € | 8 vídeos con entrega en 48h |

### Agency retainer
| Plan | Price | Deliverables |
|---|---|---|
| Content Básico | 200 €/mes | 8 vídeos/mes, 24h turnaround |
| Content Pro | 400 €/mes | 20 vídeos/mes, 12h turnaround, copy incluido |
| Content Agencia | 800 €/mes | Ilimitado, prioridad, dashboard compartido |

### What to charge for BarberiaOS clients
BarberiaOS clients get branded QR + booking URL in every video. Charge a
20–30% premium over standard pricing for this added value.

---

## Weekly Production Checklist

```
SEMANA: _______________   CLIENTE PRINCIPAL: _______________

PRODUCCIÓN
[ ] Vídeos recibidos de todos los clientes
[ ] Jobs creados y asignados a cada cliente
[ ] Todos los jobs procesados sin errores en dashboard
[ ] Copy review completado y aprobado para cada job
[ ] Publishing pack generado para cada job completado
[ ] Export ZIP generado y descargado

ENTREGA
[ ] ZIP / MP4 entregado a cada cliente
[ ] Captions pegadas y confirmadas (Instagram, TikTok, WhatsApp)
[ ] Feedback de cliente recibido o seguimiento enviado

MANTENIMIENTO
[ ] Dashboard revisado: métricas, errores, jobs pendientes
[ ] storage/temp revisado (limpiar si supera 2 GB)
[ ] Jobs fallidos investigados y documentados
[ ] Notas del cliente actualizadas en /video-editor/clients

FACTURACIÓN
[ ] Horas registradas por cliente
[ ] Factura enviada o programada
```

---

## Tips for High Volume

- Process jobs sequentially — the lock file enforces this, but don't queue more
  than 3 jobs at once to avoid long waits
- Use commercial presets — `barberia_reels`, `agencia_ia_demo`, `podcast_clip` etc.
  save 10 minutes of config per job
- Save client configs — once a client is set up with their sector and branding,
  re-selecting them in the upload screen pre-fills the template
- Check the library — `/video-editor/library` shows all past jobs; use it to
  re-download a ZIP without reprocessing
- BarberiaOS clients — always enable QR overlay and set the booking URL at job
  creation; it cannot be added after processing

---

## Escalation Path

If a job fails:
1. Check the logs panel on the processing screen
2. Common causes: FFmpeg not on PATH, faster-whisper not installed, disk full
3. Retry the job from the processing screen (lock is released automatically after 6h)
4. If the error persists, check `docs/PIPELINE.md` for failure behavior details
