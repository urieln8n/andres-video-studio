import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import { formatFileSize } from "@/lib/video-editor/export-profiles";
import { resolveFinalVideoFile } from "@/lib/video-editor/file-response";
import {
  ensureVideoEditorStorage,
  fileHasContent,
  getExportPackageDirAbsolutePath,
  getExportPackageDirRelativePath,
  getExportsRootAbsolutePath,
  isValidVideoEditorJobId,
  updateJob,
} from "@/lib/video-editor/job-store";
import { sanitizeClientSlug } from "@/lib/video-editor/client-utils";
import {
  createAndSavePublishingPack,
  loadPublishingPack,
} from "@/lib/video-editor/publishing-pack-engine";
import { touchJob } from "@/lib/video-editor/progress";
import type {
  VideoEditorExportPackage,
  VideoEditorExportPackageFile,
  VideoEditorJob,
  VideoEditorPublishingPack,
} from "@/lib/video-editor/types";

type ExportSourceFile = VideoEditorExportPackageFile & {
  absolutePath: string;
};

const barberiaosInstructions = [
  "Publica el vídeo en Reels/TikTok/Shorts.",
  "Pon el link de reservas en la bio.",
  "Comparte el vídeo por WhatsApp.",
  "Usa el QR en historias.",
  "Fija el vídeo si es una promoción.",
  "Revisa comentarios y mensajes.",
  "Repite con huecos libres cada semana.",
];

export async function createExportPackage(job: VideoEditorJob) {
  if (!isValidVideoEditorJobId(job.id)) {
    throw new Error("Job inválido para exportar.");
  }

  const finalVideo = await resolveFinalVideoFile(job);

  if (!finalVideo) {
    throw new Error("El vídeo final no está disponible para exportar.");
  }

  const publishingPack =
    (await loadPublishingPack(job.id)) ??
    (await createAndSavePublishingPack(job)).publishingPack;
  const config = normalizeVideoEditorConfig(job.config ?? {
    templateId: job.templateId,
    hookText: job.hookText,
    ctaText: job.ctaText,
  });
  const exportDirAbsolutePath = getExportPackageDirAbsolutePath(job.id);
  const zipName = createZipName(job);
  const zipAbsolutePath = path.join(exportDirAbsolutePath, zipName);
  const createdAt = new Date().toISOString();

  await ensureVideoEditorStorage();
  await mkdir(exportDirAbsolutePath, { recursive: true });

  const files = await writePackageFiles({
    config,
    createdAt,
    exportDirAbsolutePath,
    finalVideoAbsolutePath: finalVideo.absolutePath,
    job,
    publishingPack,
  });

  await writeStoredZip(
    zipAbsolutePath,
    await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        data: await readFile(file.absolutePath),
      })),
    ),
  );

  const zipStat = await stat(zipAbsolutePath);
  const exportPackage = {
    jobId: job.id,
    exportDir: getExportPackageDirRelativePath(job.id),
    zipPath: path.posix.join(getExportPackageDirRelativePath(job.id), zipName),
    files: files.map(({ absolutePath: _absolutePath, ...file }) => file),
    createdAt,
    sizeBytes: zipStat.size,
    sizeLabel: formatFileSize(zipStat.size),
  } satisfies VideoEditorExportPackage;

  await updateJob(job.id, (currentJob) =>
    touchJob({
      ...currentJob,
      exportPackagePath: exportPackage.zipPath,
      exportPackageCreated: true,
      exportPackageSizeBytes: exportPackage.sizeBytes,
      exportPackageSizeLabel: exportPackage.sizeLabel,
    }),
  );

  return exportPackage;
}

export async function resolveExportPackageZip(job: VideoEditorJob) {
  if (!job.exportPackagePath || !isValidVideoEditorJobId(job.id)) {
    return null;
  }

  const exportsRoot = getExportsRootAbsolutePath();
  const expectedDir = path.resolve(getExportPackageDirAbsolutePath(job.id));
  const normalizedPath = job.exportPackagePath.replace(/\\/g, "/");
  const candidate = path.resolve(
    exportsRoot,
    path.posix.relative("storage/exports", normalizedPath),
  );

  if (
    path.isAbsolute(job.exportPackagePath) ||
    !normalizedPath.startsWith(`storage/exports/${job.id}/`) ||
    normalizedPath.includes("../") ||
    path.extname(candidate).toLowerCase() !== ".zip" ||
    !path.basename(candidate).startsWith("andres-video-studio-") ||
    !path.basename(candidate).endsWith(`-${job.id}.zip`) ||
    !isInsideRoot(exportsRoot, expectedDir) ||
    !isInsideRoot(expectedDir, candidate) ||
    !(await fileHasContent(candidate))
  ) {
    return null;
  }

  const zipStat = await stat(candidate);

  return {
    absolutePath: candidate,
    fileName: path.basename(candidate),
    size: zipStat.size,
  };
}

