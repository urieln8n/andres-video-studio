export function apiOk<T extends Record<string, unknown>>(
  body: T,
  init?: ResponseInit,
) {
  return Response.json({ ok: true, ...body }, init);
}

export function apiError(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}
