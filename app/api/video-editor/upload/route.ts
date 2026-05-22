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
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import { createClientSnapshot } from "@/lib/video-editor/client-utils";
import { readClient } from "@/lib/video-editor/client-store";
import { apiError, apiOk } from "@/lib/video-editor/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const video = formData.get("video");
  const requestedConfig = normalizeVideoEditorConfig(Object.fromEntries(formData));
  const client = requestedConfig.clientId
    ? await readClient(requestedConfig.clientId)
    : null;
  const config = normalizeVideoEditorConfig({
    ...requestedConfig,
    clientId: client?.id ?? null,
    clientSnapshot: client ? createClientSnapshot(client) : null,
    ...(client?.sector === "barberia"
      ? {
          mode: "barberiaos",
          templateId: "barberia",
          bookingUrl:
            requestedConfig.barberiaos.bookingUrl || client.bookingUrl || null,
          barbershopName:
            requestedConfig.barberiaos.barbershopName ||
            client.businessName,
        }
      : {}),
  });

  if (!(video instanceof File)) {
    return apiError("Debes enviar un archivo de vídeo en el campo video.");
  }

  if (!isAllowedVideoFileName(video.name)) {
    return apiError(
      `Formato no permitido. Usa ${VIDEO_EDITOR_ALLOWED_EXTENSIONS.join(", ")}.`,
    );
  }

  if (video.size <= 0) {
    return apiError("El archivo de vídeo está vacío.");
  }

  if (video.size > VIDEO_EDITOR_MAX_FILE_SIZE) {
    return apiError("El tamaño máximo inicial es 250MB.", 413);
  }

  const job = createUploadedJob(video.name, config);

  await ensureVideoEditorStorage();
  await writeFile(
    getInputAbsolutePath(job.storedFileName),
    Buffer.from(await video.arrayBuffer()),
  );
  await writeJob(job);

  return apiOk({ jobId: job.id }, { status: 201 });
}
