"use client";

export function ToggleOption({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-24 cursor-pointer items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-black/20 p-4 transition hover:border-white/25">
      <span>
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-zinc-400">
          {description}
        </span>
      </span>
      <input
        checked={checked}
        className="sr-only"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={`flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition ${
          checked
            ? "border-[#efd8ad]/70 bg-[#d6b26e]/35"
            : "border-white/15 bg-white/10"
        }`}
      >
        <span
          className={`size-6 rounded-full shadow transition ${
            checked
              ? "translate-x-6 bg-[#efd8ad]"
              : "translate-x-0 bg-zinc-400"
          }`}
        />
      </span>
    </label>
  );
}
