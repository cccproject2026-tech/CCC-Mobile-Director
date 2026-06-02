import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { getGoogleCalendarOAuthRedirectUrl } from '@/constants/googleCalendar';
import type { GoogleCalendarConnectionStatus } from '@/types/googleCalendar.types';

type GoogleAuthUrlResponse = {
  url?: string;
  data?: { url?: string };
  success?: boolean;
};

function pickOAuthUrl(record: Record<string, unknown>): string | null {
  const keys = ['url', 'oauthUrl', 'authUrl', 'authorizationUrl', 'redirectUrl', 'link'] as const;
  for (const k of keys) {
    const v = record[k];
    if (typeof v === 'string' && /^https?:\/\//i.test(v.trim())) return v.trim();
  }
  return null;
}

/** Extract Google OAuth authorize URL from common CCC backend envelopes. */
export function unwrapGoogleOAuthRedirectUrl(payload: unknown): string | null {
  const root = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  if (!root) return null;
  const top = pickOAuthUrl(root);
  if (top) return top;
  const data = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null;
  if (data) {
    const inner = pickOAuthUrl(data);
    if (inner) return inner;
  }
  return null;
}

/** GET `/auth/google` — returns OAuth URL (Bearer JWT required). */
export async function getGoogleCalendarAuthUrl(): Promise<string | null> {
  const redirectTo = getGoogleCalendarOAuthRedirectUrl();
  const response = await apiClient.get<GoogleAuthUrlResponse>(ENDPOINTS.AUTH.GOOGLE, {
    params: {
      platform: 'mobile',
      redirectTo,
    },
  });
  return unwrapGoogleOAuthRedirectUrl(response.data);
}

/** GET `/google-calendar/status` — connection health + sync metadata. */
export async function getGoogleCalendarStatus(): Promise<GoogleCalendarConnectionStatus> {
  const response = await apiClient.get<GoogleCalendarConnectionStatus>(
    ENDPOINTS.GOOGLE_CALENDAR.STATUS,
  );
  return response.data;
}

export type ParsedGoogleCalendarOAuthParams = {
  outcome: 'linked' | 'error' | 'unknown';
  reason?: string;
};

/** Parse `googleCalendar` / `reason` from OAuth return URL (deep link or web redirect). */
export function parseGoogleCalendarOAuthReturnUrl(url: string): ParsedGoogleCalendarOAuthParams {
  try {
    const parsed = new URL(url);
    return parseGoogleCalendarQueryParams(parsed.searchParams);
  } catch {
    const qIndex = url.indexOf('?');
    if (qIndex < 0) return { outcome: 'unknown' };
    const query = url.slice(qIndex + 1);
    return parseGoogleCalendarQueryParams(new URLSearchParams(query));
  }
}

function parseGoogleCalendarQueryParams(
  searchParams: URLSearchParams,
): ParsedGoogleCalendarOAuthParams {
  const linked = searchParams.get('googleCalendar');
  if (!linked) return { outcome: 'unknown' };

  const reasonRaw = searchParams.get('reason');
  const reason =
    reasonRaw && reasonRaw.trim()
      ? (() => {
          try {
            return decodeURIComponent(reasonRaw.replace(/\+/g, ' '));
          } catch {
            return reasonRaw;
          }
        })()
      : undefined;

  if (linked === 'linked' || linked === '1') {
    return { outcome: 'linked' };
  }
  if (linked === 'error') {
    return { outcome: 'error', reason };
  }
  return { outcome: 'unknown' };
}

export function parseOAuthParamsFromUrl(url: string): {
  googleCalendar?: string;
  reason?: string;
} {
  try {
    const qIndex = url.indexOf('?');
    const query = qIndex >= 0 ? url.slice(qIndex + 1) : '';
    const sp = new URLSearchParams(query);
    const googleCalendar = sp.get('googleCalendar') ?? undefined;
    const reasonRaw = sp.get('reason');
    const reason =
      reasonRaw && reasonRaw.trim()
        ? (() => {
            try {
              return decodeURIComponent(reasonRaw.replace(/\+/g, ' '));
            } catch {
              return reasonRaw;
            }
          })()
        : undefined;
    return { googleCalendar, reason };
  } catch {
    return {};
  }
}

export const googleCalendarService = {
  getGoogleCalendarAuthUrl,
  getGoogleCalendarStatus,
  unwrapGoogleOAuthRedirectUrl,
  parseGoogleCalendarOAuthReturnUrl,
  parseOAuthParamsFromUrl,
};
