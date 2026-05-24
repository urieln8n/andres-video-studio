import Link from "next/link";

import { clientSectorLabels } from "@/lib/video-editor/client-utils";
import type { VideoEditorClient } from "@/lib/video-editor/client-types";

export function ClientDetailsPanel({ client }: { client: VideoEditorClient }) {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_36px_120px_-76px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">
            {clientSectorLabels[client.sector]}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            {client.businessName}
          </h1>
          <p className="mt-2 text-zinc-300">{client.contactName || client.name}</p>
        </div>
        <span
          className="block size-20 rounded-[8px] border border-white/15"
          style={{ backgroundColor: client.brandColor ?? "#d6b26e" }}
        />
      </div>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Web" value={client.website || "Sin web"} />
        <Detail label="Instagram" value={client.instagram || "Sin Instagram"} />
        <Detail label="Reservas" value={client.bookingUrl || "Sin link"} />
        <Detail label="Email" value={client.email || "Sin email"} />
        <Detail label="Teléfono" value={client.phone || "Sin teléfono"} />
        <Detail label="Notas" value={client.notes || "Sin notas"} />
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className={goldLink} href={`/video-editor/create?clientId=${encodeURIComponent(client.id)}`}>
          Crear vídeo para este cliente
        </Link>
        <Link className={softLink} href={`/video-editor/clients/${encodeURIComponent(client.id)}/edit`}>
          Editar cliente
        </Link>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-black/20 px-4 py-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-2 break-words text-zinc-100">{value}</dd>
    </div>
  );
}

const goldLink =
  "inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-5 font-semibold text-zinc-950";
const softLink =
  "inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-5 font-semibold text-white";
