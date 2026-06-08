import { router } from 'expo-router';
import { currentPathnameRef, safeGoBack } from '@/utils/navigation';

type RouterWithBack = typeof router & { back: () => void };

let originalBack: (() => void) | null = null;

/** Run at import time so GO_BACK is never dispatched via router.back(). */
export function patchRouterBackOnce(): void {
  if (originalBack) return;

  const routerApi = router as RouterWithBack;
  originalBack = routerApi.back.bind(routerApi);

  routerApi.back = () => {
    safeGoBack(router, { currentPathname: currentPathnameRef.current });
  };
}

patchRouterBackOnce();
