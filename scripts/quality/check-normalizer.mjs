/**
 * Quality checks for legacy job normalization rules.
 * Mirrors the pure guard functions in lib/video-editor/legacy-job-normalizer.ts
 * without requiring TypeScript compilation.
 *
 * Run: node --test scripts/quality/check-normalizer.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";

// ─── Inline reimplementations ───────────────────────────────────────────────

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const JOB_STATUSES = [
  "uploaded", "processing", "awaiting_copy_review",
  "copy_approved", "rendering_final", "completed", "failed",
];

const PIPELINE_STEPS = [
  "uploaded", "starting", "preparing", "trim_silences",
  "extracting_audio", "transcribing", "detecting_fillers",
  "cleaning_fillers", "generating_subtitles", "reviewing_copy",
  "rendering_subtitles", "applying_hook_cta", "applying_motion",
  "exporting", "completed", "failed",
];

function isValidJobId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function readJobStatus(value) {
  return JOB_STATUSES.includes(value) ? value : "uploaded";
}

function readCurrentStep(value, status) {
  if (PIPELINE_STEPS.includes(value)) return value;
  return status === "completed" || status === "failed" ? status : "uploaded";
}

function clampProgress(value, status) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  return status === "completed" ? 100 : 0;
}

function readDate(value) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return null;
  }
  return value;
}

function readLogs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .slice(-500);
}

// ─── isValidJobId ────────────────────────────────────────────────────────────

test("isValidJobId — acepta UUID bien formado", () => {
  assert.equal(isValidJobId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isValidJobId("123e4567-e89b-12d3-a456-426614174000"), true);
});

test("isValidJobId — rechaza strings no-UUID", () => {
  assert.equal(isValidJobId(""), false);
  assert.equal(isValidJobId("not-a-uuid"), false);
  assert.equal(isValidJobId("../../etc/passwd"), false);
  assert.equal(isValidJobId("null"), false);
});

test("isValidJobId — rechaza tipos no-string", () => {
  assert.equal(isValidJobId(null), false);
  assert.equal(isValidJobId(undefined), false);
  assert.equal(isValidJobId(42), false);
});

// ─── readJobStatus ───────────────────────────────────────────────────────────

test("readJobStatus — todos los estados conocidos pasan sin modificación", () => {
  for (const s of JOB_STATUSES) {
    assert.equal(readJobStatus(s), s, `Estado '${s}' debería pasar`);
  }
});

test("readJobStatus — estado desconocido vuelve a 'uploaded'", () => {
  assert.equal(readJobStatus("hacked_status"), "uploaded");
  assert.equal(readJobStatus(""), "uploaded");
  assert.equal(readJobStatus(null), "uploaded");
  assert.equal(readJobStatus(undefined), "uploaded");
  assert.equal(readJobStatus(42), "uploaded");
});

// ─── readCurrentStep ─────────────────────────────────────────────────────────

test("readCurrentStep — pasos conocidos pasan sin modificación", () => {
  assert.equal(readCurrentStep("transcribing", "processing"), "transcribing");
  assert.equal(readCurrentStep("completed", "completed"), "completed");
  assert.equal(readCurrentStep("exporting", "processing"), "exporting");
});

test("readCurrentStep — paso desconocido en job completado → 'completed'", () => {
  assert.equal(readCurrentStep("unknown_step", "completed"), "completed");
  assert.equal(readCurrentStep(null, "completed"), "completed");
});

test("readCurrentStep — paso desconocido en job fallido → 'failed'", () => {
  assert.equal(readCurrentStep("unknown_step", "failed"), "failed");
});

test("readCurrentStep — paso desconocido en job activo → 'uploaded'", () => {
  assert.equal(readCurrentStep("unknown_step", "processing"), "uploaded");
  assert.equal(readCurrentStep(null, "uploaded"), "uploaded");
});

// ─── clampProgress ───────────────────────────────────────────────────────────

test("clampProgress — valores válidos se redondean al entero más próximo", () => {
  assert.equal(clampProgress(50, "processing"), 50);
  assert.equal(clampProgress(33.3, "processing"), 33);
  assert.equal(clampProgress(66.6, "processing"), 67);
});

test("clampProgress — no puede superar 100", () => {
  assert.equal(clampProgress(150, "processing"), 100);
  assert.equal(clampProgress(999, "completed"), 100);
});

test("clampProgress — no puede bajar de 0", () => {
  assert.equal(clampProgress(-10, "processing"), 0);
  assert.equal(clampProgress(-Infinity, "uploaded"), 0);
});

test("clampProgress — job completado sin valor → 100", () => {
  assert.equal(clampProgress(undefined, "completed"), 100);
  assert.equal(clampProgress(null, "completed"), 100);
  assert.equal(clampProgress("string", "completed"), 100);
});

test("clampProgress — job no completado sin valor → 0", () => {
  assert.equal(clampProgress(undefined, "uploaded"), 0);
  assert.equal(clampProgress(null, "processing"), 0);
});

// ─── readDate ────────────────────────────────────────────────────────────────

test("readDate — acepta ISO 8601 válido", () => {
  const now = new Date().toISOString();
  assert.equal(readDate(now), now);
  assert.equal(readDate("2024-01-15T10:30:00.000Z"), "2024-01-15T10:30:00.000Z");
});

test("readDate — rechaza valores no-string", () => {
  assert.equal(readDate(null), null);
  assert.equal(readDate(undefined), null);
  assert.equal(readDate(42), null);
  assert.equal(readDate({}), null);
});

test("readDate — rechaza strings que no son fechas válidas", () => {
  assert.equal(readDate("not-a-date"), null);
  assert.equal(readDate("../../etc"), null);
  assert.equal(readDate(""), null);
});

// ─── readLogs ────────────────────────────────────────────────────────────────

test("readLogs — acepta array de strings", () => {
  const result = readLogs(["log 1", "log 2", "log 3"]);
  assert.deepEqual(result, ["log 1", "log 2", "log 3"]);
});

test("readLogs — filtra valores no-string del array", () => {
  const result = readLogs(["valid log", 42, null, undefined, "otro log"]);
  assert.deepEqual(result, ["valid log", "otro log"]);
});

test("readLogs — devuelve array vacío para no-array", () => {
  assert.deepEqual(readLogs(null), []);
  assert.deepEqual(readLogs(undefined), []);
  assert.deepEqual(readLogs("string"), []);
  assert.deepEqual(readLogs({}), []);
});

test("readLogs — trunca a máximo 500 entradas (seguridad)", () => {
  const bigLogs = Array.from({ length: 600 }, (_, i) => `log ${i}`);
  const result = readLogs(bigLogs);
  assert.equal(result.length, 500);
  // Conserva las últimas 500 (más recientes)
  assert.equal(result[0], "log 100");
  assert.equal(result[499], "log 599");
});
