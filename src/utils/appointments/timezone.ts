export type TimezoneDisplay = {
  /** A short, user-facing label such as "IST" or "GMT+5:30". */
  badge: string;
  /** Full IANA zone if available (e.g., "Asia/Kolkata"). */
  timeZone?: string;
};

function safeResolvedTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function getDeviceTimezone(): TimezoneDisplay {
  const tz = safeResolvedTimeZone();
  return { badge: tz ? tz.split("/").pop() || tz : "Local", timeZone: tz };
}

export function formatDateLocal(iso: string, opts?: { timeZone?: string }): string {
  const d = new Date(iso);
  const timeZone = opts?.timeZone;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatTimeLocal(iso: string, opts?: { timeZone?: string; hour12?: boolean }): string {
  const d = new Date(iso);
  const timeZone = opts?.timeZone;
  const hour12 = opts?.hour12 ?? true;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12,
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatDateTimeLocal(
  iso: string,
  opts?: { timeZone?: string; hour12?: boolean },
): string {
  return `${formatDateLocal(iso, opts)} · ${formatTimeLocal(iso, opts)}`;
}

