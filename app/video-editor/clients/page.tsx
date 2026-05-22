import Link from "next/link";

import { ClientCard } from "@/components/video-editor/ClientCard";
import { listClients } from "@/lib/video-editor/client-store";
import { listJobs } from "@/lib/video-editor/job-store";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const clients = await listClients();
  const jobs = await listJobs();
  const query = getValue((await searchParams).q)?.toLowerCase().trim() ?? "";
  const visibleClients = clients.filter((client) =>
    [client.name, client.businessName, client.sector, client.instagram, client.website]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[8px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_36px_120px_-76px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-[#efd8ad]">Agencia</p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-6xl">Clientes</h1>
              <p className="mt-4 text-base leading-7 text-zinc-300">
                Organiza vídeos, marcas y packs por cliente.
              </p>
            </div>
            <Link className="inline-flex min-h-14 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-6 font-semibold text-zinc-950" href="/video-editor/clients/new">
              Nuevo cliente
            </Link>
          </div>
          <form className="mt-6">
            <input
              className="min-h-14 w-full rounded-[8px] border border-white/12 bg-black/25 px-5 text-white placeholder:text-zinc-500"
              defaultValue={query}
              name="q"
              placeholder="Buscar por nombre, sector, Instagram o web"
            />
          </form>
        </header>
        {clients.length === 0 ? (
          <EmptyClients />
        ) : visibleClients.length ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {visibleClients.map((client) => (
              <ClientCard
                client={client}
                jobsCount={jobs.filter((job) => job.config?.clientId === client.id).length}
                key={client.id}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-[8px] border border-white/10 bg-white/[0.06] p-6 text-zinc-300">
            No hay clientes que coincidan con la búsqueda.
          </p>
        )}
      </section>
    </main>
  );
}

function EmptyClients() {
  return (
    <section className="rounded-[8px] border border-white/10 bg-white/[0.065] p-8 text-center backdrop-blur-xl">
      <h2 className="text-3xl font-semibold text-white">Todavía no hay clientes</h2>
      <p className="mt-3 text-zinc-300">Crea una marca para vincular vídeos y packs.</p>
    </section>
  );
}

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
