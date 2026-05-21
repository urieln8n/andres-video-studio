import { writeFile } from "node:fs/promises";

import {
  VIDEO_EDITOR_ALLOWED_EXTENSIONS,
  VIDEO_EDITOR_MAX_FILE_SIZE,
  createUploadedJob,
  ensureVideoEditorStorage,
  getInputAbsolutePath,
  isAllowedVideoFileName,
  writeJob,
} from "@/lib/video-editor/job-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const video = formData.get("video");

  if (!(video instanceof File)) {
    return Response.json(
      { error: "Debes enviar un archivo de vídeo en el campo video." },
      { status: 400 },
    );
  }

  if (!isAllowedVideoFileName(video.name)) {
    return Response.json(
      {
        error: `Formato no permitido. Usa ${VIDEO_EDITOR_ALLOWED_EXTENSIONS.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (video.size <= 0) {
    return Response.json(
      { error: "El archivo de vídeo está vacío." },
      { status: 400 },
    );
  }

  if (video.size > VIDEO_EDITOR_MAX_FILE_SIZE) {
    return Response.json(
      { error: "El tamaño máximo inicial es 250MB." },
      { status: 413 },
    );
  }

  const job = createUploadedJob(video.name);

  await ensureVideoEditorStorage();
  await writeFile(
    getInputAbsolutePath(job.storedFileName),
    Buffer.from(await video.arrayBuffer()),
  );
  await writeJob(job);

  return Response.json({ jobId: job.id }, { status: 201 });
}

