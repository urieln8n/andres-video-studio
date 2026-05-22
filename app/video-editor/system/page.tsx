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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Estado del sistema
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
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
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-yellow-800">
            Avisos ({warnings.length})
          </p>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-yellow-700">
                · {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Dependencias</h2>
        <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
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

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Almacenamiento</h2>
        <div className="rounded-lg border border-zinc-200 p-4">
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
                <code className="text-xs text-zinc-600">{folder}/</code>
              </div>
            ))}
          </div>
          {!checks.storage.ok && (
            <p className="mt-3 text-xs text-red-600">
              Una o más carpetas requeridas no están disponibles. Crea las
              carpetas faltantes en <code>storage/</code> antes de procesar.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Retención de archivos</h2>
        <div className="rounded-lg border border-zinc-200 p-4 space-y-4">
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
            <p className="text-sm text-zinc-700">
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
            <p className="text-sm text-zinc-500">
              Sin candidatos. El almacenamiento está al día.
            </p>
          )}

          <p className="text-xs text-zinc-400">
            Umbral temp: {retention.summary.thresholds.tempMaxAgeDays} días ·
            Umbral exports: {retention.summary.thresholds.exportMaxAgeDays} días
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/video-editor/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Dashboard
        </Link>
        <a
          href="/api/video-editor/health"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-zinc-500 hover:underline"
        >
          JSON de salud →
        </a>
        <a
          href="/api/video-editor/storage/retention"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-zinc-500 hover:underline"
        >
          JSON de retención →
        </a>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: HealthCheckStatus }) {
  const healthy = status === "healthy";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
        healthy
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${healthy ? "bg-green-500" : "bg-yellow-500"}`}
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
        className={`w-4 text-center font-bold text-sm ${ok ? "text-green-600" : required ? "text-red-500" : "text-zinc-400"}`}
      >
        {ok ? "✓" : "✗"}
      </span>
      <span className="flex-1 text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-xs text-zinc-400">(requerido)</span>
        )}
      </span>
      {detail && <span className="text-xs text-zinc-400">{detail}</span>}
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
        className={`w-4 text-center font-bold text-sm ${result.enabled ? "text-green-600" : "text-zinc-400"}`}
      >
        {result.enabled ? "✓" : "–"}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className="text-xs text-zinc-400">
        {result.enabled ? "Activado" : "Desactivado"}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
