export type TimezoneDisplay = {
  /** A short, user-facing label such as "IST" or "GMT+5:30". */
  badge: string;
  /** Full IANA zone if available (e.g., "Asia/Kolkata"). */
  timeZone?: string;
};

/** All appointment availability and meeting times are shown in Kolkata (IST). */
export const APP_TIMEZONE = "Asia/Kolkata";
export const APP_TIMEZONE_BADGE = "IST";

export function getAppTimezone(): TimezoneDisplay {
  return { badge: APP_TIMEZONE_BADGE, timeZone: APP_TIMEZONE };
}

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
  const timeZone = opts?.timeZone ?? APP_TIMEZONE;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  });
}

export function formatTimeLocal(iso: string, opts?: { timeZone?: string; hour12?: boolean }): string {
  const d = new Date(iso);
  const timeZone = opts?.timeZone ?? APP_TIMEZONE;
  const hour12 = opts?.hour12 ?? true;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12,
    timeZone,
  });
}

export function formatAppointmentTime(
  iso: string,
  opts?: { hour12?: boolean },
): string {
  return formatTimeLocal(iso, { timeZone: APP_TIMEZONE, hour12: opts?.hour12 ?? true });
}

export function formatAppointmentDate(iso: string): string {
  return formatDateLocal(iso, { timeZone: APP_TIMEZONE });
}

export type AvailabilitySlotParts = {
  startTime: string;
  startPeriod: string;
  endTime: string;
  endPeriod: string;
};

/** Plain API slot strings are stored as Kolkata (IST) wall-clock times. */
export function formatAvailabilitySlotLabel(slot: AvailabilitySlotParts): string {
  return `${slot.startTime} ${slot.startPeriod} - ${slot.endTime} ${slot.endPeriod} ${APP_TIMEZONE_BADGE}`;
}

export function formatAvailabilityTimeLabel(time: string, period: string): string {
  return `${time} ${period} ${APP_TIMEZONE_BADGE}`;
}

export function formatDateTimeLocal(
  iso: string,
  opts?: { timeZone?: string; hour12?: boolean },
): string {
  return `${formatDateLocal(iso, opts)} · ${formatTimeLocal(iso, opts)}`;
}