async function writePackageFiles({
  config,
  createdAt,
  exportDirAbsolutePath,
  finalVideoAbsolutePath,
  job,
  publishingPack,
}: {
  config: ReturnType<typeof normalizeVideoEditorConfig>;
  createdAt: string;
  exportDirAbsolutePath: string;
  finalVideoAbsolutePath: string;
  job: VideoEditorJob;
  publishingPack: VideoEditorPublishingPack;
}) {
  const files: ExportSourceFile[] = [];
  const client = config.clientSnapshot;

  await addVideo("video-final.mp4", finalVideoAbsolutePath);
  await addText(
    "instagram-caption.txt",
    joinBlocks([
      publishingPack.instagramCaption,
      publishingPack.hashtags.join(" "),
      (config.mode === "barberiaos" || client?.sector === "barberia") &&
      (client?.bookingUrl || config.barberiaos.bookingUrl)
        ? "Recomendación: añade el link de reserva en la bio o en una historia."
        : "",
    ]),
  );
  await addText(
    "tiktok-caption.txt",
    joinBlocks([publishingPack.tiktokCaption, publishingPack.hashtags.slice(0, 5).join(" ")]),
  );
  await addText(
    "youtube-shorts-description.txt",
    joinBlocks([
      publishingPack.title,
      publishingPack.youtubeShortsDescription,
      publishingPack.hashtags.join(" "),
    ]),
  );
  await addText(
    "whatsapp-text.txt",
    appendBookingUrl(
      publishingPack.whatsappText,
      client?.bookingUrl || config.barberiaos.bookingUrl,
    ),
  );
  await addText(
    "story-text.txt",
    joinBlocks([
      publishingPack.instagramStoryText,
      config.mode === "barberiaos" && job.qrPath ? "Escanea el QR para reservar." : "",
    ]),
  );
  await addText(
    "hashtags.txt",
    joinBlocks([
      publishingPack.hashtags.join(" "),
      publishingPack.hashtags.join("\n"),
    ]),
  );
  await addText(
    "publishing-checklist.txt",
    publishingPack.postingChecklist
      .map((item) => `- ${cleanText(item, 220)}`)
      .join("\n"),
  );

  if (config.mode === "barberiaos") {
    await addText(
      "barberiaos-instructions.txt",
      barberiaosInstructions.map((item) => `- ${item}`).join("\n"),
    );
  }

  if (client) {
    await addText(
      "client-info.txt",
      joinBlocks([
        `Nombre negocio: ${client.businessName}`,
        `Sector: ${client.sector}`,
        `Web: ${client.website || "Sin web"}`,
        `Instagram: ${client.instagram || "Sin Instagram"}`,
        `Booking URL: ${client.bookingUrl || "Sin link"}`,
        "Notas útiles: datos guardados en el snapshot del job.",
      ]),
    );
    await addJson("client-branding.json", {
      id: client.id,
      businessName: client.businessName,
      sector: client.sector,
      website: client.website,
      instagram: client.instagram,
      bookingUrl: client.bookingUrl,
      brandColor: client.brandColor,
    });
  }

  await addJson("metadata.json", {
    jobId: job.id,
    originalFileName: cleanText(job.originalFileName, 180),
    clientName: client?.businessName,
    finalVideoFile: "video-final.mp4",
    platformPreset: config.platformPreset,
    commercialPresetId: config.commercialPreset,
    templateId: config.templateId,
    outputFormat: config.outputFormat,
    exportQuality: config.exportQuality,
    finalHookText: cleanText(
      job.finalCopy?.selectedHook || job.finalHookText || job.hookText,
      240,
    ),
    finalCtaText: cleanText(
      job.finalCopy?.selectedCta || job.finalCtaText || job.ctaText,
      240,
    ),
    hashtags: publishingPack.hashtags,
    mode: config.mode,
    barberiaos: config.mode === "barberiaos" ? config.barberiaos : undefined,
    createdAt: job.createdAt,
    packageCreatedAt: createdAt,
  });

  return files;

  async function addVideo(name: string, sourcePath: string) {
    const absolutePath = safePackageFilePath(exportDirAbsolutePath, name);

    await copyFile(sourcePath, absolutePath);
    files.push(createFileDescriptor(name, absolutePath, "video", job.id));
  }

  async function addText(name: string, content: string) {
    const absolutePath = safePackageFilePath(exportDirAbsolutePath, name);

    await writeFile(absolutePath, `${cleanMultilineText(content, 10_000)}\n`, "utf8");
    files.push(createFileDescriptor(name, absolutePath, "text", job.id));
  }

  async function addJson(name: string, content: object) {
    const absolutePath = safePackageFilePath(exportDirAbsolutePath, name);

    await writeFile(absolutePath, JSON.stringify(content, null, 2), "utf8");
    files.push(createFileDescriptor(name, absolutePath, "json", job.id));
  }
}

