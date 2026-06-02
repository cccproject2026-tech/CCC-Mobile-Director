import { getGoogleCalendarOAuthRedirectUrl } from '@/constants/googleCalendar';
import {
  handleGoogleCalendarOAuthSessionResult,
} from '@/hooks/googleCalendar/useGoogleCalendarOAuthReturn';
import { useGoogleCalendarStatus } from '@/hooks/googleCalendar/useGoogleCalendarStatus';
import { getGoogleCalendarAuthUrl } from '@/services/googleCalendar.service';
import { useAuthStore } from '@/stores/auth.store';
import type { GoogleCalendarStatus } from '@/types/googleCalendar.types';
import { extractApiErrorMessage } from '@/utils/availability/api-error';
import {
  GOOGLE_CALENDAR_COPY,
  shortenGoogleCalendarMessage,
} from '@/utils/google-calendar/display-messages';
import { saveGoogleCalendarOAuthReturnPath } from '@/utils/google-calendar/oauthReturnPath';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  variant?: 'dark' | 'light';
  style?: ViewStyle;
  label?: string;
  onConnectionSynced?: () => void;
  onStatusChange?: (status: GoogleCalendarStatus | null) => void;
};

/**
 * Starts Google OAuth for Calendar linking via GET `/auth/google` + in-app browser.
 * Behavior aligned with ccc-web GoogleCalendarConnectButton.
 */
