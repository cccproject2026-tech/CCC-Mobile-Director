/** Short, one-line copy for Google Calendar UI, toasts, and banners. */

const MAX_LINE = 72;

export const GOOGLE_CALENDAR_COPY = {
  synced: 'Added to Google Calendar',
  syncIssues: 'Calendar sync issues',
  syncIssue: 'Calendar sync issue',
  linkMentor: 'Link Google Calendar',
  reconnectMentor: 'Reconnect Google Calendar',
  linkParticipant: 'Other person: link Google Calendar',
  reconnectParticipant: 'Other person: reconnect Google Calendar',
  busyHidden: 'Some times hidden (Google Calendar)',
  syncing: 'Syncing Google Calendar…',
  refreshFailed: 'Could not refresh Google Calendar',
  slotValidationFailed: 'Calendar unavailable — slots not verified',
  active: 'Calendar sync on',
  connectHint: 'Link Google to sync busy times',
  availabilityHint: 'Syncs busy times and calendar events',
  connected: 'Google Calendar connected',
  connecting: 'Connecting Google Calendar…',
  connectedOpening: 'Connected — opening schedule…',
  connectFailed: 'Could not connect Google Calendar',
  connectFailedReturning: 'Connection failed — returning…',
  returning: 'Returning to schedule…',
  signInRequired: 'Sign in required — returning…',
  signInUnavailable: 'Google sign-in unavailable',
  connectionCancelled: 'Connection cancelled',
  signInRequiredButton: 'Sign in required',
  linkingUnavailable: 'Calendar linking unavailable',
} as const;

/** Trim long API / backend strings to a single readable line. */
export function shortenGoogleCalendarMessage(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  const lower = t.toLowerCase();
  if (lower.includes('not linked') || lower.includes('not connected')) {
    return 'Calendar not linked';
  }
  if (lower.includes('reconnect')) return GOOGLE_CALENDAR_COPY.reconnectMentor;
  if (lower.includes('token') && lower.includes('expir')) return 'Calendar link expired';
  if (lower.includes('permission') || lower.includes('denied')) return 'Calendar access denied';
  if (lower.includes('double-book')) return 'Link calendar to avoid conflicts';
  if (lower.includes('google') && lower.includes('calendar') && lower.includes('event')) {
    return GOOGLE_CALENDAR_COPY.synced;
  }

  const sentence = (t.split(/[.!?]\s/)[0] ?? t).trim();
  if (sentence.length <= MAX_LINE) return sentence;
  return `${sentence.slice(0, MAX_LINE - 1)}…`;
}

/** One-line calendar note for schedule-meeting success toasts. */
export function getScheduleMeetingCalendarNote(options: {
  successHint?: string;
  warnings: string[];
}): string | undefined {
  const { successHint, warnings } = options;
  if (warnings.length > 0) {
    if (warnings.length > 1) return GOOGLE_CALENDAR_COPY.syncIssues;
    return shortenGoogleCalendarMessage(warnings[0]) || GOOGLE_CALENDAR_COPY.syncIssue;
  }
  if (successHint?.trim()) return GOOGLE_CALENDAR_COPY.synced;
  return undefined;
}
