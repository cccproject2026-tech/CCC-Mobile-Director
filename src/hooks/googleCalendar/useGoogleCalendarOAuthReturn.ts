import { parseOAuthParamsFromUrl } from '@/services/googleCalendar.service';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';

const handledUrls = new Set<string>();

function shouldHandleGoogleCalendarUrl(url: string): boolean {
  return url.includes('googleCalendar=');
}

/** Route OAuth deep links to the dedicated handler screen (avoids +not-found flash). */
export function routeGoogleCalendarOAuthReturn(url: string): boolean {
  if (!shouldHandleGoogleCalendarUrl(url)) return false;
  if (handledUrls.has(url)) return true;
  handledUrls.add(url);

  router.replace({
    pathname: '/oauth/google-calendar',
    params: parseOAuthParamsFromUrl(url),
  } as any);
  return true;
}

/**
 * Listens for OAuth return deep links (cold start, background, foreground)
 * and routes them to `/oauth/google-calendar` for processing.
 */
export function useGoogleCalendarOAuthReturn() {
  const handleUrl = useCallback((url: string | null) => {
    if (!url) return;
    routeGoogleCalendarOAuthReturn(url);
  }, []);

  useEffect(() => {
    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, [handleUrl]);
}

/** Used when WebBrowser returns in-app without a full deep-link navigation. */
export async function handleGoogleCalendarOAuthSessionResult(
  resultUrl: string,
): Promise<void> {
  routeGoogleCalendarOAuthReturn(resultUrl);
}

export {
  invalidateAfterGoogleCalendarOAuth,
  refreshGoogleCalendarStatus,
} from '@/hooks/googleCalendar/useGoogleCalendarStatus';
