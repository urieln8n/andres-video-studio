import { BarberiaOSHero } from "@/components/video-editor/BarberiaOSHero";
import { BarberiaOSPreviewMock } from "@/components/video-editor/BarberiaOSPreviewMock";
import { BarberiaOSUseCaseCard } from "@/components/video-editor/BarberiaOSUseCaseCard";
import type { VideoEditorCommercialPresetId } from "@/lib/video-editor/types";

const useCases = [
  {
    badge: "Agenda",
    cta: "Reserva tu cita desde el QR",
    description: "Genera un reel para llenar espacios vacíos de la agenda.",
    hook: "Tu barbería tiene huecos que pueden venderse hoy",
    presetId: "barberia_huecos_libres",
    subtitleStyle: "premium",
    title: "Huecos libres hoy",
  },
  {
    badge: "QR",
    cta: "Escanea el QR y reserva tu cita",
    description: "Explica a tus clientes cómo reservar sin escribir por WhatsApp.",
    hook: "Tus clientes pueden reservar en segundos",
    presetId: "barberia_qr_reservas",
    subtitleStyle: "premium",
    title: "Reserva por QR",
  },
  {
    badge: "Cortes",
    cta: "Reserva tu próximo corte",
    description: "Muestra transformaciones y cambios de look.",
    hook: "Mira este cambio de look",
    presetId: "barberia_antes_despues",
    subtitleStyle: "viral",
    title: "Antes y después",
  },
  {
    badge: "Promo",
    cta: "Reserva hoy tu cita",
    description: "Promociona combos, descuentos y campañas.",
    hook: "Corte + barba para renovar tu estilo",
    presetId: "barberia_combo_corte_barba",
    subtitleStyle: "viral",
    title: "Promoción corte + barba",
  },
  {
    badge: "Clientes",
    cta: "Vuelve y reserva tu cita",
    description: "Crea un vídeo para recuperar clientes que no han vuelto.",
    hook: "Hace tiempo que no pasas por la barbería",
    presetId: "barberia_reactivar_clientes",
    subtitleStyle: "premium",
    title: "Reactivar clientes",
  },
  {
    badge: "Reseñas",
    cta: "Déjanos tu reseña",
    description: "Convierte clientes satisfechos en reseñas.",
    hook: "Tu opinión ayuda a crecer esta barbería",
    presetId: "barberia_pedir_resenas",
    subtitleStyle: "premium",
    title: "Pedir reseñas",
  },
] satisfies Array<{
  badge: string;
  cta: string;
  description: string;
  hook: string;
  presetId: VideoEditorCommercialPresetId;
  subtitleStyle: "premium" | "viral";
  title: string;
}>;

export default function BarberiaOSContentStudioPage() {
  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-7">
        <BarberiaOSHero />
        <BarberiaOSPreviewMock />
        <section className="flex flex-col gap-5">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase text-[#d6b26e]">
              Plantillas listas
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Reels para vender reservas
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {useCases.map((useCase) => (
              <BarberiaOSUseCaseCard key={useCase.presetId} {...useCase} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
