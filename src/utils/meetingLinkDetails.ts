import type {
  Appointment,
  AppointmentPlatform,
} from "@/types/appointment.types";

/** Prefer top-level link, then Zoom embed (API may populate only one). */
export function getAppointmentJoinUrl(
  appointment?: Appointment | null,
): string | null {
  if (!appointment) return null;
  const fromLink = appointment.meetingLink?.trim();
  const zoomMeeting: any = (appointment as any).zoomMeeting;
  const fromZoom =
    (typeof zoomMeeting?.joinUrl === "string" ? zoomMeeting.joinUrl : undefined)?.trim() ||
    (typeof zoomMeeting?.join_url === "string" ? zoomMeeting.join_url : undefined)?.trim() ||
    (typeof zoomMeeting?.joinURL === "string" ? zoomMeeting.joinURL : undefined)?.trim();

  // Some APIs may also return these fields at the top-level.
  const anyAppt: any = appointment as any;
  const fromTopLevel =
    (typeof anyAppt?.joinUrl === "string" ? anyAppt.joinUrl : undefined)?.trim() ||
    (typeof anyAppt?.join_url === "string" ? anyAppt.join_url : undefined)?.trim() ||
    (typeof anyAppt?.joinURL === "string" ? anyAppt.joinURL : undefined)?.trim();

  return fromLink || fromZoom || fromTopLevel || null;
}

export function appointmentPlatformLabel(
  platform: AppointmentPlatform,
): string {
  switch (platform) {
    case "zoom":
      return "Zoom";
    case "google_meet":
      return "Google Meet";
    case "teams":
      return "Microsoft Teams";
    case "phone":
      return "Phone";
    case "in_person":
      return "In person";
    default:
      return platform;
  }
}

/** Group digits for readability (e.g. Zoom meeting numbers). */
export function formatMeetingIdForDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 9 && digits.length <= 11) {
    if (digits.length === 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    if (digits.length === 11) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }
    if (digits.length === 9) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  }
  return raw;
}

function toUrl(raw: string): URL | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    return new URL(withProto);
  } catch {
    return null;
  }
}

export function parseZoomMeetingIdFromUrl(raw: string): string | undefined {
  const u = toUrl(raw);
  if (!u) return;
  const host = u.hostname.toLowerCase();
  if (!host.includes("zoom.us")) return;
  const fromJ = u.pathname.match(/\/j\/(\d{9,12})\b/i);
  if (fromJ) return fromJ[1];
  const fromJoin = u.pathname.match(/\/join\/(\d{9,12})\b/i);
  if (fromJoin) return fromJoin[1];
  return;
}

export function zoomUrlHasPasscodeQuery(raw: string): boolean {
  const u = toUrl(raw);
  if (!u) return false;
  return u.searchParams.has("pwd");
}

export function parseGoogleMeetCodeFromUrl(raw: string): string | undefined {
  const u = toUrl(raw);
  if (!u) return;
  const host = u.hostname.toLowerCase();
  if (!host.includes("meet.google")) return;
  const m = u.pathname.match(/\/([a-z]{3}-[a-z]{4}-[a-z]{3})\b/i);
  return m?.[1];
}

export function truncateMiddle(text: string, max = 48): string {
  if (text.length <= max) return text;
  const keep = max - 3;
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);
  return `${text.slice(0, head)}...${text.slice(-tail)}`;
}
