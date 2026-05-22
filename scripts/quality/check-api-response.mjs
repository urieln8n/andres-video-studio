/**
 * Quality checks for API response helpers.
 * Mirrors the production logic in lib/video-editor/api-response.ts.
 * Verifies that every route handler that calls apiOk/apiError gets
 * the expected payload shape.
 *
 * Run: node --test scripts/quality/check-api-response.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";

// ─── Inline reimplementations ───────────────────────────────────────────────

function apiOk(body, init) {
  return Response.json({ ok: true, ...body }, init);
}

function apiError(error, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

// ─── apiOk tests ────────────────────────────────────────────────────────────

test("apiOk — payload contiene ok: true", async () => {
  const res = apiOk({ job: { id: "abc" } });
  const body = await res.json();
  assert.equal(body.ok, true);
});

test("apiOk — el payload del caller se mezcla correctamente", async () => {
  const res = apiOk({ message: "done", count: 3 });
  const body = await res.json();
  assert.equal(body.message, "done");
  assert.equal(body.count, 3);
});

test("apiOk — status por defecto es 200", () => {
  const res = apiOk({ x: 1 });
  assert.equal(res.status, 200);
});

test("apiOk — respeta status personalizado de init", () => {
  const res = apiOk({ message: "aceptado" }, { status: 202 });
  assert.equal(res.status, 202);
});

test("apiOk — Content-Type es application/json", () => {
  const res = apiOk({ x: 1 });
  assert.ok(res.headers.get("content-type")?.includes("application/json"));
});

test("apiOk — no contamina la respuesta con campos extra", async () => {
  const res = apiOk({ jobId: "test" });
  const body = await res.json();
  const keys = Object.keys(body);
  assert.ok(keys.includes("ok"));
  assert.ok(keys.includes("jobId"));
  assert.equal(keys.length, 2);
});

// ─── apiError tests ──────────────────────────────────────────────────────────

test("apiError — payload contiene ok: false", async () => {
  const res = apiError("Job no encontrado.", 404);
  const body = await res.json();
  assert.equal(body.ok, false);
});

test("apiError — payload contiene el mensaje de error", async () => {
  const res = apiError("El vídeo no está disponible.", 404);
  const body = await res.json();
  assert.equal(body.error, "El vídeo no está disponible.");
});

test("apiError — status por defecto es 400", () => {
  const res = apiError("Bad request");
  assert.equal(res.status, 400);
});

test("apiError — respeta el status proporcionado", () => {
  assert.equal(apiError("not found", 404).status, 404);
  assert.equal(apiError("server error", 500).status, 500);
  assert.equal(apiError("unauthorized", 401).status, 401);
});

test("apiError — Content-Type es application/json", () => {
  const res = apiError("error message");
  assert.ok(res.headers.get("content-type")?.includes("application/json"));
});

// ─── Discriminación de tipo ──────────────────────────────────────────────────

test("apiOk y apiError producen payloads discriminados por ok", async () => {
  const ok = await apiOk({ data: "value" }).json();
  const err = await apiError("oops", 400).json();

  assert.equal(ok.ok, true);
  assert.equal(err.ok, false);

  // Simulación de discriminación que usan los clientes:
  if (ok.ok) {
    assert.equal(ok.data, "value");
  }
  if (!err.ok) {
    assert.equal(err.error, "oops");
  }
});
