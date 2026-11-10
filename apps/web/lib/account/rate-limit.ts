const hits = new Map<string, number[]>();

/** In-memory limiter (per instance), enough to slow down scripted abuse of the sign-in endpoints. */
export function limited(request: Request, bucket: string, limit = 20, windowMs = 10 * 60 * 1000): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 20_000) hits.clear();
  return recent.length > limit;
}
