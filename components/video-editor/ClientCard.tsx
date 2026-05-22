"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { clientSectorLabels } from "@/lib/video-editor/client-utils";
import type { VideoEditorClient } from "@/lib/video-editor/client-types";

export function ClientCard({
  client,
  jobsCount,
}: {
  client: VideoEditorClient;
  jobsCount: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("¿Borrar este cliente? Los vídeos asociados no se borrarán.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    const response = await fetch(
      `/api/video-editor/clients/${encodeURIComponent(client.id)}`,
      { method: "DELETE" },
    );
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error || "No se pudo borrar el cliente.");
      setDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <article className="flex min-h-[28rem] flex-col rounded-[8px] border border-white/10 bg-white/[0.065] p-5 shadow-[0_32px_110px_-74px_rgba(0,0,0,1)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">
            {clientSectorLabels[client.sector]}
          </p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-white">
            {client.businessName}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">{client.name}</p>
        </div>
        <span
          className="size-10 shrink-0 rounded-[8px] border border-white/15"
          style={{ backgroundColor: client.brandColor ?? "#d6b26e" }}
          title="Color de marca"
        />
      </div>
      <dl className="mt-5 grid gap-2 text-sm">
        <Info label="Instagram" value={client.instagram || "Sin Instagram"} />
        <Info label="Web" value={client.website || "Sin web"} />
        <Info label="Reservas" value={client.bookingUrl || "Sin link"} />
        <Info label="Vídeos" value={String(jobsCount)} />
      </dl>
      {error ? (
        <p className="mt-3 rounded-[8px] border border-rose-200/20 bg-rose-200/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <Link className={actionStyle} href={`/video-editor/clients/${encodeURIComponent(client.id)}`}>
          Ver cliente
        </Link>
        <Link className={actionStyle} href={`/video-editor?clientId=${encodeURIComponent(client.id)}`}>
          Nuevo vídeo
        </Link>
        <Link className={secondaryStyle} href={`/video-editor/clients/${encodeURIComponent(client.id)}/edit`}>
          Editar
        </Link>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-rose-200/15 bg-rose-200/[0.08] px-3 text-sm font-semibold text-rose-100 disabled:opacity-50"
          disabled={deleting}
          onClick={remove}
          type="button"
        >
          {deleting ? "Borrando..." : "Borrar"}
        </button>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/[0.07] bg-black/20 px-3 py-2">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-zinc-100">{value}</dd>
    </div>
  );
}

const actionStyle =
  "inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#efd8ad]/25 bg-[#d6b26e]/12 px-3 text-sm font-semibold text-[#efd8ad]";
const secondaryStyle =
  "inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.08] px-3 text-sm font-semibold text-white";
