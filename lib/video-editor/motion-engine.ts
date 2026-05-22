import { spawn } from "node:child_process";
import path from "node:path";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getMotionCtaOverlayAbsolutePath,
  getMotionCtaOverlayRelativePath,
  getMotionHookOverlayAbsolutePath,
  getMotionHookOverlayRelativePath,
} from "@/lib/video-editor/job-store";
import type {
  VideoEditorCommercialTemplate,
  VideoEditorJob,
} from "@/lib/video-editor/types";

export type MotionOverlayType = "hook" | "cta";
type MotionStatusReporter = (message: string) => Promise<void> | void;

const maxCommandOutputLength = 8_000;
const hyperFramesCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const hyperFramesPrefix = ["--no-install", "hyperframes"];

export async function prepareMotionOverlays(
  job: VideoEditorJob,
  template: VideoEditorCommercialTemplate,
  reportStatus?: MotionStatusReporter,
) {
  const warnings: string[] = [];

  await reportStatus?.("Comprobando HyperFrames");

  if (!(await isHyperFramesAvailable())) {
    warnings.push("HyperFrames no disponible, usando fallback FFmpeg");
    return toFallback(warnings);
  }

  try {
    await reportStatus?.("Renderizando hook premium");
    const hook = await createMotionOverlay(job, template, "hook");
    await reportStatus?.("Renderizando CTA premium");
    const cta = await createMotionOverlay(job, template, "cta");

    return {
      engine: "hyperframes" as const,
      hook,
      cta,
      warnings,
    };
  } catch (error) {
    warnings.push(
      error instanceof Error
        ? `HyperFrames falló, usando fallback FFmpeg. ${error.message}`
        : "HyperFrames falló, usando fallback FFmpeg.",
    );

    return toFallback(warnings);
  }
}

export async function createMotionOverlay(
  job: VideoEditorJob,
  template: VideoEditorCommercialTemplate,
  type: MotionOverlayType,
) {
  await ensureVideoEditorStorage();

  const artifact = getOverlayArtifact(job.id, type);
  const templateRoot = path.join(
    process.cwd(),
    "motion-templates",
    type === "hook" ? "premium-hook" : "premium-cta",
  );

  await runHyperFrames(
    [
      "render",
      "--format",
      "webm",
      "--quality",
      "draft",
      "--output",
      artifact.absolutePath,
      "--variables",
      JSON.stringify({
        text: type === "hook" ? template.hook : template.cta,
        accent: template.accentColor,
      }),
    ],
    templateRoot,
  );

  if (!(await fileHasContent(artifact.absolutePath))) {
    throw new Error(`HyperFrames no creó overlay ${type}.`);
  }

  return artifact;
}

async function isHyperFramesAvailable() {
  try {
    await runHyperFrames(["--help"], process.cwd());
    return true;
  } catch {
    return false;
  }
}

function runHyperFrames(args: string[], cwd: string) {
  return runCommand(hyperFramesCommand, [...hyperFramesPrefix, ...args], cwd);
}

function runCommand(command: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
    });
    let output = "";

    function capture(chunk: Buffer | string) {
      output = `${output}${chunk.toString()}`.slice(-maxCommandOutputLength);
    }

    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    child.once("error", (error) => reject(error));
    child.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} terminó con código ${code ?? "desconocido"}. ${output.trim()}`.trim(),
        ),
      );
    });
  });
}

function getOverlayArtifact(jobId: string, type: MotionOverlayType) {
  return type === "hook"
    ? {
        absolutePath: getMotionHookOverlayAbsolutePath(jobId),
        relativePath: getMotionHookOverlayRelativePath(jobId),
      }
    : {
        absolutePath: getMotionCtaOverlayAbsolutePath(jobId),
        relativePath: getMotionCtaOverlayRelativePath(jobId),
      };
}

function toFallback(warnings: string[]) {
  return {
    engine: "fallback" as const,
    hook: null,
    cta: null,
    warnings,
  };
}
