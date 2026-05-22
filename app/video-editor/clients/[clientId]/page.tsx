import Link from "next/link";

import { ClientDetailsPanel } from "@/components/video-editor/ClientDetailsPanel";
import { VideoJobCard } from "@/components/video-editor/VideoJobCard";
import { clientSectorLabels } from "@/lib/video-editor/client-utils";
import { readClient } from "@/lib/video-editor/client-store";
import { resolveFinalVideoFile } from "@/lib/video-editor/file-response";
import { listJobs } from "@/lib/video-editor/job-store";
import type { VideoEditorLibraryJob } from "@/lib/video-editor/types";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await readClient(clientId);

  if (!client) {
    return <MissingClient />;
  }

  const jobs = (await listJobs()).filter((job) => job.config?.clientId === client.id);
  const libraryJobs = await Promise.all(
    jobs.map(async (job) => ({
      ...job,
      hasFinalVideo: Boolean(await resolveFinalVideoFile(job)),
    })),
  );

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Link className="text-sm font-semibold text-[#efd8ad]" href="/video-editor/clients">
          Volver a clientes
        </Link>
        <ClientDetailsPanel client={client} />
        <section className="rounded-[8px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">
            Recomendaciones por sector
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {clientSectorLabels[client.sector]}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {sectorTip(client.sector)}
          </p>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-white">Vídeos asociados</h2>
          {libraryJobs.length ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {libraryJobs.map((job) => (
                <VideoJobCard
                  deleting={false}
                  job={job satisfies VideoEditorLibraryJob}
                  key={job.id}
                  onDelete={() => undefined}
                  showDelete={false}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-[8px] border border-white/10 bg-white/[0.06] p-6 text-zinc-300">
              Este cliente todavía no tiene vídeos.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

function MissingClient() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-8">
      <p className="rounded-[8px] border border-white/10 bg-white/[0.06] p-6 text-zinc-200">
        Cliente no encontrado.
      </p>
    </main>
  );
}

function sectorTip(sector: string) {
  switch (sector) {
    case "barberia":
      return "Prioriza transformaciones, huecos libres y CTA de reserva con QR o link.";
    case "fotografia":
      return "Usa reels de portfolio, backstage y prueba social para cerrar sesiones.";
    case "restaurante":
      return "Combina plato estrella, ambiente y llamada clara a reservar o pedir.";
    case "clinica":
      return "Mantén tono informativo y revisa mensajes antes de publicar.";
    case "agencia":
      return "Entrega demos, casos y resultados en formatos reutilizables por plataforma.";
    default:
      return "Alinea hook, CTA, color de marca y enlace comercial del cliente.";
  }
}
