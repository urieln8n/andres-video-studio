"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { VideoEditorExportPackage } from "@/lib/video-editor/types";

export function ExportPackageCard({
  created,
  jobId,
  outputAvailable,
  sizeLabel,
}: {
  created: boolean;
  jobId: string;
  outputAvailable: boolean;
  sizeLabel: string | null;
}) {
  const router = useRouter();
  const [generated, setGenerated] = useState(created);
  const [packageSize, setPackageSize] = useState(sizeLabel);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateZip() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/video-editor/jobs/${encodeURIComponent(jobId)}/export-package`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        error?: string;
        exportPackage?: VideoEditorExportPackage;
      };

      if (!response.ok || !payload.exportPackage) {
        throw new Error(payload.error || "No se pudo generar el ZIP.");
      }

      setGenerated(true);
      setPackageSize(payload.exportPackage.sizeLabel);
      router.refresh();
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "No se pudo generar el ZIP.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[8px] border border-[#efd8ad]/20 bg-[linear-gradient(135deg,rgba(214,178,110,0.13),rgba(255,255,255,0.055))] p-6 shadow-[0_28px_100px_-68px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
      <p className="text-xs font-semibold uppercase text-[#efd8ad]">
        Descargar paquete completo
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        Entrega el vídeo y los textos en un solo ZIP
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-200">
        Incluye MP4 final, captions, descripción de Shorts, WhatsApp,
        historia, hashtags, checklist y metadata segura del job.
      </p>

      <div className="mt-5 grid gap-3 text-sm text-zinc-200 sm:grid-cols-2">
        {[
          "video-final.mp4",
          "Captions para Instagram y TikTok",
          "Textos para YouTube, WhatsApp e historia",
          "Hashtags, checklist y metadata",
        ].map((item) => (
          <span
            key={item}
            className="rounded-[8px] border border-white/[0.08] bg-black/20 px-3 py-2"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="rounded-[8px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200">
          Estado: {generated ? "generado" : "no generado"}
          {generated && packageSize ? ` · ${packageSize}` : ""}
        </span>
        <button
          className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-5 text-sm font-semibold text-zinc-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!outputAvailable || busy}
          onClick={generateZip}
          type="button"
        >
          {busy ? "Generando..." : generated ? "Regenerar ZIP" : "Generar ZIP"}
        </button>
        {generated ? (
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-emerald-200/20 bg-emerald-200/10 px-5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-200/15"
            href={`/api/video-editor/jobs/${encodeURIComponent(jobId)}/export-package/download`}
          >
            Descargar ZIP
          </a>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-[8px] border border-rose-200/20 bg-rose-200/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
