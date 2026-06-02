import * as Linking from 'expo-linking';

/** Deep-link path the app listens on after OAuth (backend must redirect here). */
export const GOOGLE_CALENDAR_OAUTH_RETURN_PATH = 'oauth/google-calendar';

/**
 * Redirect URL sent to backend as `redirectTo` and used by WebBrowser.openAuthSessionAsync.
 * Backend validates this against GOOGLE_OAUTH_MOBILE_SUCCESS_REDIRECT / allowlist.
 */
export function getGoogleCalendarOAuthRedirectUrl(): string {
  const envOverride = process.env.EXPO_PUBLIC_GOOGLE_OAUTH_SUCCESS_REDIRECT?.trim();
  if (envOverride) return envOverride;
  return Linking.createURL(GOOGLE_CALENDAR_OAUTH_RETURN_PATH);
}
