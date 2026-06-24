import '@/utils/patchRouterBack';
import {
  currentPathnameRef,
  currentReturnToRef,
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

  useEffect(() => {
    currentPathnameRef.current = pathname;
    currentReturnToRef.current = returnTo;
  }, [pathname, returnTo]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      safeGoBack(router, {
        currentPathname: currentPathnameRef.current,
        returnTo: currentReturnToRef.current,
        fallback: DIRECTOR_HOME_HREF,
      });
      return true;
    });

    return () => subscription.remove();
  }, []);

  return null;
}
