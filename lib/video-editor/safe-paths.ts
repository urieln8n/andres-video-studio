import path from "node:path";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const videoEditorStorageRoot = path.resolve(process.cwd(), "storage");

export function validateJobId(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export function validateClientId(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

export function safeResolveInsideStorage(...segments: string[]) {
  return safeResolveInsideRoot(videoEditorStorageRoot, ...segments);
}

export function safeResolveInsideRoot(root: string, ...segments: string[]) {
  const absoluteRoot = path.resolve(root);
  const candidate = path.resolve(absoluteRoot, ...segments);

  return isPathInsideRoot(absoluteRoot, candidate) ? candidate : null;
}

export function isPathInsideRoot(root: string, candidate: string) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));

  return (
    relative.length > 0 &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  );
}
