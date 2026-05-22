import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

import {
  ensureVideoEditorStorage,
  fileHasContent,
  getFinalTranscriptAbsolutePath,
  getFinalTranscriptRelativePath,
  getTranscriptAbsolutePath,
  getTranscriptRelativePath,
} from "@/lib/video-editor/job-store";
import type { VideoEditorTranscript } from "@/lib/video-editor/types";

const transcriptionModel = "small";
const transcriptionLanguage = "es";
const maxPythonOutputLength = 8_000;

export async function transcribeAudioWithWhisper(
  jobId: string,
  audioAbsolutePath: string,
  target: "analysis" | "final" = "analysis",
) {
  if (!(await fileHasContent(audioAbsolutePath))) {
    throw new Error("No existe el audio WAV que se va a transcribir.");
  }

  await ensureVideoEditorStorage();

  const transcriptAbsolutePath =
    target === "final"
      ? getFinalTranscriptAbsolutePath(jobId)
      : getTranscriptAbsolutePath(jobId);
  const { command, leadingArgs } = await getPythonCommand();

  await runPython(command, [
    ...leadingArgs,
    path.join(process.cwd(), "scripts", "transcribe.py"),
    "--audio",
    audioAbsolutePath,
    "--out",
    transcriptAbsolutePath,
    "--model",
    transcriptionModel,
    "--language",
    transcriptionLanguage,
  ]);

  if (!(await fileHasContent(transcriptAbsolutePath))) {
    throw new Error("Whisper terminó sin crear transcript.json.");
  }

  return {
    transcript: await readTranscript(transcriptAbsolutePath),
    transcriptAbsolutePath,
    transcriptRelativePath:
      target === "final"
        ? getFinalTranscriptRelativePath(jobId)
        : getTranscriptRelativePath(jobId),
  };
}

async function readTranscript(transcriptAbsolutePath: string) {
  const value = JSON.parse(
    await readFile(transcriptAbsolutePath, "utf8"),
  ) as Partial<VideoEditorTranscript>;
  const segments = value.segments
    ?.filter(
      (segment) =>
        typeof segment?.start === "number" &&
        typeof segment.end === "number" &&
        segment.end > segment.start &&
        typeof segment.text === "string" &&
        segment.text.trim().length > 0,
    )
    .map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
      words: segment.words?.filter(
        (word) =>
          typeof word?.start === "number" &&
          typeof word.end === "number" &&
          word.end > word.start &&
          typeof word.word === "string" &&
          word.word.trim().length > 0,
      ),
    }));

  if (
    !Array.isArray(segments) ||
    typeof value.text !== "string" ||
    !(typeof value.language === "string" || value.language === null)
  ) {
    throw new Error("El transcript JSON generado por Whisper no es válido.");
  }

  return {
    language: value.language,
    duration: typeof value.duration === "number" ? value.duration : undefined,
    text: value.text,
    segments,
  } satisfies VideoEditorTranscript;
}

async function getPythonCommand() {
  const venvPython = path.join(
    process.cwd(),
    ".venv",
    process.platform === "win32" ? "Scripts" : "bin",
    process.platform === "win32" ? "python.exe" : "python",
  );

  if (await pathExists(venvPython)) {
    return { command: venvPython, leadingArgs: [] };
  }

  if (process.platform === "win32") {
    return { command: "py", leadingArgs: [] };
  }

  return { command: "python3", leadingArgs: [] };
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function runPython(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      shell: false,
      windowsHide: true,
    });
    let stdio = "";

    function capture(chunk: Buffer | string) {
      stdio = `${stdio}${chunk.toString()}`.slice(-maxPythonOutputLength);
    }

    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    child.once("error", (error) => reject(formatPythonError(error, stdio)));
    child.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `La transcripción Python terminó con código ${code ?? "desconocido"}. ${stdio.trim()}`.trim(),
        ),
      );
    });
  });
}

function formatPythonError(error: Error, stdio: string) {
  return new Error(
    `No se pudo iniciar Python para faster-whisper. ${error.message} ${stdio.trim()}`.trim(),
  );
}
