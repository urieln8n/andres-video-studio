import type { VideoFeature } from "@/lib/video-editor/mock-data";

export function FeatureCard({ feature }: { feature: VideoFeature }) {
  return (
    <article className="group rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_26px_80px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:border-[#dfc18a]/30 hover:bg-white/[0.09]">
      <p className="text-sm font-medium text-[#d6b26e]">
        {feature.number}
      </p>
      <h2 className="mt-8 text-2xl font-semibold text-white">
        {feature.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        {feature.description}
      </p>
    </article>
  );
}
