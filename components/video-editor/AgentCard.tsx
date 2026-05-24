import Link from "next/link";

export type AgentStatus = "activo" | "proximamente";

export type AgentCardData = {
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

  return (
    <article className="flex min-h-[26rem] flex-col justify-between rounded-[8px] border border-white/10 bg-[#11100f]/86 p-5 shadow-[0_28px_90px_-58px_rgba(0,0,0,0.95)] backdrop-blur-xl transition hover:border-[#efd8ad]/30 hover:bg-[#15120e] sm:p-6">
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d6b26e]">
              Agente premium
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {agent.name}
            </h2>
          </div>
          <span
            className={
              isActive
                ? "shrink-0 rounded-[8px] border border-[#efd8ad]/30 bg-[#d6b26e]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#efd8ad]"
                : "shrink-0 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400"
            }
          >
            {isActive ? "Activo" : "Próximamente"}
          </span>
        </div>

        <div className="space-y-5">
          <AgentField label="Problema" value={agent.problem} />
          <AgentField label="Resultado" value={agent.result} />
          <AgentField label="Para quién" value={agent.audience} />
        </div>
      </div>

      {isActive ? (
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
