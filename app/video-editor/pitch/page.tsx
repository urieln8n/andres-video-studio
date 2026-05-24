import { PitchHero } from "@/components/video-editor/pitch/PitchHero";
import { BeforeAfterSection } from "@/components/video-editor/pitch/BeforeAfterSection";
import { LocalBusinessROISection } from "@/components/video-editor/pitch/LocalBusinessROISection";
import { BarberiaOSPitchSection } from "@/components/video-editor/pitch/BarberiaOSPitchSection";
import { DeliverablesSection } from "@/components/video-editor/pitch/DeliverablesSection";
import { ServicePackagesSection } from "@/components/video-editor/pitch/ServicePackagesSection";
import { WorkflowSection } from "@/components/video-editor/pitch/WorkflowSection";
import { AgencyPitchSection } from "@/components/video-editor/pitch/AgencyPitchSection";
import { PitchFAQ } from "@/components/video-editor/pitch/PitchFAQ";
import { BetaAccessSection } from "@/components/video-editor/pitch/BetaAccessSection";
import { PitchFinalCTA } from "@/components/video-editor/pitch/PitchFinalCTA";

export const metadata = {
  title: "Agentes Premium · Andrés Video Studio",
  description:
    "Presentación comercial de agentes premium para crear vídeo, copy y packs listos para publicar.",
};

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <PitchHero />
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            {
              title: "Agentes Premium",
              desc: "Cada flujo resuelve un resultado concreto: viral, BarberíaOS, copy, limpieza, marca local o entrega.",
            },
            {
              title: "Vídeo + copy + pack",
              desc: "La entrega no termina en el MP4: incluye captions, CTA, hashtags, WhatsApp y checklist.",
            },
            {
              title: "BarberíaOS como caso estrella",
              desc: "QR, huecos libres, reseñas y antes/después conectados a reservas reales.",
            },
          ].map((item) => (
            <article
              className="rounded-[8px] border border-white/10 bg-white/[0.055] p-5"
              key={item.title}
            >
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
      <BeforeAfterSection />
      <LocalBusinessROISection />
      <BarberiaOSPitchSection />
      <DeliverablesSection />
      <ServicePackagesSection />
      <WorkflowSection />
      <AgencyPitchSection />
      <PitchFAQ />
      <BetaAccessSection />
      <PitchFinalCTA />
    </main>
  );
}
