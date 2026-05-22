import { spawn } from "node:child_process";
import { access, constants as fsConstants } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import { FEATURE_FLAGS } from "@/lib/video-editor/feature-flags";
import { STORAGE_FOLDERS } from "@/lib/video-editor/limits";

const accessAsync = promisify(access);
const BINARY_TIMEOUT_MS = 3_000;

// ─── Public types ────────────────────────────────────────────────────────────

export type HealthCheckStatus = "healthy" | "degraded";

export type HealthCheckStorageResult = {
  ok: boolean;
  folders: Record<string, boolean>;
};

export type HealthCheckBinaryResult = {
  ok: boolean;
  available: boolean;
  version?: string;
  detail?: string;
};

export type HealthCheckFeatureResult = {
  ok: boolean;
  enabled: boolean;
};

export type HealthCheckResult = {
  ok: boolean;
  status: HealthCheckStatus;
  checks: {
    storage: HealthCheckStorageResult;
    ffmpeg: HealthCheckBinaryResult;
    python: HealthCheckBinaryResult;
    whisper: HealthCheckBinaryResult;
    hyperframes: HealthCheckFeatureResult;
  };
  warnings: string[];
  timestamp: string;
};

// ─── Public API ──────────────────────────────────────────────────────────────

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const [storage, ffmpeg, python] = await Promise.all([
    checkStorage(),
    checkFfmpeg(),
    checkPython(),
  ]);

  const whisper = await checkWhisper(python.available);
  const hyperframes = checkHyperframes();

  const warnings: string[] = [];

  if (!ffmpeg.available) {
    warnings.push(
      "FFmpeg no encontrado en PATH. El procesamiento de vídeo fallará.",
    );
  }
  if (!python.available) {
    warnings.push(
      "Python no encontrado. La transcripción usará subtítulos mock.",
    );
  }
  if (python.available && !whisper.available) {
    warnings.push(
      "faster-whisper no detectado. La transcripción usará subtítulos mock.",
    );
  }
  if (!hyperframes.enabled) {
    warnings.push("Hyperframes desactivado. Se usa el motor de overlay estático.");
  }

  // Storage + FFmpeg son los únicos requisitos críticos para el pipeline.
  const ok = storage.ok && ffmpeg.available;
  const status: HealthCheckStatus =
    ok && warnings.length <= 2 ? "healthy" : "degraded";

  return {
    ok,
    status,
    checks: { storage, ffmpeg, python, whisper, hyperframes },
    warnings,
    timestamp: new Date().toISOString(),
  };
}

// ─── Storage check ───────────────────────────────────────────────────────────

const REQUIRED_STORAGE_FOLDERS = ["jobs", "output", "input"] as const;
const OPTIONAL_STORAGE_FOLDERS = [
  "temp",
  "transcripts",
  "exports",
  "clients",
] as const;

async function checkStorage(): Promise<HealthCheckStorageResult> {
  const storageRoot = path.resolve(process.cwd(), STORAGE_FOLDERS.root);
  const allFolders = [
    ...REQUIRED_STORAGE_FOLDERS,
    ...OPTIONAL_STORAGE_FOLDERS,
  ];

  const entries = await Promise.all(
    allFolders.map(async (folder) => {
      const folderPath = path.join(storageRoot, folder);
      try {
        // eslint-disable-next-line no-bitwise
        await accessAsync(folderPath, fsConstants.R_OK | fsConstants.W_OK);
        return [folder, true] as const;
      } catch {
        return [folder, false] as const;
      }
    }),
  );

  const folders = Object.fromEntries(entries);
  const requiredOk = REQUIRED_STORAGE_FOLDERS.every((f) => folders[f] === true);

  return { ok: requiredOk, folders };
}

// ─── FFmpeg check ────────────────────────────────────────────────────────────

async function checkFfmpeg(): Promise<HealthCheckBinaryResult> {
  try {
    const output = await runBinary("ffmpeg", ["-version"], BINARY_TIMEOUT_MS);
    const versionMatch = output.match(/ffmpeg version ([^\s]+)/);
    return { ok: true, available: true, version: versionMatch?.[1] };
  } catch (error) {
    return {
      ok: false,
      available: false,
      detail: error instanceof Error ? error.message : "No disponible",
    };
  }
}

// ─── Python check ────────────────────────────────────────────────────────────

async function checkPython(): Promise<HealthCheckBinaryResult> {
  const command = await resolvePythonCommand();

  try {
    const output = await runBinary(command, ["--version"], BINARY_TIMEOUT_MS);
    const versionMatch = output.match(/Python ([\d.]+)/);
    return { ok: true, available: true, version: versionMatch?.[1] };
  } catch (error) {
    return {
      ok: false,
      available: false,
      detail: error instanceof Error ? error.message : "No disponible",
    };
  }
}

// ─── Whisper check ───────────────────────────────────────────────────────────

async function checkWhisper(
  pythonAvailable: boolean,
): Promise<HealthCheckBinaryResult> {
  if (!pythonAvailable) {
    return { ok: false, available: false, detail: "Python no disponible" };
  }

  const transcribeScript = path.join(
    process.cwd(),
    "scripts",
    "transcribe.py",
  );

  try {
    await accessAsync(transcribeScript, fsConstants.R_OK);
    return { ok: true, available: true };
  } catch {
    return {
      ok: false,
      available: false,
      detail: "scripts/transcribe.py no encontrado",
    };
  }
}

// ─── Hyperframes check ───────────────────────────────────────────────────────

function checkHyperframes(): HealthCheckFeatureResult {
  return { ok: true, enabled: FEATURE_FLAGS.ENABLE_HYPERFRAMES };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolvePythonCommand(): Promise<string> {
  const venvPython = path.join(
    process.cwd(),
    ".venv",
    process.platform === "win32" ? "Scripts" : "bin",
    process.platform === "win32" ? "python.exe" : "python",
  );

  try {
    await accessAsync(venvPython, fsConstants.X_OK);
    return venvPython;
  } catch {
    return process.platform === "win32" ? "py" : "python3";
  }
}

function runBinary(
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { shell: false, windowsHide: true });
    let output = "";

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Timeout después de ${timeoutMs}ms`));
    }, timeoutMs);

    function capture(chunk: Buffer | string) {
      output += chunk.toString();
    }

    child.stdout.on("data", capture);
    child.stderr.on("data", capture);

    child.once("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`No se pudo iniciar ${command}: ${err.message}`));
    });

    child.once("close", (code) => {
      clearTimeout(timeout);
      // FFmpeg prints to stderr on version; accept any output as success
      if (code === 0 || output.length > 0) {
        resolve(output.trim());
      } else {
        reject(
          new Error(
            `${command} terminó con código ${code ?? "desconocido"}`,
          ),
        );
      }
    });
  });
}
