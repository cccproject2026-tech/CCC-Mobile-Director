import GoogleCalendarConnectButton from '@/components/GoogleCalendarConnectButton';
import { GOOGLE_CALENDAR_COPY } from '@/utils/google-calendar/display-messages';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  variant?: 'dark' | 'light';
  onConnectionSynced?: () => void;
};

/** Connect button + helper copy for schedule / appointments screens (ccc-web parity). */
export default function GoogleCalendarScheduleBanner({
  variant = 'dark',
  onConnectionSynced,
}: Props) {
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);

  return (
    <View style={styles.wrap}>
      <GoogleCalendarConnectButton
        variant={variant}
        onConnectionSynced={onConnectionSynced}
        onStatusChange={(status) => setGoogleCalendarConnected(status === 'connected')}
      />
      <Text style={[styles.helper, variant === 'dark' ? styles.helperDark : styles.helperLight]}>
        {googleCalendarConnected
          ? GOOGLE_CALENDAR_COPY.active
          : GOOGLE_CALENDAR_COPY.connectHint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 12, marginBottom: 12 },
  helper: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  helperDark: { color: 'rgba(205, 226, 242, 0.75)' },
  helperLight: { color: 'rgba(11, 28, 88, 0.7)' },
});
