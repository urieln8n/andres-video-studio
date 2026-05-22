"use client";

export type LibraryFilter = "all" | "completed" | "failed" | "pending";

const filters = [
  { id: "all", label: "Todos" },
  { id: "completed", label: "Completados" },
  { id: "failed", label: "Fallidos" },
  { id: "pending", label: "Pendientes" },
] as const;

export function LibraryFilters({
  filter,
  onFilterChange,
  onSearchChange,
  search,
}: {
  filter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter) => void;
  onSearchChange: (search: string) => void;
  search: string;
}) {
  return (
    <div className="grid gap-3 rounded-[8px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_28px_100px_-68px_rgba(0,0,0,1)] backdrop-blur-xl lg:grid-cols-[1fr_auto]">
      <label className="flex min-h-12 items-center rounded-[8px] border border-white/10 bg-black/25 px-4">
        <span className="sr-only">Buscar vídeos</span>
        <svg
          aria-hidden="true"
          className="mr-3 size-4 shrink-0 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
        <input
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por archivo, plantilla, hook o CTA"
          value={search}
        />
      </label>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        {filters.map((entry) => (
          <button
            key={entry.id}
            aria-pressed={entry.id === filter}
            className={`min-h-12 rounded-[8px] border px-4 text-sm font-semibold transition ${
              entry.id === filter
                ? "border-[#efd8ad]/50 bg-[#d6b26e]/18 text-[#efd8ad]"
                : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/25 hover:text-white"
            }`}
            onClick={() => onFilterChange(entry.id)}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  );
}
