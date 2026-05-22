"use client";

export function HookOptionCard({
  label,
  onSelect,
  selected,
  text,
}: {
  label: string;
  onSelect: () => void;
  selected: boolean;
  text: string;
}) {
  return (
    <button
      className={`min-h-32 rounded-[8px] border p-4 text-left transition ${
        selected
          ? "border-[#efd8ad]/55 bg-[#d6b26e]/15 shadow-[0_18px_65px_-40px_rgba(214,178,110,0.9)]"
          : "border-white/10 bg-black/20 hover:border-[#efd8ad]/30 hover:bg-white/[0.07]"
      }`}
      onClick={onSelect}
      type="button"
    >
      <span className="block text-xs font-semibold uppercase text-[#d6b26e]">
        {label}
      </span>
      <span className="mt-3 block break-words text-sm leading-6 text-zinc-100">
        {text}
      </span>
    </button>
  );
}
