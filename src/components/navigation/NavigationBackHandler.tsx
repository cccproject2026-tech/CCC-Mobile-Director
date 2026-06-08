import '@/utils/patchRouterBack';
import { currentPathnameRef, DIRECTOR_HOME_HREF, safeGoBack } from '@/utils/navigation';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/** Keeps pathname ref in sync for safe back + Android hardware back. */
export function NavigationBackHandler() {
  const pathname = usePathname();

  useEffect(() => {
    currentPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      safeGoBack(router, {
        currentPathname: currentPathnameRef.current,
        fallback: DIRECTOR_HOME_HREF,
      });
      return true;
    });

    return () => subscription.remove();
  }, []);

  return null;
}
