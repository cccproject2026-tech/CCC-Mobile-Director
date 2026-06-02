import AsyncStorage from '@react-native-async-storage/async-storage';

const RETURN_PATH_KEY = 'ccc.googleCalendar.oauthReturnPath';

const DEFAULT_BY_ROLE: Record<string, string> = {
  mentor: '/appointments/availability',
  pastor: '/appointments',
  director: '/appointments',
};

export async function saveGoogleCalendarOAuthReturnPath(pathname: string): Promise<void> {
  const path = pathname?.trim();
  if (!path || path.startsWith('/oauth/')) return;
  await AsyncStorage.setItem(RETURN_PATH_KEY, path);
}

export async function consumeGoogleCalendarOAuthReturnPath(
  role?: string | null,
): Promise<string> {
  try {
    const stored = (await AsyncStorage.getItem(RETURN_PATH_KEY))?.trim();
    await AsyncStorage.removeItem(RETURN_PATH_KEY);
    if (stored && !stored.startsWith('/oauth/')) {
      return stored;
    }
  } catch {
    // ignore
  }
  const roleKey = String(role || '').toLowerCase();
  return DEFAULT_BY_ROLE[roleKey] ?? '/appointments';
}
