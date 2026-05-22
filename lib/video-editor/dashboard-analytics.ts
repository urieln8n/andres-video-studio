import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { listClients } from "@/lib/video-editor/client-store";
import type {
  VideoEditorClient,
  VideoEditorClientSector,
} from "@/lib/video-editor/client-types";
import { listJobs } from "@/lib/video-editor/job-store";
import type { VideoEditorJob } from "@/lib/video-editor/types";
import { formatBytes } from "@/lib/video-editor/text-sanitize";

const storageRoot = path.join(process.cwd(), "storage");
const storageRoots = {
  clients: path.join(storageRoot, "clients"),
  exports: path.join(storageRoot, "exports"),
  input: path.join(storageRoot, "input"),
  jobs: path.join(storageRoot, "jobs"),
  output: path.join(storageRoot, "output"),
  temp: path.join(storageRoot, "temp"),
  transcripts: path.join(storageRoot, "transcripts"),
} as const;

export type DashboardStats = {
  totalClients: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  uploadedJobs: number;
  barberiaosJobs: number;
  publishingPacks: number;
  exportPackages: number;
  estimatedTimeSavedMinutes: number;
  storageUsageBytes: number;
  storageUsageLabel: string;
};

export type DashboardActivityEvent = {
  id: string;
  type:
    | "client_created"
    | "video_uploaded"
    | "video_completed"
    | "video_failed"
    | "publishing_pack_created"
    | "export_package_created"
    | "copy_approved";
  label: string;
  detail: string;
  timestamp: string;
  tone: "neutral" | "success" | "danger" | "gold";
  href?: string;
};

export type DashboardTopClient = {
  id: string;
  businessName: string;
  sector: VideoEditorClientSector;
  totalJobs: number;
  completedJobs: number;
  lastVideoAt: string | null;
};

export type DashboardProductionDay = {
  key: string;
  label: string;
  dateLabel: string;
  createdJobs: number;
  completedJobs: number;
};

export type DashboardRecentError = {
  jobId: string;
  originalFileName: string;
  clientName: string | null;
  errorMessage: string;
  failedAt: string;
};

export type DashboardStorageUsage = {
  totalBytes: number;
  totalLabel: string;
  jobsBytes: number;
  outputBytes: number;
  exportsBytes: number;
  storageAvailable: boolean;
};

export type DashboardSystemStatus = {
  localMode: true;
  storageAvailable: boolean;
  jobsLoaded: number;
  jobsStorageLabel: string;
  outputStorageLabel: string;
  exportsStorageLabel: string;
  latestErrorAt: string | null;
};

export async function getDashboardStats(
  jobs?: VideoEditorJob[],
  clients?: VideoEditorClient[],
) {
  const [dashboardJobs, dashboardClients, storageUsage] = await Promise.all([
    jobs ? Promise.resolve(jobs) : listJobs(),
    clients ? Promise.resolve(clients) : listClients(),
    getStorageUsage(),
  ]);
  const completedJobs = countStatus(dashboardJobs, "completed");
  const publishingPacks = dashboardJobs.filter(hasPublishingPack).length;
  const exportPackages = dashboardJobs.filter(hasExportPackage).length;

  return {
    totalClients: dashboardClients.length,
    totalJobs: dashboardJobs.length,
    completedJobs,
    failedJobs: countStatus(dashboardJobs, "failed"),
    processingJobs: dashboardJobs.filter(isProcessingJob).length,
    uploadedJobs: countStatus(dashboardJobs, "uploaded"),
    barberiaosJobs: dashboardJobs.filter(isBarberiaOSJob).length,
    publishingPacks,
    exportPackages,
    estimatedTimeSavedMinutes: estimateTimeSaved(
      completedJobs,
      publishingPacks,
      exportPackages,
    ),
    storageUsageBytes: storageUsage.totalBytes,
    storageUsageLabel: storageUsage.totalLabel,
  } satisfies DashboardStats;
}

export async function getRecentActivity(
  jobs?: VideoEditorJob[],
  clients?: VideoEditorClient[],
) {
  const [dashboardJobs, dashboardClients] = await Promise.all([
    jobs ? Promise.resolve(jobs) : listJobs(),
    clients ? Promise.resolve(clients) : listClients(),
  ]);
  const events = [
    ...dashboardClients.flatMap(getClientActivity),
    ...dashboardJobs.flatMap(getJobActivity),
  ];

  return events.sort(sortByTimestamp).slice(0, 10);
}

