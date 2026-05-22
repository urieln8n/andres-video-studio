import { clientSectorLabels } from "@/lib/video-editor/client-utils";
import type { VideoEditorClientSnapshot } from "@/lib/video-editor/client-types";

export function ClientBadge({
  client,
}: {
  client: VideoEditorClientSnapshot | null | undefined;
}) {
  if (!client) {
    return (
      <span className="rounded-[8px] border border-white/10 bg-white/[0.07] px-2 py-1 text-[10px] font-semibold uppercase text-zinc-300">
        Sin cliente
      </span>
    );
  }

  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-[8px] border border-[#efd8ad]/22 bg-[#d6b26e]/12 px-2 py-1 text-[10px] font-semibold uppercase text-[#efd8ad]">
      <span
        className="size-2 rounded-full border border-white/20"
        style={{ backgroundColor: client.brandColor ?? "#d6b26e" }}
      />
      <span className="truncate">{client.businessName}</span>
      <span className="text-[#f4e6cc]/65">
        {clientSectorLabels[client.sector]}
      </span>
    </span>
  );
}
