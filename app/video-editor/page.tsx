import { FeatureCard } from "@/components/video-editor/FeatureCard";
import { UploadDropzone } from "@/components/video-editor/UploadDropzone";
import { videoFeatures } from "@/lib/video-editor/mock-data";

export default function VideoEditorPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-medium uppercase text-[#d6b26e]">
            Edición automática con IA
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-none text-white sm:text-6xl lg:text-8xl">
            Edita tu vídeo en automático.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            Subtítulos, recortes, motion graphics y render final sin tocar nada.
          </p>
        </div>

        <UploadDropzone />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {videoFeatures.map((feature) => (
            <FeatureCard key={feature.number} feature={feature} />
          ))}
        </div>
      </section>
    </main>
  );
}
