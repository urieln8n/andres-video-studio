import type { VideoEditorClient } from "@/lib/video-editor/client-types";

export function ClientSelector({
  clients,
  onSelect,
  value,
}: {
  clients: VideoEditorClient[];
  onSelect: (client: VideoEditorClient | null) => void;
  value: string | null;
}) {
  return (
    <label className="rounded-[8px] border border-white/10 bg-black/20 p-4">
      <span className="block text-sm font-semibold text-white">
        Cliente / marca
      </span>
      <span className="mt-1 block text-sm leading-6 text-zinc-400">
        Asocia el job a un cliente o continúa sin cliente.
      </span>
      <select
        className="mt-3 min-h-12 w-full rounded-[8px] border border-white/15 bg-zinc-950 px-4 text-sm text-white"
        onChange={(event) =>
          onSelect(
            clients.find((client) => client.id === event.target.value) ?? null,
          )
        }
        value={value ?? ""}
      >
        <option value="">Sin cliente</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.businessName} · {client.sector}
          </option>
        ))}
      </select>
    </label>
  );
}
