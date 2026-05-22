import { PitchHero } from "@/components/video-editor/pitch/PitchHero";
import { BeforeAfterSection } from "@/components/video-editor/pitch/BeforeAfterSection";
import { LocalBusinessROISection } from "@/components/video-editor/pitch/LocalBusinessROISection";
import { BarberiaOSPitchSection } from "@/components/video-editor/pitch/BarberiaOSPitchSection";
import { DeliverablesSection } from "@/components/video-editor/pitch/DeliverablesSection";
import { ServicePackagesSection } from "@/components/video-editor/pitch/ServicePackagesSection";
import { WorkflowSection } from "@/components/video-editor/pitch/WorkflowSection";
import { AgencyPitchSection } from "@/components/video-editor/pitch/AgencyPitchSection";
import { PitchFAQ } from "@/components/video-editor/pitch/PitchFAQ";
import { PitchFinalCTA } from "@/components/video-editor/pitch/PitchFinalCTA";

export const metadata = {
  title: "Presentación comercial · Andrés Video Studio",
  description:
    "Modo presentación para clientes: ROI, flujo de trabajo, packs de entrega y paquetes de servicio.",
};

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <PitchHero />
      <BeforeAfterSection />
      <LocalBusinessROISection />
      <BarberiaOSPitchSection />
      <DeliverablesSection />
      <ServicePackagesSection />
      <WorkflowSection />
      <AgencyPitchSection />
      <PitchFAQ />
      <PitchFinalCTA />
    </main>
  );
}
