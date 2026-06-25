import '@/utils/patchRouterBack';
import { handleScheduleMeetingStackBack } from '@/lib/scheduling/scheduleMeetingNavigation';
import { useAuthStore } from '@/stores/auth.store';
import {
  currentPathnameRef,
  currentReturnToRef,
  currentSearchParamsRef,
  DIRECTOR_HOME_HREF,
  getReturnToParam,
  safeGoBack,
} from '@/utils/navigation';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/** Keeps pathname + returnTo in sync for safe back + Android hardware back. */
export function NavigationBackHandler() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const returnTo = getReturnToParam(params);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    currentPathnameRef.current = pathname;
    currentReturnToRef.current = returnTo;
    currentSearchParamsRef.current = params;
  }, [pathname, returnTo, params]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (handleScheduleMeetingStackBack(router, pathname, role, params)) {
        return true;
      }
      safeGoBack(router, {
        currentPathname: currentPathnameRef.current,
        returnTo: currentReturnToRef.current,
        fallback: DIRECTOR_HOME_HREF,
      });
      return true;
    });

    return () => subscription.remove();
  }, [pathname, params, role]);

  return null;
}
