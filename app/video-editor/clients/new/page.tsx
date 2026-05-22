import Link from "next/link";

import { ClientForm } from "@/components/video-editor/ClientForm";

export default function NewClientPage() {
  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link className="text-sm font-semibold text-[#efd8ad]" href="/video-editor/clients">
          Volver a clientes
        </Link>
        <header>
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">Nuevo cliente</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Crear marca cliente</h1>
        </header>
        <ClientForm />
      </section>
    </main>
  );
}