export async function getTopClients(
  jobs?: VideoEditorJob[],
  clients?: VideoEditorClient[],
) {
  const [dashboardJobs, dashboardClients] = await Promise.all([
    jobs ? Promise.resolve(jobs) : listJobs(),
    clients ? Promise.resolve(clients) : listClients(),
  ]);

  return dashboardClients
    .map((client) => {
      const clientJobs = dashboardJobs.filter(
        (job) => getJobClientId(job) === client.id,
      );

      return {
        id: client.id,
        businessName: client.businessName,
        sector: client.sector,
        totalJobs: clientJobs.length,
        completedJobs: clientJobs.filter((job) => job.status === "completed")
          .length,
        lastVideoAt: getLatestJobDate(clientJobs),
      } satisfies DashboardTopClient;
    })
    .filter((client) => client.totalJobs > 0)
    .sort(
      (left, right) =>
        right.totalJobs - left.totalJobs ||
        getTime(right.lastVideoAt) - getTime(left.lastVideoAt),
    )
    .slice(0, 5);
}

export async function getWeeklyProduction(jobs?: VideoEditorJob[]) {
  const dashboardJobs = jobs ?? (await listJobs());
  const days = getLastSevenDays();

  return days.map((day) => {
    const nextDay = new Date(day);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    return {
      key: day.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        timeZone: "UTC",
      }).format(day),
      dateLabel: new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(day),
      createdJobs: dashboardJobs.filter((job) =>
        isInUtcRange(job.createdAt, day, nextDay),
      ).length,
      completedJobs: dashboardJobs.filter(
        (job) =>
          job.status === "completed" &&
          isInUtcRange(job.updatedAt, day, nextDay),
      ).length,
    } satisfies DashboardProductionDay;
  });
}

export async function getRecentErrors(
  jobs?: VideoEditorJob[],
  clients?: VideoEditorClient[],
) {
  const [dashboardJobs, dashboardClients] = await Promise.all([
    jobs ? Promise.resolve(jobs) : listJobs(),
    clients ? Promise.resolve(clients) : listClients(),
  ]);
  const clientNames = new Map(
    dashboardClients.map((client) => [client.id, client.businessName]),
  );

  return dashboardJobs
    .filter((job) => job.status === "failed")
    .map((job) => ({
      jobId: job.id,
      originalFileName: job.originalFileName || "Vídeo sin nombre",
      clientName:
        job.config?.clientSnapshot?.businessName ||
        clientNames.get(getJobClientId(job) ?? "") ||
        null,
      errorMessage: job.errorMessage || "El job terminó con error sin detalle.",
      failedAt: job.updatedAt || job.createdAt,
    }))
    .sort((left, right) => getTime(right.failedAt) - getTime(left.failedAt))
    .slice(0, 6) satisfies DashboardRecentError[];
}

export async function getStorageUsage() {
  const sizes = await Promise.all(
    Object.entries(storageRoots).map(async ([key, root]) => [
      key,
      await getDirectorySize(root),
    ]),
  );
  const folders = Object.fromEntries(sizes) as Record<
    keyof typeof storageRoots,
    DirectorySize
  >;
  const totalBytes = Object.values(folders).reduce(
    (sum, folder) => sum + folder.bytes,
    0,
  );

  return {
    totalBytes,
    totalLabel: formatBytes(totalBytes),
    jobsBytes: folders.jobs.bytes,
    outputBytes: folders.output.bytes,
    exportsBytes: folders.exports.bytes,
    storageAvailable: Object.values(folders).some((folder) => folder.exists),
  } satisfies DashboardStorageUsage;
}

export async function getSystemStatus(jobs?: VideoEditorJob[]) {
  const [dashboardJobs, storageUsage, errors] = await Promise.all([
    jobs ? Promise.resolve(jobs) : listJobs(),
    getStorageUsage(),
    getRecentErrors(jobs),
  ]);

  return {
    localMode: true,
    storageAvailable: storageUsage.storageAvailable,
    jobsLoaded: dashboardJobs.length,
    jobsStorageLabel: formatBytes(storageUsage.jobsBytes),
    outputStorageLabel: formatBytes(storageUsage.outputBytes),
    exportsStorageLabel: formatBytes(storageUsage.exportsBytes),
    latestErrorAt: errors[0]?.failedAt ?? null,
  } satisfies DashboardSystemStatus;
}

export function estimateTimeSaved(
  completedJobs: number,
  publishingPacks: number,
  exportPackages: number,
) {
  return completedJobs * 25 + publishingPacks * 10 + exportPackages * 5;
}

export function isBarberiaOSJob(job: VideoEditorJob) {
  return job.config?.mode === "barberiaos";
}

export function getJobClientId(job: VideoEditorJob) {
  return job.config?.clientId || job.config?.clientSnapshot?.id || null;
}

function getClientActivity(client: VideoEditorClient) {
  if (!isDateValue(client.createdAt)) {
    return [];
  }

  return [
    {
      id: `client-${client.id}`,
      type: "client_created",
      label: "Cliente creado",
      detail: client.businessName,
      timestamp: client.createdAt,
      tone: "gold",
      href: `/video-editor/clients/${encodeURIComponent(client.id)}`,
    } satisfies DashboardActivityEvent,
  ];
}

