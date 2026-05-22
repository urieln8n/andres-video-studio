"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { EditorConfigPanel } from "@/components/video-editor/EditorConfigPanel";
import { defaultVideoEditorConfig } from "@/lib/video-editor/config";
import type { VideoEditorConfig } from "@/lib/video-editor/types";

const supportedFormats = ["mp4", "mov", "m4v", "webm"];
const maxFileSize = 250 * 1024 * 1024;
const acceptedFormats = supportedFormats.map((format) => `.${format}`).join(",");

export function UploadDropzone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<VideoEditorConfig>(
    defaultVideoEditorConfig,
  );

  function selectFile(nextFile: File | undefined) {
    if (!nextFile) {
      return;
    }

    const extension = nextFile.name.split(".").pop()?.toLowerCase();

    if (!extension || !supportedFormats.includes(extension)) {
      setFile(null);
      setError("Formato no permitido. Usa mp4, mov, m4v o webm.");
      return;
    }

    if (nextFile.size > maxFileSize) {
      setFile(null);
      setError("El tamaño máximo inicial es 250MB.");
      return;
    }

    if (nextFile.size <= 0) {
      setFile(null);
      setError("El archivo de vídeo está vacío.");
      return;
    }

    setFile(nextFile);
    setError(null);
  }

  async function uploadVideo() {
    if (!file || uploading) {
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", file);

    for (const [key, value] of Object.entries(config)) {
      formData.append(key, value === null ? "" : String(value));
    }

    try {
      const response = await fetch("/api/video-editor/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        error?: string;
        jobId?: string;
      };

      if (!response.ok || !payload.jobId) {
        throw new Error(payload.error || "No se pudo crear el job.");
      }

      router.push(
        `/video-editor/processing?jobId=${encodeURIComponent(payload.jobId)}`,
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el vídeo.",
      );
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[8px] border border-white/10 bg-white/[0.07] p-3 shadow-[0_40px_130px_-72px_rgba(0,0,0,1)] backdrop-blur-xl">
        <div
          className={`flex min-h-[24rem] flex-col items-center justify-center rounded-[8px] border border-dashed bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-5 py-10 text-center transition sm:px-10 ${
            dragging
              ? "border-[#efd8ad] bg-[#d6b26e]/10"
              : "border-[#dfc18a]/35"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files[0]);
          }}
        >
          <div className="mb-6 flex w-full max-w-xl items-center gap-4 text-left">
            <span className="grid size-11 shrink-0 place-items-center rounded-[8px] border border-[#efd8ad]/35 bg-[#d6b26e]/15 font-semibold text-[#efd8ad]">
              1
            </span>
            <div>
              <p className="text-xs font-medium uppercase text-[#d6b26e]">
                Subir vídeo
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-300">
                Sube el clip original para preparar el job local.
              </p>
            </div>
          </div>
        <input
          ref={fileInputRef}
          accept={acceptedFormats}
          className="sr-only"
          onChange={(event) => selectFile(event.target.files?.[0])}
          type="file"
        />
        <div className="grid size-20 place-items-center rounded-[8px] border border-white/10 bg-black/25 text-[#efd8ad] shadow-[0_28px_80px_-38px_rgba(214,178,110,0.9)]">
          <svg
            aria-hidden="true"
            className="size-9"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 17V5m0 0 4.5 4.5M12 5 7.5 9.5M5 19h14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>

        <button
          className="mt-7 max-w-xl text-2xl font-semibold text-white transition hover:text-[#efd8ad] sm:text-4xl"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Suelta tu vídeo aquí o haz click para elegir uno
        </button>
        <p className="mt-4 text-sm uppercase text-zinc-400">
          Formatos permitidos
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {supportedFormats.map((format) => (
            <span
              key={format}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-medium text-zinc-200"
            >
              {format}
            </span>
          ))}
        </div>

        <div className="mt-5 min-h-12 w-full max-w-xl">
          {file ? (
            <p className="break-words rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100">
              Archivo seleccionado: {file.name}
            </p>
          ) : null}
          {error ? (
            <p className="break-words rounded-[8px] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-medium text-rose-100">
              {error}
            </p>
          ) : null}
        </div>

        </div>
      </section>

      <EditorConfigPanel config={config} onChange={setConfig} />

      <section className="flex flex-col gap-4 rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_32px_120px_-72px_rgba(0,0,0,1)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-[8px] border border-[#efd8ad]/35 bg-[#d6b26e]/15 font-semibold text-[#efd8ad]">
            3
          </span>
          <div>
            <p className="text-xs font-medium uppercase text-[#d6b26e]">
              Procesar
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-300">
              El job guarda esta configuración antes de lanzar FFmpeg.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-7 text-base font-semibold text-zinc-950 shadow-[0_24px_90px_-36px_rgba(214,178,110,0.95)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-none disabled:bg-white/10 disabled:text-zinc-400 disabled:shadow-none sm:w-auto"
          disabled={!file || uploading}
          onClick={uploadVideo}
          type="button"
        >
          {uploading ? "Subiendo vídeo..." : "Editar vídeo en automático"}
        </button>
      </section>
    </div>
  );
}
