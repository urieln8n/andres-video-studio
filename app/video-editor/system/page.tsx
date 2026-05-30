import Link from "next/link";

import { runHealthCheck } from "@/lib/video-editor/health-check";
import type {
  HealthCheckBinaryResult,
  HealthCheckFeatureResult,
  HealthCheckStatus,
} from "@/lib/video-editor/health-check";
import { auditRetention } from "@/lib/video-editor/retention-policy";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const [health, retention] = await Promise.all([
    runHealthCheck(),
    auditRetention(),
  ]);

  const { checks, warnings, status, timestamp } = health;

  return (
    <main className="flex flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
    <div className="mx-auto w-full max-w-5xl space-y-7">
      <div className="flex flex-col gap-4 rounded-[8px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_36px_120px_-76px_rgba(0,0,0,1)] backdrop-blur-xl sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6b26e]">
            Herramienta interna
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Estado del sistema
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Última verificación:{" "}
            {new Date(timestamp).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "medium",
            })}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {warnings.length > 0 && (
        <div className="space-y-2 rounded-[8px] border border-[#efd8ad]/22 bg-[#d6b26e]/10 p-4">
          <p className="text-sm font-semibold text-[#efd8ad]">
            Avisos ({warnings.length})
          </p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-zinc-300">
                · {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-3 rounded-[8px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Dependencias</h2>
        <div className="divide-y divide-white/10 rounded-[8px] border border-white/10 bg-black/20">
          <BinaryCheckRow
            label="FFmpeg"
            required
            result={checks.ffmpeg}
            detail={checks.ffmpeg.version ?? checks.ffmpeg.detail}
          />
          <BinaryCheckRow
            label="Python"
            result={checks.python}
            detail={checks.python.version ?? checks.python.detail}
          />
          <BinaryCheckRow
            label="faster-whisper"
            result={checks.whisper}
            detail={checks.whisper.detail ?? (checks.whisper.available ? "Disponible" : undefined)}
          />
          <FeatureCheckRow label="Hyperframes" result={checks.hyperframes} />
        </div>
      </section>

      <section className="space-y-3 rounded-[8px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Almacenamiento</h2>
        <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            {Object.entries(checks.storage.folders).map(([folder, ok]) => (
              <div key={folder} className="flex items-center gap-2 text-sm">
                <span
                  className={
                    ok ? "text-green-500 font-bold" : "text-red-500 font-bold"
                  }
                >
                  {ok ? "✓" : "✗"}
                </span>
                <code className="text-xs text-zinc-300">{folder}/</code>
              </div>
            ))}
          </div>
          {!checks.storage.ok && (
            <p className="mt-3 text-xs text-red-300">
              Una o más carpetas requeridas no están disponibles. Crea las
              carpetas faltantes en <code>storage/</code> antes de procesar.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-[8px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
        <h2 className="text-base font-semibold text-white">Retención de archivos</h2>
        <div className="space-y-4 rounded-[8px] border border-white/10 bg-black/20 p-4">
          <div className="grid grid-cols-3 gap-4">
            <Stat
              label="Temp candidatos"
              value={String(retention.summary.tempFiles)}
            />
            <Stat
              label="Exports candidatos"
              value={String(retention.summary.exportDirs)}
            />
            <Stat
              label="Huérfanos"
              value={String(retention.summary.orphanFiles)}
            />
          </div>

          {retention.summary.totalCandidates > 0 ? (
            <p className="text-sm text-zinc-300">
              <span className="font-medium">
                {retention.summary.totalCandidates}
              </span>{" "}
              archivos o directorios listos para limpiar ·{" "}
              <span className="font-medium">
                {retention.summary.estimatedReclaimLabel}
              </span>{" "}
              recuperables
            </p>
          ) : (
            <p className="text-sm text-zinc-400">
              Sin candidatos. El almacenamiento está al día.
            </p>
          )}

          <p className="text-xs text-zinc-500">
            Umbral temp: {retention.summary.thresholds.tempMaxAgeDays} días ·
            Umbral exports: {retention.summary.thresholds.exportMaxAgeDays} días
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/video-editor/dashboard"
          className="inline-flex min-h-10 items-center rounded-[8px] border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-zinc-200 hover:border-[#efd8ad]/30 hover:text-[#efd8ad]"
        >
          ← Dashboard
        </Link>
        <Link
          href="/video-editor/demo"
          className="inline-flex min-h-10 items-center rounded-[8px] border border-white/10 bg-white/[0.055] px-4 text-sm font-semibold text-zinc-300 hover:border-[#efd8ad]/30 hover:text-[#efd8ad]"
        >
          Demo comercial →
        </Link>
        <Link
          href="/video-editor/pitch"
          className="inline-flex min-h-10 items-center rounded-[8px] border border-[#efd8ad]/20 bg-[#d6b26e]/8 px-4 text-sm font-semibold text-[#efd8ad] hover:bg-[#d6b26e]/15"
        >
          Pitch comercial →
        </Link>
        <a
          href="/api/video-editor/health"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center rounded-[8px] border border-white/10 bg-black/20 px-4 text-sm font-semibold text-zinc-400 hover:text-zinc-200"
        >
          JSON de salud →
        </a>
        <a
          href="/api/video-editor/storage/retention"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center rounded-[8px] border border-white/10 bg-black/20 px-4 text-sm font-semibold text-zinc-400 hover:text-zinc-200"
        >
          JSON de retención →
        </a>
      </div>
    </div>
    </main>
  );
}

function StatusBadge({ status }: { status: HealthCheckStatus }) {
  const healthy = status === "healthy";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
        healthy
          ? "border border-green-400/25 bg-green-400/10 text-green-200"
          : "border border-[#efd8ad]/25 bg-[#d6b26e]/10 text-[#efd8ad]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${healthy ? "bg-green-400" : "bg-[#d6b26e]"}`}
      />
      {healthy ? "Saludable" : "Degradado"}
    </span>
  );
}

function BinaryCheckRow({
  label,
  required = false,
  result,
  detail,
}: {
  label: string;
  required?: boolean;
  result: HealthCheckBinaryResult;
  detail?: string;
}) {
  const ok = result.available;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={`w-4 text-center text-sm font-bold ${ok ? "text-green-400" : required ? "text-red-300" : "text-zinc-500"}`}
      >
        {ok ? "✓" : "✗"}
      </span>
      <span className="flex-1 text-sm font-medium text-zinc-200">
        {label}
        {required && (
          <span className="ml-1 text-xs text-zinc-500">(requerido)</span>
        )}
      </span>
      {detail && <span className="text-xs text-zinc-500">{detail}</span>}
    </div>
  );
}

function FeatureCheckRow({
  label,
  result,
}: {
  label: string;
  result: HealthCheckFeatureResult;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={`w-4 text-center text-sm font-bold ${result.enabled ? "text-green-400" : "text-zinc-500"}`}
      >
        {result.enabled ? "✓" : "–"}
      </span>
      <span className="flex-1 text-sm font-medium text-zinc-200">{label}</span>
      <span className="text-xs text-zinc-500">
        {result.enabled ? "Activado" : "Desactivado"}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}
