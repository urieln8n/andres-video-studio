import type { LiveLog } from "@/lib/video-editor/mock-data";

export function LiveLogsPanel({ logs }: { logs: LiveLog[] }) {
  return (
    <section className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.065] shadow-[0_28px_100px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-400">
            Logs del job
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Log en vivo
          </h2>
        </div>
        <span className="flex items-center gap-2 text-sm text-zinc-300">
          <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
          activo
        </span>
      </div>

      <div className="min-h-[25rem] bg-black/25 p-5 font-mono text-sm leading-7 sm:p-6">
        {logs.map((log) => (
          <p
            key={log.message}
            className="flex gap-3 border-b border-white/[0.06] py-2"
          >
            <span className="shrink-0 text-zinc-500">{log.time}</span>
            <span
              className={`min-w-0 break-words ${
                log.active ? "text-[#efd8ad]" : "text-zinc-200"
              }`}
            >
              {log.message}
            </span>
          </p>
        ))}
      </div>
    </section>
  );
}