export default function GoogleCalendarConnectButton({
  variant = 'dark',
  style,
  label = 'Link Google Calendar',
  onConnectionSynced,
  onStatusChange,
}: Props) {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id)?.trim() ?? '';

  const [pending, setPending] = useState(false);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const {
    status: calendarStatus,
    calendarConnectionStatus,
    userId: statusUserId,
  } = useGoogleCalendarStatus();

  useEffect(() => {
    onStatusChange?.(calendarStatus ?? null);
  }, [calendarStatus, onStatusChange]);

  const startOAuth = useCallback(async () => {
    if (!userId) return;
    setErrorHint(null);
    setPending(true);
    try {
      await saveGoogleCalendarOAuthReturnPath(pathname);
      const url = await getGoogleCalendarAuthUrl();
      if (!url) {
        setErrorHint(GOOGLE_CALENDAR_COPY.signInUnavailable);
        return;
      }

      const redirectUrl = getGoogleCalendarOAuthRedirectUrl();
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

      if (result.type === 'success' && result.url) {
        await handleGoogleCalendarOAuthSessionResult(result.url);
        onConnectionSynced?.();
        return;
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setErrorHint(GOOGLE_CALENDAR_COPY.connectionCancelled);
      }
    } catch (e: unknown) {
      const msg = extractApiErrorMessage(e);
      const statusCode =
        e && typeof e === 'object' && 'statusCode' in e
          ? (e as { statusCode?: number }).statusCode
          : undefined;
      if (statusCode === 401) {
        setErrorHint(GOOGLE_CALENDAR_COPY.signInRequiredButton);
      } else if (statusCode === 404) {
        setErrorHint(GOOGLE_CALENDAR_COPY.linkingUnavailable);
      } else {
        setErrorHint(shortenGoogleCalendarMessage(msg));
      }
    } finally {
      setPending(false);
    }
  }, [onConnectionSynced, pathname, userId]);

  const statusCopy = (() => {
    if (calendarStatus === 'expired') return { icon: '⚠', text: 'Reconnect Google Calendar' };
    if (calendarStatus === 'error') return { icon: '⚠', text: 'Calendar Connection Error' };
    if (calendarStatus === 'disconnected') return { icon: '❌', text: 'Calendar Disconnected' };
    return null;
  })();

  const dynamicLabel =
    calendarStatus === 'expired' || calendarStatus === 'error'
      ? 'Reconnect Google Calendar'
      : label;

  const isDark = variant === 'dark';
  const containerStyle = isDark ? styles.containerDark : styles.containerLight;
  const connectedStyle = isDark ? styles.connectedDark : styles.connectedLight;
  const buttonStyle = isDark ? styles.buttonDark : styles.buttonLight;
  const hintStyle = isDark ? styles.hintDark : styles.hintLight;

  if (!isAuthenticated || !statusUserId) return null;

  return (
    <View style={[styles.wrapper, style]}>
      {calendarStatus === 'connected' ? (
        <View style={[styles.connectedRow, connectedStyle]} accessibilityRole="text">
          <View style={styles.connectedHeader}>
            <Ionicons name="checkmark-circle" size={16} color={isDark ? '#86efac' : '#15803d'} />
            <Text style={[styles.connectedTitle, isDark && styles.textLight]}>
              Google Calendar connected
            </Text>
          </View>
          {calendarConnectionStatus?.email ? (
            <Text style={[styles.metaText, hintStyle]}>
              {calendarConnectionStatus.email} linked
            </Text>
          ) : (
            <Text style={[styles.metaText, hintStyle]}>Busy-time sync on</Text>
          )}
          {calendarConnectionStatus?.lastSyncAt ? (
            <Text style={[styles.metaText, hintStyle]}>
              Last synced{' '}
              {new Date(calendarConnectionStatus.lastSyncAt).toLocaleString()}
            </Text>
          ) : null}
          <Pressable onPress={startOAuth} disabled={pending}>
            <Text style={[styles.reconnectLink, isDark && styles.reconnectLinkDark]}>
              Reconnect
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.button, buttonStyle, containerStyle]}
          onPress={startOAuth}
          disabled={pending}
        >
          {pending ? (
            <ActivityIndicator size="small" color={isDark ? '#d9ebf8' : '#0B1C58'} />
          ) : (
            <Ionicons name="logo-google" size={14} color={isDark ? '#d9ebf8' : '#0B1C58'} />
          )}
          <Text style={[styles.buttonText, isDark && styles.textLight]}>
            {pending ? 'Opening Google…' : dynamicLabel}
          </Text>
        </Pressable>
      )}

      {statusCopy ? (
        <Text style={[styles.statusHint, styles.warnHint]}>
          {statusCopy.icon} {statusCopy.text}
        </Text>
      ) : null}

      {calendarStatus && calendarStatus !== 'connected' && calendarConnectionStatus?.lastError ? (
        <Text style={[styles.statusHint, styles.warnHint]}>
          {shortenGoogleCalendarMessage(calendarConnectionStatus.lastError)}
        </Text>
      ) : null}

      {errorHint ? (
        <Text style={[styles.statusHint, styles.errorHint]} accessibilityRole="alert">
          {errorHint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6, maxWidth: '100%' },
  containerDark: {},
  containerLight: {},
  connectedRow: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    borderWidth: 1,
  },
  connectedDark: {
    borderColor: 'rgba(142, 197, 235, 0.4)',
    backgroundColor: 'rgba(142, 197, 235, 0.1)',
  },
  connectedLight: {
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  connectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connectedTitle: { fontSize: 12, fontWeight: '700', color: '#0B1C58' },
  metaText: { fontSize: 11, lineHeight: 16 },
  hintDark: { color: 'rgba(205, 226, 242, 0.9)' },
  hintLight: { color: 'rgba(11, 28, 88, 0.75)' },
  reconnectLink: { fontSize: 11, fontWeight: '700', color: '#2563eb', marginTop: 4 },
  reconnectLinkDark: { color: '#8ec5eb' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  buttonDark: {
    borderColor: 'rgba(142, 197, 235, 0.4)',
    backgroundColor: 'rgba(142, 197, 235, 0.1)',
  },
  buttonLight: {
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  buttonText: { fontSize: 12, fontWeight: '700', color: '#0B1C58' },
  textLight: { color: '#d9ebf8' },
  statusHint: { fontSize: 11, lineHeight: 16, maxWidth: 420 },
  warnHint: { color: '#fef3c7' },
  errorHint: { color: '#fecaca' },
});
