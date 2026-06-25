import { router } from 'expo-router';
import { handleScheduleMeetingStackBack } from '@/lib/scheduling/scheduleMeetingNavigation';
import { useAuthStore } from '@/stores/auth.store';
import {
  currentPathnameRef,
  currentReturnToRef,
  currentSearchParamsRef,
  safeGoBack,
} from '@/utils/navigation';

type RouterWithBack = typeof router & { back: () => void };

let originalBack: (() => void) | null = null;

/** Run at import time so GO_BACK is never dispatched via router.back(). */
export function patchRouterBackOnce(): void {
  if (originalBack) return;

  const routerApi = router as RouterWithBack;
  originalBack = routerApi.back.bind(routerApi);

  routerApi.back = () => {
    const pathname = currentPathnameRef.current ?? '';
    const role = useAuthStore.getState().user?.role;
    if (
      handleScheduleMeetingStackBack(
        router,
        pathname,
        role,
        currentSearchParamsRef.current,
      )
    ) {
      return;
    }
    safeGoBack(router, {
      currentPathname: pathname,
      returnTo: currentReturnToRef.current,
    });
  };
}

patchRouterBackOnce();
