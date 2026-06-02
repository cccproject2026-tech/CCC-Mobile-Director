import { appointmentService } from '@/services/appointments.service';
import type { TimeSlot } from '@/types/appointment.types';
import type { CalendarBusyPeriod } from '@/types/googleCalendar.types';
import {
  buildGoogleConnectBanners,
  extractMergedGoogleBundle,
  mergeBusyIntervals,
} from '@/utils/availability/merged-availability';
import {
  GOOGLE_CALENDAR_COPY,
  shortenGoogleCalendarMessage,
} from '@/utils/google-calendar/display-messages';

const DEFAULT_DURATION_MIN = 60;

function msMinutes(m: number): number {
  return m * 60_000;
}

export function overlapsBusyInterval(
  aStartMs: number,
  aEndMs: number,
  busy: CalendarBusyPeriod[],
): boolean {
  for (const p of busy) {
    const b0 = Date.parse(String(p.start));
    const b1 = Date.parse(String(p.end));
    if (Number.isNaN(b0) || Number.isNaN(b1) || b1 <= b0) continue;
    if (aStartMs < b1 && aEndMs > b0) return true;
  }
  return false;
}

export function meetingSpanBlockedByBusy(
  meetingStartIso: string,
  durationMinutes: number,
  busy: CalendarBusyPeriod[],
): boolean {
  const ms0 = Date.parse(meetingStartIso);
  const ms1 = ms0 + msMinutes(durationMinutes);
  if (Number.isNaN(ms0) || ms1 <= ms0) return false;
  return overlapsBusyInterval(ms0, ms1, busy);
}

export type FilterTimeSlotsResult = {
  slots: TimeSlot[];
  skipped: boolean;
  error?: string;
  strippedCount: number;
  connectGoogleBanners: string[];
  usedMergedAvailabilityApi: boolean;
};

/**
 * Filter discrete TimeSlot rows against Google Free/Busy from GET `/availability/:mentorId`.
 */
export async function filterTimeSlotsAgainstGoogleCalendar(options: {
  meetingDateYmd: string;
  rawSlots: TimeSlot[];
  availabilityMentorUserId: string;
  availabilityParticipantUserId?: string;
  meetingDurationMinutes?: number;
  fetchMergedAvailability: (
    mentorUserId: string,
    params: { from: string; to: string; participantUserId?: string },
  ) => Promise<unknown>;
}): Promise<FilterTimeSlotsResult> {
  const ymd = options.meetingDateYmd.slice(0, 10);
  const dayStart = new Date(`${ymd}T00:00:00`);
  const dayEnd = new Date(`${ymd}T23:59:59.999`);
  const fromIso = dayStart.toISOString();
  const toIso = new Date(dayEnd.getTime() + msMinutes(240)).toISOString();
  const duration = options.meetingDurationMinutes ?? DEFAULT_DURATION_MIN;

  const mentorForMerge = options.availabilityMentorUserId?.trim();
  const participantForMerge = options.availabilityParticipantUserId?.trim();

  if (!mentorForMerge) {
    return {
      slots: options.rawSlots,
      skipped: true,
      strippedCount: 0,
      connectGoogleBanners: [],
      usedMergedAvailabilityApi: false,
    };
  }

  try {
    const res = await options.fetchMergedAvailability(mentorForMerge, {
      from: fromIso,
      to: toIso,
      ...(participantForMerge ? { participantUserId: participantForMerge } : {}),
    });

    const g = extractMergedGoogleBundle(res);
    const busy = mergeBusyIntervals(g.mentor.busyIntervals, g.participant.busyIntervals);
    const banners = buildGoogleConnectBanners(Boolean(participantForMerge), g.mentor, g.participant);

    const kept = options.rawSlots.filter((slot) => {
      const iso = appointmentService.createMeetingDate(ymd, slot);
      return !meetingSpanBlockedByBusy(iso, duration, busy);
    });

    return {
      slots: kept,
      skipped: false,
      strippedCount: Math.max(0, options.rawSlots.length - kept.length),
      connectGoogleBanners: banners,
      usedMergedAvailabilityApi: true,
    };
  } catch (e: unknown) {
    const statusCode =
      e && typeof e === 'object' && 'statusCode' in e
        ? (e as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 404) {
      return {
        slots: options.rawSlots,
        skipped: true,
        strippedCount: 0,
        connectGoogleBanners: [],
        usedMergedAvailabilityApi: false,
      };
    }
    const message =
      e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string'
        ? (e as { message: string }).message
        : GOOGLE_CALENDAR_COPY.refreshFailed;
    return {
      slots: options.rawSlots,
      skipped: false,
      error: message,
      strippedCount: 0,
      connectGoogleBanners: [],
      usedMergedAvailabilityApi: false,
    };
  }
}

function asPayloadRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

/** Parse POST `/appointments` envelope for Google Calendar sync outcome. */
export function extractGoogleCalendarCreateOutcome(resBody: unknown): {
  successHints: string[];
  warnings: string[];
  mentorGoogleCalendarEventId?: string | null;
  userGoogleCalendarEventId?: string | null;
} {
  const body = asPayloadRecord(resBody);
  const data = asPayloadRecord(body.data);

  const warningsRaw = data.googleCalendarSyncWarnings;
  const warnings = Array.isArray(warningsRaw)
    ? warningsRaw.filter((x): x is string => typeof x === 'string')
    : [];

  const mentorIdRaw = data.mentorGoogleCalendarEventId;
  const userIdRaw = data.userGoogleCalendarEventId;

  const successHints: string[] = [];
  const addIf = (id: unknown) => {
    if (typeof id === 'string' && id.trim()) {
      successHints.push(GOOGLE_CALENDAR_COPY.synced);
    }
  };
  addIf(mentorIdRaw);
  addIf(userIdRaw);

  if (!successHints.length && (data.googleCalendarHtmlLink ?? data.googleCalendarEventId)) {
    successHints.push(GOOGLE_CALENDAR_COPY.synced);
  }

  return {
    successHints,
    warnings,
    mentorGoogleCalendarEventId:
      typeof mentorIdRaw === 'string' ? mentorIdRaw : mentorIdRaw === null ? null : undefined,
    userGoogleCalendarEventId:
      typeof userIdRaw === 'string' ? userIdRaw : userIdRaw === null ? null : undefined,
  };
}

export function googleCalendarSuccessHintFromCreateResponse(resBody: unknown): string | undefined {
  const { successHints } = extractGoogleCalendarCreateOutcome(resBody);
  if (successHints.length) return GOOGLE_CALENDAR_COPY.synced;

  const body = asPayloadRecord(resBody);
  const data = asPayloadRecord(body.data);
  const msg =
    typeof data.message === 'string'
      ? data.message
      : typeof body.message === 'string'
        ? body.message
        : '';
  const m = msg.toLowerCase();
  if (m.includes('google') && m.includes('calendar')) {
    return shortenGoogleCalendarMessage(msg);
  }

  return undefined;
}
