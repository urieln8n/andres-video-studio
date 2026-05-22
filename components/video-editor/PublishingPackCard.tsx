import { CopyToClipboardButton } from "@/components/video-editor/CopyToClipboardButton";
import { PublishingChecklist } from "@/components/video-editor/PublishingChecklist";
import type { VideoEditorPublishingPack } from "@/lib/video-editor/types";

export function PublishingPackCard({
  pack,
}: {
  pack: VideoEditorPublishingPack;
}) {
  const cards = [
    {
      title: "Instagram/Reels",
      text: pack.instagramCaption,
      recommendation:
        "Usa este caption para el reel principal y deja el CTA visible desde la primera lectura.",
    },
    {
      title: "TikTok",
      text: pack.tiktokCaption,
      recommendation:
        "Publica con un texto corto y confirma que los hashtags no tapen el CTA.",
    },
    {
      title: "YouTube Shorts",
      text: pack.youtubeShortsDescription,
      recommendation:
        "Pega esta descripción junto al Short y revisa que el título coincida con el gancho.",
    },
    {
      title: "WhatsApp",
      text: pack.whatsappText,
      recommendation:
        "Envíalo a clientes activos o listas permitidas con el vídeo ya descargado.",
    },
    {
      title: "Historia",
      text: pack.instagramStoryText,
      recommendation:
        "Acompáñalo con sticker de enlace, QR o ubicación cuando aplique.",
    },
  ];

  return (
    <section className="rounded-[8px] border border-[#efd8ad]/18 bg-[linear-gradient(135deg,rgba(214,178,110,0.12),rgba(255,255,255,0.055))] p-6 shadow-[0_30px_110px_-70px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#efd8ad]">
            Pack listo para publicar
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white">
            {pack.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-200">
            Ya tienes el vídeo y los textos preparados para cada canal.
          </p>
        </div>
        <div className="rounded-[8px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
          <span className="block text-xs uppercase text-zinc-500">Hashtags</span>
          <span className="mt-1 block break-words text-[#f2ddb9]">
            {pack.hashtags.join(" ")}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex min-h-[18rem] flex-col rounded-[8px] border border-white/10 bg-white/[0.065] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <CopyToClipboardButton text={card.text} />
            </div>
            <pre className="mt-4 flex-1 whitespace-pre-wrap break-words rounded-[8px] border border-white/[0.08] bg-black/25 p-4 font-sans text-sm leading-6 text-zinc-100">
              {card.text}
            </pre>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {card.recommendation}
            </p>
            <p className="mt-3 break-words text-xs leading-5 text-[#efd8ad]">
              {pack.hashtags.join(" ")}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4">
        <PublishingChecklist items={pack.postingChecklist} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TipList title="Recomendaciones" items={pack.platformTips} />
        {pack.barberiaosTips?.length ? (
          <TipList title="BarberíaOS QR y reservas" items={pack.barberiaosTips} />
        ) : null}
      </div>
    </section>
  );
}

function TipList({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="rounded-[8px] border border-white/10 bg-black/20 p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <ul className="mt-4 grid gap-2 text-sm leading-6 text-zinc-200">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-[8px] border border-white/[0.07] bg-white/[0.05] px-3 py-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
