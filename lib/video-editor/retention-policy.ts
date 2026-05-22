import { readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

import { listJobs } from "@/lib/video-editor/job-store";
import { isPathInsideRoot } from "@/lib/video-editor/safe-paths";
import { formatBytes } from "@/lib/video-editor/text-sanitize";

// ─── Configuration ───────────────────────────────────────────────────────────

const TEMP_MAX_AGE_DAYS = 3;
const EXPORT_MAX_AGE_DAYS = 7;
const STORAGE_ROOT_SEGMENT = "storage";

// UUID prefix pattern for temp file names (e.g. "{uuid}.wav", "{uuid}_clean.mp4")
const UUID_PREFIX_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i;

// ─── Public types ────────────────────────────────────────────────────────────

export type RetentionCategory = "temp" | "export";

export type RetentionCandidate = {
  absolutePath: string;
  relativePath: string;
  sizeBytes: number;
  sizeLabel: string;
  ageDays: number;
  category: RetentionCategory;
  reason: string;
};

export type RetentionSummary = {
  tempFiles: number;
  exportDirs: number;
  orphanFiles: number;
  totalCandidates: number;
  estimatedReclaimBytes: number;
  estimatedReclaimLabel: string;
  thresholds: {
    tempMaxAgeDays: number;
    exportMaxAgeDays: number;
  };
  scannedAt: string;
};

export type RetentionReport = {
  summary: RetentionSummary;
  candidates: RetentionCandidate[];
};

export type CleanupResult = {
  deletedItems: number;
  reclaimedBytes: number;
  reclaimedLabel: string;
  skipped: number;
  errors: string[];
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Scan storage folders and return a report of files safe to delete.
 * This function is READ-ONLY — it never deletes anything.
 *
 * Candidates:
 * - `storage/temp/` files older than TEMP_MAX_AGE_DAYS
 * - `storage/exports/{jobId}/` directories older than EXPORT_MAX_AGE_DAYS
 * - `storage/temp/` files whose job ID has no corresponding job JSON (orphans)
 */
export async function auditRetention(): Promise<RetentionReport> {
  const storageRoot = resolveStorageRoot();
  const tempRoot = path.join(storageRoot, "temp");
  const exportsRoot = path.join(storageRoot, "exports");

  const [jobs, tempCandidates, exportCandidates] = await Promise.all([
    safeListJobs(),
    scanTempFiles(tempRoot, storageRoot),
    scanExportDirs(exportsRoot, storageRoot),
  ]);

  const jobIds = new Set(jobs.map((j) => j.id));
  const orphanCount = tempCandidates.filter(
    (c) => c.reason.includes("huérfano"),
  ).length;

  const candidates = [...tempCandidates, ...exportCandidates];

  // Deduplicate by absolute path
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    if (seen.has(c.absolutePath)) return false;
    seen.add(c.absolutePath);
    return true;
  });

  // Mark candidates whose job ID is no longer in the store
  const annotated = unique.map((c) => {
    const match = UUID_PREFIX_PATTERN.exec(path.basename(c.absolutePath));
    const jobId = match?.[1];
    if (jobId && !jobIds.has(jobId)) {
      return {
        ...c,
        reason: c.reason.includes("huérfano") ? c.reason : `${c.reason} · job no existe`,
      };
    }
    return c;
  });

  const totalBytes = annotated.reduce((sum, c) => sum + c.sizeBytes, 0);

  return {
    summary: {
      tempFiles: tempCandidates.length,
      exportDirs: exportCandidates.length,
      orphanFiles: orphanCount,
      totalCandidates: annotated.length,
      estimatedReclaimBytes: totalBytes,
      estimatedReclaimLabel: formatBytes(totalBytes),
      thresholds: {
        tempMaxAgeDays: TEMP_MAX_AGE_DAYS,
        exportMaxAgeDays: EXPORT_MAX_AGE_DAYS,
      },
      scannedAt: new Date().toISOString(),
    },
    candidates: annotated,
  };
}

/**
 * Delete temp files and export directories identified by auditRetention().
 *
 * Rules:
 * - Requires explicit confirmation token.
 * - Never deletes: storage/input, storage/output, storage/jobs, storage/clients.
 * - Only deletes: storage/temp (old files) and storage/exports (old dirs).
 * - All paths are validated with isPathInsideRoot before deletion.
 */
