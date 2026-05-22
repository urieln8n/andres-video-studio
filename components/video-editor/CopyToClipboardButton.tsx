"use client";

import { useState } from "react";

export function CopyToClipboardButton({
  label = "Copiar",
  text,
}: {
  label?: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#efd8ad]/28 bg-[#d6b26e]/14 px-3 text-sm font-semibold text-[#f3ddba] transition hover:bg-[#d6b26e]/24"
      onClick={copyText}
      title={label}
      type="button"
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
