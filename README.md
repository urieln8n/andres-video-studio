# ANDRES VIDEO STUDIO

Editor de video local para crear clips con upload, jobs JSON, FFmpeg,
transcripcion opcional con faster-whisper, subtitulos ASS, copy review,
publishing packs, ZIP de entrega, clientes y dashboard de agencia.

El proyecto guarda artefactos en `storage/` dentro del workspace. No depende de
Supabase, Redis, Docker ni APIs pagadas para el flujo base.

## Requisitos

- Windows compatible con Node.js y PowerShell.
- Node.js con `npm`.
- FFmpeg disponible en `PATH` para procesar videos.
- Python local opcional para transcripcion real con `faster-whisper`.

## Instalacion

```powershell
npm install
```

Para activar transcripcion real en Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install faster-whisper
```

El proceso usa `.venv\Scripts\python.exe` cuando existe y cae al launcher
`py` en Windows. Sin `faster-whisper`, el render conserva subtitulos mock.

## Flujo local

1. Ejecuta `npm run dev`.
2. Abre `/video-editor`.
3. Sube un video y revisa la configuracion.
4. Sigue progreso y logs en `/video-editor/processing`.
5. Revisa copy cuando el job lo pida.
6. Abre resultado, descarga MP4 y genera ZIP si procede.
7. Usa library, clients y dashboard para controlar jobs locales.

## Comandos

```powershell
npm run dev
npm run build
npm run lint
```

En Windows, deten `next dev` antes de `npm run build` si el servidor mantiene
logs abiertos dentro de `.next`.

## Rutas utiles

- Editor: `/video-editor`
- Biblioteca: `/video-editor/library`
- Clientes: `/video-editor/clients`
- Dashboard de agencia: `/video-editor/dashboard`
- Modo BarberiaOS: `/video-editor/barberiaos`

## Limitaciones actuales

- El pipeline corre en el proceso local de Next; todavia no hay worker separado.
- La transcripcion puede caer a subtitulos mock cuando Python o faster-whisper no estan disponibles.
- `storage/temp` y `storage/exports` pueden crecer; no hay limpieza automatica.
- ZIP y downloads actuales no estan optimizados para ficheros muy grandes.
- Los locks de procesamiento son locales por archivo; se limpian si superan el umbral stale, pero no coordinan varias maquinas.

## Documentacion

- `docs/ARCHITECTURE.md`
- `docs/PIPELINE.md`
- `docs/STORAGE.md`
- `docs/ROADMAP.md`
- `docs/LOCAL_TEST_CHECKLIST.md`
