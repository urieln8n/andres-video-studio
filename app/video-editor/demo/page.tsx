import { AgencyUseCaseSection } from "@/components/video-editor/demo/AgencyUseCaseSection";
import { BarberiaOSDemoSection } from "@/components/video-editor/demo/BarberiaOSDemoSection";
import { DeliverablePackSection } from "@/components/video-editor/demo/DeliverablePackSection";
import { DemoFinalCTA } from "@/components/video-editor/demo/DemoFinalCTA";
import { DemoHero } from "@/components/video-editor/demo/DemoHero";
import { FeatureGrid } from "@/components/video-editor/demo/FeatureGrid";
import { PricingSuggestionSection } from "@/components/video-editor/demo/PricingSuggestionSection";
import { ProblemSection } from "@/components/video-editor/demo/ProblemSection";
import { SolutionFlow } from "@/components/video-editor/demo/SolutionFlow";
import { TechnicalStatusSection } from "@/components/video-editor/demo/TechnicalStatusSection";

export default function DemoPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <DemoHero />
      <ProblemSection />
      <SolutionFlow />
      <FeatureGrid />
      <BarberiaOSDemoSection />
      <AgencyUseCaseSection />
      <DeliverablePackSection />
      <PricingSuggestionSection />
      <TechnicalStatusSection />
      <DemoFinalCTA />
    </div>
  );
}
