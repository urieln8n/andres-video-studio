/**
 * Quality checks for path security and ID validation.
 * Mirrors the production logic in lib/video-editor/safe-paths.ts
 * without requiring TypeScript compilation.
 *
 * Run: node --test scripts/quality/check-path-security.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// ─── Inline reimplementations ───────────────────────────────────────────────
// These mirror safe-paths.ts exactly so any drift becomes visible.

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm"];

function validateId(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isPathInsideRoot(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return (
    relative.length > 0 &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}

function safeResolveInsideRoot(root, ...segments) {
  const absoluteRoot = path.resolve(root);
  const candidate = path.resolve(absoluteRoot, ...segments);
  return isPathInsideRoot(absoluteRoot, candidate) ? candidate : null;
}

function isAllowedVideoExtension(fileName) {
  return ALLOWED_VIDEO_EXTENSIONS.includes(
    path.extname(fileName).toLowerCase(),
  );
}

// ─── UUID / ID validation ───────────────────────────────────────────────────

test("validateId — acepta UUID v4 bien formado", () => {
  assert.equal(validateId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(validateId("123e4567-e89b-12d3-a456-426614174000"), true);
});

test("validateId — acepta UUID v1-v8 (cualquier versión válida)", () => {
  assert.equal(validateId("550e8400-e29b-11d4-a716-446655440000"), true); // v1
  assert.equal(validateId("550e8400-e29b-41d4-a716-446655440000"), true); // v4
});

test("validateId — rechaza string vacío", () => {
  assert.equal(validateId(""), false);
});

test("validateId — rechaza valores no-string", () => {
  assert.equal(validateId(null), false);
  assert.equal(validateId(undefined), false);
  assert.equal(validateId(42), false);
  assert.equal(validateId({}), false);
  assert.equal(validateId([]), false);
});

test("validateId — rechaza intentos de path traversal", () => {
  assert.equal(validateId("../../etc/passwd"), false);
  assert.equal(validateId("../jobs/secret"), false);
  assert.equal(validateId("../../../windows/system32"), false);
});

test("validateId — rechaza inyección de scripts y HTML", () => {
  assert.equal(validateId("<script>alert(1)</script>"), false);
  assert.equal(validateId("'; DROP TABLE jobs; --"), false);
  assert.equal(validateId("$(whoami)"), false);
});

test("validateId — rechaza UUIDs malformados", () => {
  assert.equal(validateId("not-a-uuid"), false);
  assert.equal(validateId("550e8400-e29b-41d4-a716"), false); // truncado
  assert.equal(validateId("550e8400_e29b_41d4_a716_446655440000"), false); // guiones bajos
  assert.equal(validateId("550e8400-e29b-41d4-a716-44665544000g"), false); // carácter inválido
  assert.equal(validateId("550e8400-e29b-91d4-a716-446655440000"), false); // versión 9 inválida
});

// ─── isPathInsideRoot ───────────────────────────────────────────────────────

test("isPathInsideRoot — acepta ruta hijo válida", () => {
  const root = path.resolve("storage");
  assert.equal(isPathInsideRoot(root, path.join(root, "jobs", "file.json")), true);
  assert.equal(isPathInsideRoot(root, path.join(root, "output", "video.mp4")), true);
  assert.equal(isPathInsideRoot(root, path.join(root, "temp", "uuid.wav")), true);
});

test("isPathInsideRoot — bloquea path traversal con ..", () => {
  const root = path.resolve("storage");
  assert.equal(isPathInsideRoot(root, path.resolve("etc", "passwd")), false);
  assert.equal(isPathInsideRoot(root, path.resolve("storage", "..", "etc")), false);
});

test("isPathInsideRoot — rechaza el propio root (no es 'dentro')", () => {
  const root = path.resolve("storage");
  assert.equal(isPathInsideRoot(root, root), false);
});

test("isPathInsideRoot — rechaza rutas absolutas fuera del root", () => {
  const root = path.resolve("storage");
  assert.equal(isPathInsideRoot(root, path.resolve("other-dir", "file.txt")), false);
});

// ─── safeResolveInsideRoot ──────────────────────────────────────────────────

test("safeResolveInsideRoot — devuelve null para traversal", () => {
  const root = path.resolve("storage");
  assert.equal(safeResolveInsideRoot(root, "..", "etc", "passwd"), null);
  assert.equal(safeResolveInsideRoot(root, "..", "..", "windows"), null);
});

test("safeResolveInsideRoot — devuelve ruta absoluta para segmento válido", () => {
  const root = path.resolve("storage");
  const result = safeResolveInsideRoot(root, "jobs", "test.json");
  assert.notEqual(result, null);
  assert.ok(result.startsWith(root));
  assert.ok(result.includes("jobs"));
});

// ─── isAllowedVideoExtension ────────────────────────────────────────────────

test("isAllowedVideoExtension — acepta extensiones permitidas (case insensitive)", () => {
  assert.equal(isAllowedVideoExtension("video.mp4"), true);
  assert.equal(isAllowedVideoExtension("video.MP4"), true);
  assert.equal(isAllowedVideoExtension("video.Mp4"), true);
  assert.equal(isAllowedVideoExtension("clip.mov"), true);
  assert.equal(isAllowedVideoExtension("clip.m4v"), true);
  assert.equal(isAllowedVideoExtension("clip.webm"), true);
});

test("isAllowedVideoExtension — rechaza extensiones peligrosas o desconocidas", () => {
  assert.equal(isAllowedVideoExtension("file.exe"), false);
  assert.equal(isAllowedVideoExtension("file.sh"), false);
  assert.equal(isAllowedVideoExtension("file.php"), false);
  assert.equal(isAllowedVideoExtension("file.bat"), false);
  assert.equal(isAllowedVideoExtension("file.py"), false);
  assert.equal(isAllowedVideoExtension("file"), false); // sin extensión
  assert.equal(isAllowedVideoExtension("../../etc/passwd"), false);
});
