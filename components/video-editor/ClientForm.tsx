"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  clientSectorLabels,
  clientSectors,
} from "@/lib/video-editor/client-utils";
import type { VideoEditorClient } from "@/lib/video-editor/client-types";

export function ClientForm({ client }: { client?: VideoEditorClient }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);

    try {
      const body = Object.fromEntries(formData);
      const response = await fetch(
        client
          ? `/api/video-editor/clients/${encodeURIComponent(client.id)}`
          : "/api/video-editor/clients",
        {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          method: client ? "PUT" : "POST",
        },
      );
      const payload = (await response.json()) as {
        client?: VideoEditorClient;
        error?: string;
      };

      if (!response.ok || !payload.client) {
        throw new Error(payload.error || "No se pudo guardar el cliente.");
      }

      router.push(`/video-editor/clients/${encodeURIComponent(payload.client.id)}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar el cliente.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      action={submit}
      className="grid gap-5 rounded-[8px] border border-white/10 bg-white/[0.065] p-6 shadow-[0_36px_120px_-76px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={client?.businessName} label="Nombre negocio" name="businessName" required />
        <Field defaultValue={client?.name} label="Nombre cliente" name="name" required />
        <label className="grid gap-2 text-sm text-zinc-200">
          <span className="font-semibold text-white">Sector</span>
          <select
            className="min-h-12 rounded-[8px] border border-white/15 bg-zinc-950 px-4"
            defaultValue={client?.sector ?? "negocio_local"}
            name="sector"
          >
            {clientSectors.map((sector) => (
              <option key={sector} value={sector}>
                {clientSectorLabels[sector]}
              </option>
            ))}
          </select>
        </label>
        <Field defaultValue={client?.contactName} label="Persona contacto" name="contactName" />
        <Field defaultValue={client?.email} label="Email" name="email" type="email" />
        <Field defaultValue={client?.phone} label="Teléfono" name="phone" />
        <Field defaultValue={client?.website} label="Web" name="website" placeholder="https://..." />
        <Field defaultValue={client?.instagram} label="Instagram" name="instagram" placeholder="@marca" />
        <Field defaultValue={client?.bookingUrl} label="Link de reserva" name="bookingUrl" placeholder="https://..." />
        <Field defaultValue={client?.brandColor ?? "#d6b26e"} label="Color de marca" name="brandColor" type="color" />
      </div>
      <label className="grid gap-2 text-sm text-zinc-200">
        <span className="font-semibold text-white">Notas</span>
        <textarea
          className="min-h-32 rounded-[8px] border border-white/15 bg-zinc-950 px-4 py-3 text-white"
          defaultValue={client?.notes}
          name="notes"
        />
      </label>
      <p className="text-sm text-zinc-400">
        Logo preparado para una fase posterior. En esta fase el branding usa color y datos de cliente.
      </p>
      {error ? (
        <p className="rounded-[8px] border border-rose-200/20 bg-rose-200/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      <button
        className="inline-flex min-h-14 w-full items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[linear-gradient(135deg,#efd8ad,#bb863e)] px-6 font-semibold text-zinc-950 disabled:opacity-50 sm:w-fit"
        disabled={busy}
        type="submit"
      >
        {busy ? "Guardando..." : client ? "Guardar cambios" : "Crear cliente"}
      </button>
    </form>
  );
}

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-200">
      <span className="font-semibold text-white">{label}</span>
      <input
        className="min-h-12 rounded-[8px] border border-white/15 bg-zinc-950 px-4 text-white"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}
