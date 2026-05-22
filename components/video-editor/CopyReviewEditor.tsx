"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CopyVisualPreview } from "@/components/video-editor/CopyVisualPreview";
import { HashtagEditor } from "@/components/video-editor/HashtagEditor";
import { HookOptionCard } from "@/components/video-editor/HookOptionCard";
import { PreviewStageToggle } from "@/components/video-editor/PreviewStageToggle";
import {
  getCommercialPresetById,
  isValidCommercialPreset,
} from "@/lib/video-editor/commercial-presets";
import { normalizeVideoEditorConfig } from "@/lib/video-editor/config";
import { getPlatformPresetById } from "@/lib/video-editor/platform-presets";
import { getTemplateById } from "@/lib/video-editor/templates";
import type {
  VideoEditorCopyPack,
  VideoEditorCopyPreviewStage,
  VideoEditorFinalCopy,
  VideoEditorJob,
  VideoEditorOutputFormat,
  VideoEditorSafeZone,
} from "@/lib/video-editor/types";

type CopyResponse = {
  copyPack: VideoEditorCopyPack;
  error?: string;
  finalCopy: VideoEditorFinalCopy | null;
  job: VideoEditorJob | null;
  ok?: boolean;
};

export function CopyReviewEditor({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [copyPack, setCopyPack] = useState<VideoEditorCopyPack | null>(null);
  const [job, setJob] = useState<VideoEditorJob | null>(null);
  const [hook, setHook] = useState("");
  const [cta, setCta] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [source, setSource] = useState<VideoEditorFinalCopy["source"]>("generated");
  const [previewStage, setPreviewStage] =
    useState<VideoEditorCopyPreviewStage>("hook");
  const [busy, setBusy] = useState<"save" | "render" | "auto" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCopy() {
      try {
        const response = await fetch(
          `/api/video-editor/jobs/${encodeURIComponent(jobId)}/copy`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as CopyResponse;

        if (!response.ok || !payload.copyPack) {
          throw new Error(payload.error || "No se pudo cargar el copy.");
        }

        if (!active) {
          return;
        }

        const initial = payload.finalCopy;
        setCopyPack(payload.copyPack);
        setJob(payload.job);
        setHook(initial?.selectedHook || payload.copyPack.hooks[0] || "");
        setCta(initial?.selectedCta || payload.copyPack.ctas[0] || "");
        setTitle(initial?.title || payload.copyPack.title);
        setDescription(initial?.description || payload.copyPack.description);
        setHashtags((initial?.hashtags || payload.copyPack.hashtags).join(" "));
        setSource(initial?.source || "generated");
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar el copy.",
          );
        }
      }
    }

    loadCopy();

    return () => {
      active = false;
    };
  }, [jobId]);

  async function saveCopy(
    nextSource = source,
    values = { hook, cta, title, description, hashtags },
  ) {
    setError(null);

    const response = await fetch(
      `/api/video-editor/jobs/${encodeURIComponent(jobId)}/copy`,
      {
        body: JSON.stringify({
          selectedHook: values.hook,
          selectedCta: values.cta,
          title: values.title,
          description: values.description,
          hashtags: values.hashtags,
          source: nextSource,
        }),
        headers: { "content-type": "application/json" },
        method: "PUT",
      },
    );
    const payload = (await response.json()) as CopyResponse;

    if (!response.ok || !payload.finalCopy) {
      throw new Error(payload.error || "No se pudo guardar el copy.");
    }

    setJob(payload.job);
    setHook(payload.finalCopy.selectedHook);
    setCta(payload.finalCopy.selectedCta);
    setTitle(payload.finalCopy.title);
    setDescription(payload.finalCopy.description);
    setHashtags(payload.finalCopy.hashtags.join(" "));
    setSource(payload.finalCopy.source);
    return payload.finalCopy;
  }

  async function handleSave() {
    setBusy("save");

    try {
      await saveCopy(source);
      setMessage("Copy guardado y aprobado para render final.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el copy.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleRender() {
    setBusy("render");

    try {
      await saveCopy(source);
      const response = await fetch(
        `/api/video-editor/jobs/${encodeURIComponent(jobId)}/render`,
        { method: "POST" },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok && response.status !== 202) {
        throw new Error(payload.error || "No se pudo iniciar el render final.");
      }

      router.push(`/video-editor/processing?jobId=${encodeURIComponent(jobId)}`);
    } catch (renderError) {
      setError(
        renderError instanceof Error
          ? renderError.message
          : "No se pudo iniciar el render final.",
      );
      setBusy(null);
    }
  }

  async function useAutomaticCopy() {
    if (!copyPack) {
      return;
    }

    setBusy("auto");
    const automaticValues = {
      hook: copyPack.hooks[0] || "",
      cta: copyPack.ctas[0] || "",
      title: copyPack.title,
      description: copyPack.description,
      hashtags: copyPack.hashtags.join(" "),
    };

    setHook(automaticValues.hook);
    setCta(automaticValues.cta);
    setTitle(automaticValues.title);
    setDescription(automaticValues.description);
    setHashtags(automaticValues.hashtags);
    setSource("generated");

    try {
      await saveCopy("generated", automaticValues);
      setMessage("Copy automatico guardado.");
    } catch (autoError) {
      setError(
        autoError instanceof Error
          ? autoError.message
          : "No se pudo guardar el copy automatico.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (error && !copyPack) {
    return <Notice tone="error">{error}</Notice>;
  }

  if (!copyPack) {
    return <Notice tone="neutral">Cargando copy local...</Notice>;
  }

  const config = normalizeVideoEditorConfig(job?.config ?? {
    templateId: job?.templateId,
  });
  const platformPreset =
    config.platformPreset === "custom"
      ? null
      : getPlatformPresetById(config.platformPreset);
  const commercialPreset = isValidCommercialPreset(config.commercialPreset)
    ? getCommercialPresetById(config.commercialPreset)
    : null;
  const template = getTemplateById(config.templateId);

  return (
    <section className="flex flex-col gap-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="ok">{message}</Notice> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <div className="flex flex-col gap-6">
          <CopySection
            description="Selecciona una base y ajusta el texto que entrara al overlay inicial."
            title="Hooks generados"
          >
            <div className="grid gap-3 md:grid-cols-3">
              {copyPack.hooks.slice(0, 3).map((option, index) => (
                <HookOptionCard
                  key={`${option}-${index}`}
                  label={`Hook ${index + 1}`}
                  onSelect={() => {
                    setHook(option);
                    setSource("generated");
                  }}
                  selected={hook === option}
                  text={option}
                />
              ))}
            </div>
            <TextArea
              helper={`${hook.length}/90 recomendado`}
              label="Hook seleccionado"
              onChange={(value) => {
                setHook(value);
                setSource("edited");
              }}
              value={hook}
            />
          </CopySection>

          <CopySection
            description="El CTA aprobado se aplicara al cierre del video."
            title="CTAs generados"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {copyPack.ctas.map((option, index) => (
                <HookOptionCard
                  key={`${option}-${index}`}
                  label={`CTA ${index + 1}`}
                  onSelect={() => {
                    setCta(option);
                    setSource("generated");
                  }}
                  selected={cta === option}
                  text={option}
                />
              ))}
            </div>
            <TextArea
              helper={`${cta.length}/80 recomendado`}
              label="CTA seleccionado"
              onChange={(value) => {
                setCta(value);
                setSource("edited");
              }}
              value={cta}
            />
          </CopySection>

          <CopySection
            description="Estos textos se guardan con el job y quedan visibles en el resultado."
            title="Copy de publicacion"
          >
            <label className="block">
              <span className="text-sm font-semibold text-white">Titulo</span>
              <input
                className="mt-3 min-h-12 w-full rounded-[8px] border border-white/15 bg-zinc-950/90 px-4 text-sm text-white outline-none focus:border-[#efd8ad]/60"
                maxLength={100}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setSource("edited");
                }}
                value={title}
              />
            </label>
            <TextArea
              label="Descripcion"
              onChange={(value) => {
                setDescription(value);
                setSource("edited");
              }}
              rows={5}
              value={description}
            />
            <HashtagEditor
              onChange={(value) => {
                setHashtags(value);
                setSource("edited");
              }}
              value={hashtags}
            />
          </CopySection>
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
          <div className="flex flex-col gap-4 rounded-[8px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
            <PreviewStageToggle onChange={setPreviewStage} value={previewStage} />
            <CopyVisualPreview
              accentColor={template.accentColor}
              barberiaos={config.barberiaos}
              commercialPresetId={config.commercialPreset}
              hashtags={hashtags}
              mode={config.mode}
              outputFormat={config.outputFormat}
              platformBadge={platformPreset?.badge || "Custom"}
              platformPreset={config.platformPreset}
              presetBadge={commercialPreset?.badge || "Personalizado"}
              previewStage={previewStage}
              safeZone={platformPreset?.safeZone || getFallbackSafeZone(config.outputFormat)}
              selectedCta={cta}
              selectedHook={hook}
              subtitleStyle={config.subtitleStyle}
              templateId={config.templateId}
              title={title}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
            <CopySection
              description="Contexto disponible para decidir el copy final."
              title="Resumen del video"
            >
              <p className="rounded-[8px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-zinc-200">
                {copyPack.summary || "No hay summary disponible para este job."}
              </p>
              <dl className="grid gap-3 text-sm">
                <Summary label="Estado" value={job?.status || "pendiente"} />
                <Summary
                  label="Fuente"
                  value={source === "edited" ? "Copy editado manualmente" : "Copy automatico"}
                />
              </dl>
            </CopySection>

            <div className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_100px_-66px_rgba(0,0,0,1)] backdrop-blur-xl">
              <ActionButton busy={busy === "save"} onClick={handleSave}>
                Guardar copy
              </ActionButton>
              <ActionButton busy={busy === "render"} onClick={handleRender} primary>
                Renderizar video final
              </ActionButton>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.07] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                href={`/video-editor/processing?jobId=${encodeURIComponent(jobId)}`}
              >
                Volver a procesamiento
              </Link>
              <ActionButton busy={busy === "auto"} onClick={useAutomaticCopy}>
                Usar copy automatico
              </ActionButton>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CopySection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[8px] border border-white/10 bg-white/[0.065] p-5 shadow-[0_26px_90px_-64px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

function TextArea({
  helper,
  label,
  onChange,
  rows = 3,
  value,
}: {
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-white">
        {label}
        {helper ? (
          <span className="text-xs font-normal text-zinc-400">{helper}</span>
        ) : null}
      </span>
      <textarea
        className="mt-3 w-full resize-y rounded-[8px] border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#efd8ad]/60"
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function ActionButton({
  busy,
  children,
  onClick,
  primary,
}: {
  busy: boolean;
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-[8px] border px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
        primary
          ? "border-[#efd8ad]/35 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] text-zinc-950 hover:brightness-110"
          : "border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.12]"
      }`}
      disabled={busy}
      onClick={onClick}
      type="button"
    >
      {busy ? "Procesando..." : children}
    </button>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "error" | "neutral" | "ok";
}) {
  const style =
    tone === "error"
      ? "border-rose-200/20 bg-rose-200/10 text-rose-100"
      : tone === "ok"
        ? "border-emerald-200/20 bg-emerald-200/10 text-emerald-100"
        : "border-white/10 bg-white/[0.07] text-zinc-200";

  return <p className={`rounded-[8px] border px-5 py-4 ${style}`}>{children}</p>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-zinc-100">{value}</dd>
    </div>
  );
}

function getFallbackSafeZone(outputFormat: VideoEditorOutputFormat): VideoEditorSafeZone {
  if (outputFormat === "horizontal_16_9") {
    return { bottom: 80, left: 80, right: 80, top: 40 };
  }

  if (outputFormat === "square_1_1") {
    return { bottom: 120, left: 40, right: 40, top: 60 };
  }

  return { bottom: 280, left: 40, right: 40, top: 100 };
}