function getJobActivity(job: VideoEditorJob) {
  const detail = job.originalFileName || "Vídeo sin nombre";
  const events: DashboardActivityEvent[] = [];

  if (isDateValue(job.createdAt)) {
    events.push({
      id: `uploaded-${job.id}`,
      type: "video_uploaded",
      label: "Vídeo subido",
      detail,
      timestamp: job.createdAt,
      tone: "neutral",
      href: `/video-editor/processing?jobId=${encodeURIComponent(job.id)}`,
    });
  }

  if (isDateValue(job.updatedAt) && job.status === "completed") {
    events.push({
      id: `completed-${job.id}`,
      type: "video_completed",
      label: "Vídeo completado",
      detail,
      timestamp: job.updatedAt,
      tone: "success",
      href: `/video-editor/result?jobId=${encodeURIComponent(job.id)}`,
    });
  }

  if (isDateValue(job.updatedAt) && job.status === "failed") {
    events.push({
      id: `failed-${job.id}`,
      type: "video_failed",
      label: "Vídeo fallido",
      detail,
      timestamp: job.updatedAt,
      tone: "danger",
      href: `/video-editor/processing?jobId=${encodeURIComponent(job.id)}`,
    });
  }

  if (isDateValue(job.updatedAt) && hasPublishingPack(job)) {
    events.push({
      id: `publishing-${job.id}`,
      type: "publishing_pack_created",
      label: "Publishing pack generado",
      detail,
      timestamp: job.updatedAt,
      tone: "gold",
      href: `/video-editor/result?jobId=${encodeURIComponent(job.id)}`,
    });
  }

  if (isDateValue(job.updatedAt) && hasExportPackage(job)) {
    events.push({
      id: `export-${job.id}`,
      type: "export_package_created",
      label: "ZIP generado",
      detail,
      timestamp: job.updatedAt,
      tone: "success",
      href: `/video-editor/result?jobId=${encodeURIComponent(job.id)}`,
    });
  }

  const approvedAt =
    job.finalCopy?.approvedAt ||
    (job.status === "copy_approved" ? job.updatedAt : null);

  if (approvedAt && isDateValue(approvedAt)) {
    events.push({
      id: `copy-${job.id}`,
      type: "copy_approved",
      label: "Copy aprobado",
      detail,
      timestamp: approvedAt,
      tone: "neutral",
      href: `/video-editor/copy?jobId=${encodeURIComponent(job.id)}`,
    });
  }

  return events;
}

function hasPublishingPack(job: VideoEditorJob) {
  return job.publishingPackCreated === true || Boolean(job.publishingPackPath);
}

function hasExportPackage(job: VideoEditorJob) {
  return job.exportPackageCreated === true || Boolean(job.exportPackagePath);
}

function isProcessingJob(job: VideoEditorJob) {
  return job.status === "processing" || job.status === "rendering_final";
}

function countStatus(jobs: VideoEditorJob[], status: VideoEditorJob["status"]) {
  return jobs.filter((job) => job.status === status).length;
}

function getLatestJobDate(jobs: VideoEditorJob[]) {
  return jobs
    .map((job) => job.createdAt)
    .filter(isDateValue)
    .sort((left, right) => getTime(right) - getTime(left))[0] ?? null;
}

function getLastSevenDays() {
  const today = new Date();
  const utcToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(utcToday);
    day.setUTCDate(day.getUTCDate() - (6 - index));
    return day;
  });
}

function isInUtcRange(value: string | undefined, start: Date, end: Date) {
  const time = getTime(value);

  return time >= start.getTime() && time < end.getTime();
}

function isDateValue(value: string | null | undefined): value is string {
  return Boolean(value) && Number.isFinite(Date.parse(value!));
}

function getTime(value: string | null | undefined) {
  const time = value ? Date.parse(value) : Number.NaN;

  return Number.isFinite(time) ? time : 0;
}

function sortByTimestamp(
  left: DashboardActivityEvent,
  right: DashboardActivityEvent,
) {
  return getTime(right.timestamp) - getTime(left.timestamp);
}

type DirectorySize = {
  bytes: number;
  exists: boolean;
};

async function getDirectorySize(root: string): Promise<DirectorySize> {
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const sizes = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(root, entry.name);

        if (!isInsideStorage(entryPath)) {
          return 0;
        }

        if (entry.isDirectory()) {
          return (await getDirectorySize(entryPath)).bytes;
        }

        if (!entry.isFile()) {
          return 0;
        }

        try {
          return (await stat(entryPath)).size;
        } catch {
          return 0;
        }
      }),
    );

    return {
      bytes: sizes.reduce((sum, size) => sum + size, 0),
      exists: true,
    };
  } catch {
    return { bytes: 0, exists: false };
  }
}

function isInsideStorage(candidate: string) {
  const relative = path.relative(path.resolve(storageRoot), path.resolve(candidate));

  return (
    relative.length > 0 &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}