export async function cleanupOldFiles(confirm: string): Promise<CleanupResult> {
  if (confirm !== "DELETE_TEMP_AND_OLD_EXPORTS") {
    throw new Error(
      'Se requiere confirm: "DELETE_TEMP_AND_OLD_EXPORTS" para ejecutar la limpieza.',
    );
  }

  const storageRoot = resolveStorageRoot();
  const tempRoot = path.join(storageRoot, "temp");
  const exportsRoot = path.join(storageRoot, "exports");

  const report = await auditRetention();
  let deletedItems = 0;
  let reclaimedBytes = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const candidate of report.candidates) {
    const absPath = candidate.absolutePath;

    // Safety: only allow temp/ and exports/ — never input/, output/, jobs/, clients/
    const insideTmp = isPathInsideRoot(tempRoot, absPath);
    const insideExp = isPathInsideRoot(exportsRoot, absPath);

    if (!insideTmp && !insideExp) {
      skipped++;
      continue;
    }

    // Double-check the candidate is inside the storage root
    if (!isPathInsideRoot(storageRoot, absPath)) {
      errors.push(`Ruta rechazada por seguridad: ${candidate.relativePath}`);
      skipped++;
      continue;
    }

    try {
      const fileStat = await stat(absPath).catch(() => null);
      if (!fileStat) {
        skipped++;
        continue;
      }

      await rm(absPath, { force: true, recursive: fileStat.isDirectory() });
      deletedItems++;
      reclaimedBytes += candidate.sizeBytes;
    } catch (error) {
      errors.push(
        `Error al borrar ${candidate.relativePath}: ${
          error instanceof Error ? error.message : "desconocido"
        }`,
      );
    }
  }

  return {
    deletedItems,
    reclaimedBytes,
    reclaimedLabel: formatBytes(reclaimedBytes),
    skipped,
    errors,
  };
}

// ─── Scanner helpers ──────────────────────────────────────────────────────────

async function scanTempFiles(
  tempRoot: string,
  storageRoot: string,
): Promise<RetentionCandidate[]> {
  const now = Date.now();
  const maxAgeMs = TEMP_MAX_AGE_DAYS * 24 * 60 * 60 * 1_000;
  const candidates: RetentionCandidate[] = [];

  const entries = await readdir(tempRoot, { withFileTypes: true }).catch(() => null);
  if (!entries) return [];

  await Promise.all(
    entries
      .filter((e) => e.isFile())
      .map(async (entry) => {
        const absPath = path.join(tempRoot, entry.name);

        if (!isPathInsideRoot(storageRoot, absPath)) {
          return;
        }

        try {
          const fileStat = await stat(absPath);
          const ageDays = (now - fileStat.mtimeMs) / (24 * 60 * 60 * 1_000);

          const matchId = UUID_PREFIX_PATTERN.exec(entry.name);
          const isOrphan = matchId ? false : true; // refined later with job list
          const isStale = ageDays >= TEMP_MAX_AGE_DAYS;

          if (!isStale && !isOrphan) {
            return;
          }

          candidates.push({
            absolutePath: absPath,
            relativePath: path.relative(storageRoot, absPath).replace(/\\/g, "/"),
            sizeBytes: fileStat.size,
            sizeLabel: formatBytes(fileStat.size),
            ageDays: Math.floor(ageDays),
            category: "temp",
            reason: isOrphan
              ? `archivo temp huérfano (sin job UUID reconocido)`
              : `temp > ${TEMP_MAX_AGE_DAYS} días`,
          });
        } catch {
          // File disappeared between readdir and stat — skip
        }
      }),
  );

  return candidates;
}

async function scanExportDirs(
  exportsRoot: string,
  storageRoot: string,
): Promise<RetentionCandidate[]> {
  const now = Date.now();
  const maxAgeMs = EXPORT_MAX_AGE_DAYS * 24 * 60 * 60 * 1_000;
  const candidates: RetentionCandidate[] = [];

  const entries = await readdir(exportsRoot, { withFileTypes: true }).catch(() => null);
  if (!entries) return [];

  await Promise.all(
    entries
      .filter((e) => e.isDirectory())
      .map(async (entry) => {
        const absPath = path.join(exportsRoot, entry.name);

        if (!isPathInsideRoot(storageRoot, absPath)) {
          return;
        }

        try {
          const dirStat = await stat(absPath);
          const ageDays = (now - dirStat.mtimeMs) / (24 * 60 * 60 * 1_000);

          if (ageDays < EXPORT_MAX_AGE_DAYS) {
            return;
          }

          const sizeBytes = await getDirectorySize(absPath, storageRoot);

          candidates.push({
            absolutePath: absPath,
            relativePath: path.relative(storageRoot, absPath).replace(/\\/g, "/"),
            sizeBytes,
            sizeLabel: formatBytes(sizeBytes),
            ageDays: Math.floor(ageDays),
            category: "export",
            reason: `export ZIP > ${EXPORT_MAX_AGE_DAYS} días`,
          });
        } catch {
          // Directory disappeared between readdir and stat — skip
        }
      }),
  );

  return candidates;
}

async function getDirectorySize(
  dirPath: string,
  storageRoot: string,
): Promise<number> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const sizes = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);

        if (!isPathInsideRoot(storageRoot, entryPath)) {
          return 0;
        }

        if (entry.isFile()) {
          try {
            return (await stat(entryPath)).size;
          } catch {
            return 0;
          }
        }

        if (entry.isDirectory()) {
          return getDirectorySize(entryPath, storageRoot);
        }

        return 0;
      }),
    );

    return sizes.reduce((sum, s) => sum + s, 0);
  } catch {
    return 0;
  }
}

function resolveStorageRoot(): string {
  return path.resolve(process.cwd(), STORAGE_ROOT_SEGMENT);
}

async function safeListJobs() {
  try {
    return await listJobs();
  } catch {
    return [];
  }
}