function createZipName(job: VideoEditorJob) {
  const clientName = sanitizeClientSlug(job.config?.clientSnapshot?.businessName || "");

  return clientName
    ? `andres-video-studio-${clientName}-${job.id}.zip`
    : `andres-video-studio-${job.id}.zip`;
}

function createFileDescriptor(
  name: string,
  absolutePath: string,
  type: VideoEditorExportPackageFile["type"],
  jobId: string,
) {
  return {
    name,
    absolutePath,
    path: path.posix.join(getExportPackageDirRelativePath(jobId), name),
    type,
  } satisfies ExportSourceFile;
}

function safePackageFilePath(exportDirAbsolutePath: string, name: string) {
  const candidate = path.resolve(exportDirAbsolutePath, path.basename(name));

  if (!isInsideRoot(path.resolve(exportDirAbsolutePath), candidate)) {
    throw new Error("Archivo de exportación fuera del directorio permitido.");
  }

  return candidate;
}

async function writeStoredZip(
  zipAbsolutePath: string,
  entries: Array<{ name: string; data: Buffer }>,
) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    if (entry.data.byteLength > 0xffffffff) {
      throw new Error("El paquete supera el tamaño ZIP soportado.");
    }

    const name = Buffer.from(path.posix.basename(entry.name), "utf8");
    const checksum = crc32(entry.data);
    const localHeader = Buffer.alloc(30);
    const centralHeader = Buffer.alloc(46);

    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt32LE(0, 10);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(entry.data.byteLength, 18);
    localHeader.writeUInt32LE(entry.data.byteLength, 22);
    localHeader.writeUInt16LE(name.byteLength, 26);
    localHeader.writeUInt16LE(0, 28);

    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt32LE(0, 12);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(entry.data.byteLength, 20);
    centralHeader.writeUInt32LE(entry.data.byteLength, 24);
    centralHeader.writeUInt16LE(name.byteLength, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    localParts.push(localHeader, name, entry.data);
    centralParts.push(centralHeader, name);
    offset += localHeader.byteLength + name.byteLength + entry.data.byteLength;
  }

  const centralSize = centralParts.reduce((size, part) => size + part.byteLength, 0);
  const end = Buffer.alloc(22);

  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await writeFile(zipAbsolutePath, Buffer.concat([...localParts, ...centralParts, end]));
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});

function appendBookingUrl(text: string, bookingUrl: string | null) {
  const cleanUrl = cleanText(bookingUrl, 320);

  return cleanUrl && !text.includes(cleanUrl)
    ? joinBlocks([text, `Link de reserva: ${cleanUrl}`])
    : text;
}

function joinBlocks(values: Array<string | false>) {
  return values
    .map((value) => cleanMultilineText(value || "", 10_000))
    .filter(Boolean)
    .join("\n\n");
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return stripText(value).replace(/\s+/g, " ").slice(0, maxLength).trim();
}

function cleanMultilineText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return stripText(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, maxLength)
    .trim();
}

function stripText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0009\u000b-\u001f]/g, " ");
}

function isInsideRoot(root: string, candidate: string) {
  const relative = path.relative(root, candidate);

  return (
    relative.length > 0 &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}
