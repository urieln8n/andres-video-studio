import Link from "next/link";

import { getBarberiaOSEditorHref } from "@/components/video-editor/BarberiaOSQrPanel";
import type {
  VideoEditorBarberiaOSConfig,
  VideoEditorCommercialPresetId,
} from "@/lib/video-editor/types";

export function BarberiaOSUseCaseCard({
  badge,
  barberiaos,
  cta,
  description,
  hook,
  presetId,
  subtitleStyle,
  title,
}: {
  badge: string;
  barberiaos: VideoEditorBarberiaOSConfig;
  cta: string;
  description: string;
  hook: string;
  presetId: VideoEditorCommercialPresetId;
  subtitleStyle: "premium" | "viral";
  title: string;
}) {
  const href = getBarberiaOSEditorHref(presetId, barberiaos, subtitleStyle);

  return (
    <article className="flex min-h-[24rem] flex-col rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_110px_-78px_rgba(0,0,0,1)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <span className="rounded-[8px] border border-[#efd8ad]/22 bg-[#d6b26e]/10 px-2.5 py-1 text-xs font-semibold uppercase text-[#efd8ad]">
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-300">{description}</p>
      <dl className="mt-5 grid gap-3 text-sm">
        <CopyLine label="Hook" value={hook} />
        <CopyLine label="CTA" value={cta} />
      </dl>
      <Link
        className="mt-auto inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#efd8ad]/30 bg-[#d6b26e]/14 px-4 pt-0 text-sm font-semibold text-[#efd8ad] transition hover:bg-[#d6b26e]/22"
        href={href}
      >
        Usar plantilla
      </Link>
    </article>
  );
}

function CopyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/[0.08] bg-black/22 px-3 py-3">
      <dt className="text-xs font-semibold uppercase text-zinc-500">{label}</dt>
      <dd className="mt-2 break-words leading-6 text-zinc-100">{value}</dd>
    </div>
  );
}
