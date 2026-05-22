# Deployment Options — Andres Video Studio

Three deployment tiers are described here: local (current), VPS (next), and
SaaS (future). A Docker note is included for reference. Read the full reasoning
in `ARCHITECTURE_TARGET.md` before choosing a tier.

---

## Option A — Local Windows (current, Level 1)

**Cost**: $0  
**Effort**: already done  
**Users**: 1 (you)  
**Access**: localhost:3000 only

### Requirements
- Node.js 20 LTS or later
- npm 10+
- FFmpeg on PATH (`ffmpeg -version` must succeed)
- Python 3.10+ with faster-whisper in `.venv/` (optional — app falls back to mock)

### How to run
```powershell
npm install
npm run dev       # development, hot reload
npm run build && npm start   # production-like local mode
```

### Storage
All files live under `storage/` in the project root.  
Do not move or delete this folder while jobs are processing.

### Limitations
- One job processes at a time (lock file)
- Heavy renders block the Node process
- No HTTPS, no authentication, no remote access
- `storage/temp` and `storage/exports` grow unbounded

### What NOT to do at this level
- Do not expose port 3000 to the internet without authentication
- Do not run `npm start` as a Windows service without process monitoring
- Do not delete `storage/jobs/` manually while any job is processing

---

## Option B — VPS Linux (Level 2, Phase 4)

**Cost**: ~5–20 €/month (Hetzner CX22, DigitalOcean Droplet, or similar)  
**Effort**: 1–2 days setup  
**Users**: 1–5 (internal agency team)  
**Access**: HTTPS domain

### Recommended VPS specs
| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Stack to install on VPS
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# FFmpeg
sudo apt-get install -y ffmpeg

# Python + faster-whisper
sudo apt-get install -y python3.11 python3.11-venv
python3.11 -m venv .venv
.venv/bin/pip install faster-whisper

# Redis (for BullMQ queue — Level 2 requirement)
sudo apt-get install -y redis-server
sudo systemctl enable redis-server

# Nginx
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### Process management (systemd)
```ini
# /etc/systemd/system/andres-video-studio.service
[Unit]
Description=Andres Video Studio
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/andres-video-studio
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/opt/andres-video-studio/.env.local

[Install]
WantedBy=multi-user.target
```

### Nginx config (HTTPS)
```nginx
server {
    listen 443 ssl;
    server_name studio.yourdomain.com;
    ssl_certificate /etc/letsencrypt/live/studio.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studio.yourdomain.com/privkey.pem;

    client_max_body_size 300M;  # match MAX_UPLOAD_SIZE_MB + headroom

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_read_timeout 600s;   # long enough for video processing polls
    }
}
```

### Key differences from local
- Worker process separated from Next.js (see `WORKER_MIGRATION_PLAN.md`)
- Add NextAuth.js for basic authentication before exposing to the internet
- Nightly cron to clean `storage/temp/` and old `storage/exports/`

### What NOT to do at this level
- Do not expose Redis port 6379 to the internet
- Do not skip authentication — the API has no auth layer yet
- Do not deploy without HTTPS when any client data is involved

---

## Option C — Docker (documentation only, do NOT implement yet)

Docker is documented here for reference. Do not containerise until the worker
is separated from Next.js (Level 2), as a monolithic container provides no
isolation benefit and complicates FFmpeg/Python dependency management.

### When Docker becomes useful
- When you need to deploy identically to multiple VPS machines
- When you want a reproducible build for staging vs. production
- When the worker runs on a separate container from Next.js

### Future Dockerfile sketch (reference only)
```dockerfile
# Next.js image
FROM node:20-alpine AS nextjs
WORKDIR /app
COPY . .
RUN npm ci --production
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]

# Worker image (separate container)
FROM node:20-bookworm AS worker
RUN apt-get update && apt-get install -y ffmpeg python3.11 python3.11-venv
WORKDIR /app
COPY . .
RUN npm ci --production
RUN python3.11 -m venv .venv && .venv/bin/pip install faster-whisper
CMD ["node", "worker.js"]
```

---

## Option D — SaaS with Supabase / R2 / Worker (Level 3, Phase 5+)

See `SAAS_MIGRATION_PLAN.md` for the complete plan.

**Do NOT start this until:**
- [ ] Level 2 worker is separated and stable
- [ ] At least 3 external clients are using the tool
- [ ] A pricing model is validated with real users
- [ ] Supabase project is created and Auth is tested

---

## What NOT to do at any level

| Action | Why |
|---|---|
| Commit `.env.local` to git | Exposes API keys and storage paths |
| Move `storage/` while jobs run | Corrupts in-flight job state |
| Delete `storage/jobs/` manually | Leaves orphaned media with no metadata |
| Run FFmpeg inside an API route directly | Creates untracked processes outside the pipeline |
| Skip the lock file | Allows duplicate processing on the same job |
| Connect Supabase at Level 1 | Premature complexity with no multi-user benefit |
| Add Redis at Level 1 | Only needed when the worker is separated (Level 2) |
