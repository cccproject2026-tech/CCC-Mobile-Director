import type { Href, Router } from 'expo-router';

export type ReturnToParams = {
  returnTo?: string | string[];
};

/** Default when the stack has no screen to pop (e.g. tab root, deep link). */
export const DIRECTOR_HOME_HREF = '/(director)/(tabs)' as Href;

const MENTOR_TABS_GROUPED_PREFIX = '/(mentor)/(tabs)';

/** Updated by NavigationBackHandler — used when router.back() is patched. */
export const currentPathnameRef = { current: '' };
export const currentReturnToRef = { current: undefined as string | undefined };
export const currentSearchParamsRef = {
  current: {} as Record<string, string | string[] | undefined>,
};

/** Expand tab-relative paths (e.g. `/review-center/pastor`) to full Expo Router hrefs. */
export function normalizeReturnToHref(href?: string | null): string | undefined {
  const trimmed = String(href ?? '').trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/(')) return trimmed;

  const qIndex = trimmed.indexOf('?');
  const path = qIndex >= 0 ? trimmed.slice(0, qIndex) : trimmed;
  const query = qIndex >= 0 ? trimmed.slice(qIndex) : '';

  // Director uses `/roadmaps` (plural); mentor tab routes use `/roadmap` (singular).
  if (
    path.startsWith('/review-center') ||
    (path.startsWith('/roadmap') && !path.startsWith('/roadmaps')) ||
    path.startsWith('/assessments')
  ) {
    return `${MENTOR_TABS_GROUPED_PREFIX}${path}${query}`;
  }

  return trimmed;
}

/** Parse `pathname?query` into an Expo Router href object. */
export function parseStringHref(href: string): Href {
  const qIndex = href.indexOf('?');
  if (qIndex < 0) return href as Href;

  const pathname = href.slice(0, qIndex);
  const params: Record<string, string> = {};
  new URLSearchParams(href.slice(qIndex + 1)).forEach((value, key) => {
    params[key] = value;
  });

  return { pathname, params } as Href;
}

function coerceHref(href?: Href | string | null): Href {
  if (href == null || href === '') return DIRECTOR_HOME_HREF;
  if (typeof href === 'object') return href;

  const normalized = normalizeReturnToHref(href);
  if (!normalized) return DIRECTOR_HOME_HREF;
  return parseStringHref(normalized);
}

/** Read `returnTo` route param (href to restore when leaving a cross-stack screen). */
export function getReturnToParam(params: ReturnToParams): string | undefined {
  const raw = params.returnTo;
  if (!raw) return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = String(value ?? '').trim();
  return trimmed || undefined;
}

/** Build a return href for the current screen (pathname + query, excluding `returnTo`). */
export function buildReturnTo(
  pathname: string,
  searchParams?: Record<string, string | string[] | undefined | null>,
): string {
  if (!searchParams) return pathname;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'returnTo' || value == null) continue;
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized == null || normalized === '') continue;
    qs.set(key, String(normalized));
  }

  const query = qs.toString();
  const href = query ? `${pathname}?${query}` : pathname;
  return normalizeReturnToHref(href) ?? href;
}

/** Like buildReturnTo, but keeps parent returnTo in the query for nested back chains. */
export function buildReturnToWithParent(
  pathname: string,
  searchParams?: Record<string, string | string[] | undefined | null>,
  parentReturnTo?: string,
): string {
  const href = buildReturnTo(pathname, searchParams);
  const parent = normalizeReturnToHref(parentReturnTo);
  if (!parent) return href;
  const sep = href.includes('?') ? '&' : '?';
  return `${href}${sep}returnTo=${encodeURIComponent(parent)}`;
}

/** Attach `returnTo` when pushing into another stack so back can restore the prior screen. */
export function appendReturnTo<T extends Record<string, unknown>>(
  params: T,
  returnTo: string,
): T & { returnTo: string } {
  if (!returnTo) return params as T & { returnTo: string };
  return { ...params, returnTo };
}

function isTabRootPath(path: string): boolean {
  const normalized = path.replace(/\/$/, '') || '/';
  return (
    normalized === '/' ||
    normalized === '/(director)/(tabs)' ||
    normalized === '/(director)/(tabs)/index' ||
    normalized === '/(director)'
  );
}

/** Parent route via pathname (avoids GO_BACK on tab navigators where canGoBack() lies). */
export function getParentPathname(pathname: string): string {
  const path = (pathname || '').replace(/\/$/, '') || '/';

  if (isTabRootPath(path)) {
    return DIRECTOR_HOME_HREF as string;
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) {
    return DIRECTOR_HOME_HREF as string;
  }

  const last = segments[segments.length - 1];

  if (last === 'index') {
    segments.pop();
  } else if (!last.startsWith('(')) {
    segments.pop();
  }

  if (segments.length === 0) {
    return DIRECTOR_HOME_HREF as string;
  }

  const parent = `/${segments.join('/')}`;
  if (isTabRootPath(parent)) {
    return DIRECTOR_HOME_HREF as string;
  }

  return parent;
}

/**
 * Safe back: never dispatches GO_BACK (unreliable in Expo Router tabs).
 * Uses replace to parent path, returnTo, or dashboard fallback.
 */
export function safeGoBack(
  router: Router,
  options?: { fallback?: Href; returnTo?: string; currentPathname?: string },
): void {
  const returnTo = normalizeReturnToHref(options?.returnTo);

  if (returnTo) {
    router.replace(parseStringHref(returnTo));
    return;
  }

  const pathname =
    options?.currentPathname ?? currentPathnameRef.current ?? '';
  const fallback = coerceHref(options?.fallback);

  if (pathname) {
    const parent = getParentPathname(pathname);
    if (parent && parent !== pathname.replace(/\/$/, '')) {
      router.replace(parseStringHref(parent));
      return;
    }
  }

  router.replace(fallback);
}
