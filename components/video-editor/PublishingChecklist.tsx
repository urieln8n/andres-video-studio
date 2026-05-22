import { CopyToClipboardButton } from "@/components/video-editor/CopyToClipboardButton";

export function PublishingChecklist({ items }: { items: string[] }) {
  return (
    <article className="rounded-[8px] border border-white/10 bg-black/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[#d6b26e]">
            Checklist
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Publica sin saltarte pasos
          </h3>
        </div>
        <CopyToClipboardButton text={items.map((item) => `- ${item}`).join("\n")} />
      </div>
      <ol className="mt-5 grid gap-2 text-sm text-zinc-100 sm:grid-cols-2">
        {items.map((item, index) => (
          <li
            key={item}
            className="flex min-h-14 items-start gap-3 rounded-[8px] border border-white/[0.08] bg-white/[0.055] px-3 py-3 leading-6"
          >
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-[#efd8ad]/24 bg-[#d6b26e]/12 text-xs font-semibold text-[#efd8ad]">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
