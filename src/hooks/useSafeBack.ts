import { currentPathnameRef, DIRECTOR_HOME_HREF, safeGoBack } from '@/utils/navigation';
import type { Href } from 'expo-router';
import { useRouter, usePathname } from 'expo-router';
import { useCallback } from 'react';

type Options = {
  fallback?: Href;
  returnTo?: string;
};

/** Safe back for header buttons — navigates to parent route or dashboard. */
export function useSafeBack(options?: Options) {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    safeGoBack(router, {
      fallback: options?.fallback ?? DIRECTOR_HOME_HREF,
      returnTo: options?.returnTo,
      currentPathname: pathname || currentPathnameRef.current,
    });
  }, [router, pathname, options?.fallback, options?.returnTo]);
}
