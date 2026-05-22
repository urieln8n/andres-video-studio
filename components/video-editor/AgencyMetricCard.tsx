export function AgencyMetricCard({
  detail,
  label,
  tone = "neutral",
  value,
}: {
  detail?: string;
  label: string;
  tone?: "neutral" | "success" | "danger" | "gold";
  value: string | number;
}) {
  const tones = {
    neutral: "from-sky-200/16 text-sky-100",
    success: "from-emerald-200/18 text-emerald-100",
    danger: "from-rose-200/18 text-rose-100",
    gold: "from-[#efd8ad]/22 text-[#efd8ad]",
  };

  return (
    <article className="relative min-h-36 overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_28px_92px_-70px_rgba(0,0,0,1)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${tones[tone]} to-transparent`}
      />
      <p className="text-sm leading-6 text-zinc-400">{label}</p>
      <p className="mt-3 break-words text-3xl font-semibold text-white">
        {value}
      </p>
      {detail ? <p className="mt-3 text-sm text-zinc-300">{detail}</p> : null}
    </article>
  );
}
