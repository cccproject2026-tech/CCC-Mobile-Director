/**
 * Parses GET `/availability/:mentorUserId?from=&to=&participantUserId=` (merged CCC + Google).
 * Ported from ccc-web merged-availability.ts
 */
import type { CalendarBusyPeriod } from '@/types/googleCalendar.types';
import { GOOGLE_CALENDAR_COPY } from '@/utils/google-calendar/display-messages';

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === 'object' ? (x as Record<string, unknown>) : null;
}

export function unwrapAvailabilityPayload(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let i = 0; i < 6; i++) {
    const o = asRecord(cur);
    if (!o) return null;
    if ('data' in o && o.data != null && typeof o.data === 'object') {
      cur = o.data;
      continue;
    }
    return o;
  }
  return null;
}

function normalizeIntervals(raw: unknown): CalendarBusyPeriod[] {
  if (!Array.isArray(raw)) return [];
  const out: CalendarBusyPeriod[] = [];
  for (const x of raw) {
    const o = asRecord(x);
    if (!o) continue;
    const start =
      typeof o.start === 'string' ? o.start : typeof o.startTime === 'string' ? o.startTime : '';
    const end = typeof o.end === 'string' ? o.end : typeof o.endTime === 'string' ? o.endTime : '';
    if (start && end) out.push({ start, end });
  }
  return out;
}

export type ParsedGoogleSide = {
  googleCalendarLinked: boolean | null;
  googleCalendarStatus?: 'connected' | 'disconnected' | 'expired' | 'error';
  busyIntervals: CalendarBusyPeriod[];
};

function parseGoogleSide(node: unknown): ParsedGoogleSide {
  const o = asRecord(node);
  if (!o) return { googleCalendarLinked: null, busyIntervals: [] };
  const linkedRaw = o.googleCalendarLinked ?? o.calendarLinked ?? o.linked;
  const statusRaw = o.googleCalendarStatus;
  let googleCalendarLinked: boolean | null = null;
  if (typeof linkedRaw === 'boolean') googleCalendarLinked = linkedRaw;
  const googleCalendarStatus =
    statusRaw === 'connected' ||
    statusRaw === 'disconnected' ||
    statusRaw === 'expired' ||
    statusRaw === 'error'
      ? statusRaw
      : undefined;

  const busyRaw = o.busyIntervals ?? o.busy ?? o.busyPeriods ?? o.blocks;
  return {
    googleCalendarLinked,
    googleCalendarStatus,
    busyIntervals: normalizeIntervals(busyRaw),
  };
}

export type ParsedMergedGoogleBundle = {
  mentor: ParsedGoogleSide;
  participant: ParsedGoogleSide;
};

export function extractMergedGoogleBundle(payload: unknown): ParsedMergedGoogleBundle {
  const root = unwrapAvailabilityPayload(payload);
  if (!root) {
    return {
      mentor: { googleCalendarLinked: null, busyIntervals: [] },
      participant: { googleCalendarLinked: null, busyIntervals: [] },
    };
  }

  const g = asRecord(root.google);
  if (!g) {
    return {
      mentor: { googleCalendarLinked: null, busyIntervals: [] },
      participant: { googleCalendarLinked: null, busyIntervals: [] },
    };
  }

  const mentor = parseGoogleSide(asRecord(g.mentor));
  const participant = parseGoogleSide(
    asRecord(g.participant) ?? asRecord(g.participantGoogle) ?? asRecord(g.user),
  );

  return { mentor, participant };
}

export function mergeBusyIntervals(
  a: CalendarBusyPeriod[],
  b: CalendarBusyPeriod[],
): CalendarBusyPeriod[] {
  const key = (p: CalendarBusyPeriod) => `${p.start}|${p.end}`;
  const seen = new Set<string>();
  const out: CalendarBusyPeriod[] = [];
  for (const p of [...a, ...b]) {
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

export function buildGoogleConnectBanners(
  participantMergedInRequest: boolean,
  mentor: ParsedGoogleSide,
  participant: ParsedGoogleSide,
): string[] {
  const banners: string[] = [];
  if (mentor.googleCalendarStatus === 'expired' || mentor.googleCalendarStatus === 'error') {
    banners.push(GOOGLE_CALENDAR_COPY.reconnectMentor);
  } else if (mentor.googleCalendarLinked === false) {
    banners.push(GOOGLE_CALENDAR_COPY.linkMentor);
  }
  if (
    participantMergedInRequest &&
    (participant.googleCalendarStatus === 'expired' || participant.googleCalendarStatus === 'error')
  ) {
    banners.push(GOOGLE_CALENDAR_COPY.reconnectParticipant);
  } else if (participantMergedInRequest && participant.googleCalendarLinked === false) {
    banners.push(GOOGLE_CALENDAR_COPY.linkParticipant);
  }
  return banners;
}
