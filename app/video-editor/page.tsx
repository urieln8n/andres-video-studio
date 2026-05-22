import { FeatureCard } from "@/components/video-editor/FeatureCard";
import { UploadDropzone } from "@/components/video-editor/UploadDropzone";
import {
  getCommercialPresetById,
  isValidCommercialPreset,
} from "@/lib/video-editor/commercial-presets";
import {
  defaultVideoEditorConfig,
  isValidPlatformPreset,
  isValidSubtitleStyle,
  normalizeVideoEditorConfig,
} from "@/lib/video-editor/config";
import { videoFeatures } from "@/lib/video-editor/mock-data";
import { getPlatformPresetById } from "@/lib/video-editor/platform-presets";
import { isValidTemplateId } from "@/lib/video-editor/templates";

type VideoEditorPageProps = {
  searchParams: Promise<{
    commercialPresetId?: string | string[];
    mode?: string | string[];
    platformPreset?: string | string[];
    subtitleStyle?: string | string[];
    templateId?: string | string[];
  }>;
};

export default async function VideoEditorPage({
  searchParams,
}: VideoEditorPageProps) {
  const initialConfig = getInitialConfig(await searchParams);
  const isBarberiaOS = initialConfig.mode === "barberiaos";

  return (
    <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-4xl">
          {isBarberiaOS ? (
            <span className="mb-4 inline-flex rounded-[8px] border border-[#efd8ad]/25 bg-[#d6b26e]/12 px-3 py-1 text-xs font-semibold uppercase text-[#efd8ad]">
              Modo BarberíaOS
            </span>
          ) : null}
          <p className="mb-4 text-sm font-medium uppercase text-[#d6b26e]">
            {isBarberiaOS ? "Content Studio para barberías" : "Edición automática con IA"}
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-8xl">
            {isBarberiaOS ? "Prepara tu reel para vender reservas." : "Edita tu vídeo en automático."}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            {isBarberiaOS
              ? "Sube un vídeo de tu corte, local o promoción y conserva todo el flujo de Andrés Video Studio."
              : "Subtítulos, recortes, motion graphics y render final sin tocar nada."}
          </p>
        </div>

        <UploadDropzone initialConfig={initialConfig} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {videoFeatures.map((feature) => (
            <FeatureCard key={feature.number} feature={feature} />
          ))}
        </div>
      </section>
    </main>
  );
}

function getInitialConfig(
  searchParams: Awaited<VideoEditorPageProps["searchParams"]>,
) {
  const mode = getSearchValue(searchParams.mode);
  const commercialPresetId = getSearchValue(searchParams.commercialPresetId);
  const platformPresetId = getSearchValue(searchParams.platformPreset);
  const templateId = getSearchValue(searchParams.templateId);
  const subtitleStyle = getSearchValue(searchParams.subtitleStyle);
  const commercialPreset = isValidCommercialPreset(commercialPresetId)
    ? getCommercialPresetById(commercialPresetId)
    : null;
  const barberiaDefaults = mode === "barberiaos";
  const platformPreset =
    isValidPlatformPreset(platformPresetId) && platformPresetId !== "custom"
      ? getPlatformPresetById(platformPresetId)
      : getPlatformPresetById("instagram_reels");

  return normalizeVideoEditorConfig({
    ...defaultVideoEditorConfig,
    ...(barberiaDefaults
      ? {
          mode: "barberiaos",
          platformPreset: "instagram_reels",
          templateId: "barberia",
          outputFormat: "vertical_9_16",
          motionEnabled: true,
        }
      : {}),
    ...(platformPresetId && platformPresetId !== "custom"
      ? {
          platformPreset: platformPreset.id,
          outputFormat: platformPreset.outputFormat,
          exportQuality: platformPreset.exportQuality,
          subtitleStyle: platformPreset.subtitleStyle,
        }
      : {}),
    ...(commercialPreset
      ? {
          commercialPreset: commercialPreset.id,
          templateId: commercialPreset.templateId,
          outputFormat: commercialPreset.outputFormat,
          exportQuality: commercialPreset.exportQuality,
          subtitleStyle: commercialPreset.subtitleStyle,
          motionEnabled: commercialPreset.motionEnabled,
          trimSilences: commercialPreset.trimSilences,
          removeFillers: commercialPreset.removeFillers,
        }
      : {}),
    ...(isValidTemplateId(templateId) ? { templateId } : {}),
    ...(isValidSubtitleStyle(subtitleStyle) ? { subtitleStyle } : {}),
  });
}

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
