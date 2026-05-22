import Link from "next/link";

import { ClientForm } from "@/components/video-editor/ClientForm";
import { readClient } from "@/lib/video-editor/client-store";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await readClient(clientId);

  if (!client) {
    return <MissingClient />;
  }

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link className="text-sm font-semibold text-[#efd8ad]" href={`/video-editor/clients/${encodeURIComponent(client.id)}`}>
          Volver al cliente
        </Link>
        <header>
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">Editar cliente</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">{client.businessName}</h1>
        </header>
        <ClientForm client={client} />
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
