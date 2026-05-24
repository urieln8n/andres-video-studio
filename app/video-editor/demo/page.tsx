import Link from "next/link";

import { AgencyUseCaseSection } from "@/components/video-editor/demo/AgencyUseCaseSection";
import { BarberiaOSDemoSection } from "@/components/video-editor/demo/BarberiaOSDemoSection";
import { DeliverablePackSection } from "@/components/video-editor/demo/DeliverablePackSection";
import { DemoFinalCTA } from "@/components/video-editor/demo/DemoFinalCTA";
import { DemoHero } from "@/components/video-editor/demo/DemoHero";
import { FeatureGrid } from "@/components/video-editor/demo/FeatureGrid";
import { PricingSuggestionSection } from "@/components/video-editor/demo/PricingSuggestionSection";
import { ProblemSection } from "@/components/video-editor/demo/ProblemSection";
import { SolutionFlow } from "@/components/video-editor/demo/SolutionFlow";

export default function DemoPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <DemoHero />
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d6b26e]">
              Nueva narrativa
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Agentes premium para producir, vender y entregar mejor.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Vídeo final con subtítulos y CTA",
              "Copy, captions y hashtags",
              "Pack listo para cliente o publicación",
              "BarberíaOS como caso vertical estrella",
            ].map((item) => (
              <div
                className="rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-4 text-sm font-semibold text-zinc-200"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#d6b26e] px-5 text-sm font-semibold text-zinc-950"
            href="/video-editor/agents"
          >
            Ver agentes premium
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.05] px-5 text-sm font-semibold text-white"
            href="/video-editor/barberiaos"
          >
            Ver BarberíaOS
          </Link>
        </div>
      </section>
      <ProblemSection />
      <SolutionFlow />
      <FeatureGrid />
      <BarberiaOSDemoSection />
      <AgencyUseCaseSection />
      <DeliverablePackSection />
      <PricingSuggestionSection />
      <DemoFinalCTA />
    </div>
  );
}
