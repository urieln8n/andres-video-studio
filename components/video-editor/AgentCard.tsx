import Link from "next/link";

export type AgentStatus = "activo" | "beta" | "proximamente";

export type AgentCardData = {
  accent: string;
  badge: string;
  name: string;
  problem: string;
  result: string;
  audience: string;
  cta: string;
  status: AgentStatus;
  href: string;
};

export function AgentCard({ agent }: Readonly<{ agent: AgentCardData }>) {
  const isActive = agent.status === "activo";
  const isBeta = agent.status === "beta";

  return (
    <article className="group flex min-h-[25rem] flex-col justify-between rounded-[8px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] p-5 shadow-[0_28px_90px_-58px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:border-[#efd8ad]/30 hover:bg-[#15120e] sm:p-6">
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[8px] border border-[#efd8ad]/25 bg-[#d6b26e]/10 text-lg">
              {agent.badge}
            </span>
            <span className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d6b26e]">
              {agent.accent}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {agent.name}
            </h2>
            </span>
          </div>
          <span
            className={
              isActive
                ? "shrink-0 rounded-[8px] border border-[#efd8ad]/30 bg-[#d6b26e]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#efd8ad]"
                : isBeta
                  ? "shrink-0 rounded-[8px] border border-sky-300/25 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-200"
                : "shrink-0 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400"
            }
          >
            {isActive ? "Activo" : isBeta ? "Beta" : "Próximamente"}
          </span>
        </div>

        <div className="space-y-5">
          <AgentField label="Problema" value={agent.problem} />
          <AgentField label="Resultado" value={agent.result} />
          <AgentField label="Para quién" value={agent.audience} />
        </div>
      </div>

      {isActive || isBeta ? (
        <Link
          href={agent.href}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-[#efd8ad]/35 bg-[#d6b26e] px-4 text-sm font-semibold text-[#14110c] transition hover:bg-[#efd8ad]"
        >
          {agent.cta}
        </Link>
      ) : (
        <span className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-zinc-400">
          {agent.cta}
        </span>
      )}
    </article>
  );
}

function AgentField({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}
