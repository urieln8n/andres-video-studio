"use client";

export function HashtagEditor({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block rounded-[8px] border border-white/10 bg-black/20 p-4">
      <span className="text-sm font-semibold text-white">Hashtags</span>
      <span className="mt-1 block text-sm leading-6 text-zinc-400">
        Sepáralos por espacios. Se limpian duplicados al guardar.
      </span>
      <textarea
        className="mt-3 min-h-28 w-full resize-y rounded-[8px] border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-500 focus:border-[#efd8ad]/60"
        onChange={(event) => onChange(event.target.value)}
        placeholder="#video #negocio #contenido"
        value={value}
      />
    </label>
  );
}
