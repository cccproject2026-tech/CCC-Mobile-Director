/** Normalize monthly availability API payloads (matches ccc-web). */
export function unwrapMonthlyAvailabilityPayload(availRes: {
  data?: unknown;
}): unknown[] {
  const body = availRes?.data as Record<string, unknown> | undefined;
  if (!body) return [];
  const inner = body.data;
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === "object") {
    const o = inner as Record<string, unknown>;
    const keys = ["days", "slots", "availability", "calendar", "items", "dates"];
    for (const k of keys) {
      if (Array.isArray(o[k])) return o[k] as unknown[];
    }
  }
  for (const k of ["days", "slots", "availability", "calendar"]) {
    if (Array.isArray((body as Record<string, unknown>)[k])) {
      return (body as Record<string, unknown>)[k] as unknown[];
    }
  }
  return [];
}

export function slotDateToYmd(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  const head = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (head) return head[1];
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
