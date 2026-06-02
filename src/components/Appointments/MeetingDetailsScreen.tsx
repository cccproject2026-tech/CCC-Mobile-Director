import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Colors } from "@/constants/Colors";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useAuthStore } from "@/stores/auth.store";
import type { AppointmentPlatform } from "@/types/appointment.types";
import {
  appointmentPlatformLabel,
  formatMeetingIdForDisplay,
  getAppointmentJoinUrl,
  parseGoogleMeetCodeFromUrl,
  parseZoomMeetingIdFromUrl,
  truncateMiddle,
  zoomUrlHasPasscodeQuery,
} from "@/utils/meetingLinkDetails";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ───────────────────────────────────────────────────────────────
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

const COLORS = {
  navy: Colors.darkBlueGradientOne,
  navyMid: "#1E366F",
  navyLight: "#1E3A5F",
  accent: "#4FA8E0",
  accentDim: "rgba(79,168,224,0.18)",
  white: "#FFFFFF",
  whiteHigh: "rgba(255,255,255,0.92)",
  whiteMid: "rgba(255,255,255,0.60)",
  whiteLow: "rgba(255,255,255,0.18)",
  whiteXLow: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.14)",
  gold: "#F5C542",
  cardBg: "rgba(255,255,255,0.08)",
  cardBorder: "rgba(255,255,255,0.14)",
  successGreen: "#3DD68C",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeMeetingUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function shareContent(label: string, value: string) {
  try {
    await Share.share({ message: value, title: label });
  } catch {
    Alert.alert("Share failed", "Please long-press to copy.");
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDayOfWeek(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long" });
}

// ─── Platform Badge ───────────────────────────────────────────────────────────
const PlatformBadge = ({ platform }: { platform: AppointmentPlatform }) => {
  const isZoom = platform === "zoom";
  const isMeet = platform === "google_meet";
  const icon = isZoom ? "videocam" : isMeet ? "logo-google" : "globe-outline";
  const label = appointmentPlatformLabel(platform);

  return (
    <View style={badgeStyles.container}>
      <View style={[badgeStyles.dot, { backgroundColor: COLORS.successGreen }]} />
      <Ionicons name={icon as any} size={13} color={COLORS.accent} />
      <Text style={badgeStyles.text}>{label}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.accentDim,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 11,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(79,168,224,0.25)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({
  icon,
  label,
  value,
  isMono = false,
  onCopy,
}: {
  icon: string;
  label: string;
  value: string;
  isMono?: boolean;
  onCopy?: () => void;
}) => (
  <View style={rowStyles.row}>
    <View style={rowStyles.iconWrap}>
      <Ionicons name={icon as any} size={15} color={COLORS.accent} />
    </View>
    <View style={rowStyles.content}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, isMono && rowStyles.mono]} selectable numberOfLines={1}>
        {value}
      </Text>
    </View>
    {onCopy ? (
      <Pressable
        onPress={onCopy}
        hitSlop={SPACING.sm}
        style={({ pressed }) => [rowStyles.copyBtn, pressed && { opacity: 0.65 }]}
        accessibilityLabel={`Copy ${label}`}
      >
        <Ionicons name="copy-outline" size={14} color={COLORS.whiteMid} />
      </Pressable>
    ) : null}
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  label: {
    color: COLORS.whiteMid,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  value: {
    color: COLORS.whiteHigh,
    fontSize: 14,
    fontWeight: "600",
  },
  mono: Platform.select({
    ios: { fontFamily: "Menlo" },
    android: { fontFamily: "monospace" },
    default: {},
  }) as any,
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.whiteXLow,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Meeting Join Details ─────────────────────────────────────────────────────
const MeetingJoinDetails = ({
  meetingLink,
  platform,
}: {
  meetingLink: string;
  platform: AppointmentPlatform;
}) => {
  const link = meetingLink.trim();
  const zoomId = platform === "zoom" ? parseZoomMeetingIdFromUrl(link) : undefined;
  const meetCode =
    platform === "google_meet" ? parseGoogleMeetCodeFromUrl(link) : undefined;
  const hasZoomPasscode = platform === "zoom" && zoomUrlHasPasscodeQuery(link);

  return (
    <View style={joinStyles.card}>
      <PlatformBadge platform={platform} />

      <View style={{ marginTop: 4 }}>
        {zoomId && (
          <DetailRow
            icon="keypad-outline"
            label="Meeting ID"
            value={formatMeetingIdForDisplay(zoomId)}
            isMono
            onCopy={() => shareContent("Meeting ID", zoomId.replace(/\s/g, ""))}
          />
        )}
        {meetCode && (
          <DetailRow
            icon="grid-outline"
            label="Meet code"
            value={meetCode}
            isMono
            onCopy={() => shareContent("Meet code", meetCode)}
          />
        )}
        {hasZoomPasscode && (
          <DetailRow
            icon="lock-closed-outline"
            label="Passcode"
            value="Included in link"
          />
        )}
        <DetailRow
          icon="link-outline"
          label="Meeting link"
          value={truncateMiddle(link, 52)}
          isMono
          onCopy={() => shareContent("Meeting link", link)}
        />
      </View>

      <View style={joinStyles.actions}>
        <Pressable
          style={joinStyles.openBtn}
          onPress={() => Linking.openURL(normalizeMeetingUrl(link)).catch(() => {})}
        >
          <View style={joinStyles.openBtnInner}>
            <Ionicons name="open-outline" size={15} color={COLORS.navy} />
            <Text style={joinStyles.openText}>Open link</Text>
          </View>
        </Pressable>
        <Pressable
          style={joinStyles.shareBtn}
          onPress={() => shareContent("Meeting link", link)}
        >
          <Ionicons name="share-social-outline" size={15} color={COLORS.whiteMid} />
          <Text style={joinStyles.shareText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
};

const joinStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
    padding: SPACING.lg,
    gap: 0,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  openBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  openBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
  },
  openText: {
    color: COLORS.navy,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.whiteXLow,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareText: {
    color: COLORS.whiteMid,
    fontWeight: "700",
    fontSize: 14,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function MeetingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [isOpening, setIsOpening] = useState(false);

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";

  const { appointments, isLoading, refetch } = useAppointments(
    isMentor
      ? { mentorId: user?.id, futureOnly: false }
      : { userId: user?.id, futureOnly: false }
  );
  const { mentors } = useAssignedMentors(user?.id ?? null);

  const appointment = useMemo(() => {
    if (!appointmentId) return undefined;
    return appointments.find((a) => String(a.id) === String(appointmentId));
  }, [appointments, appointmentId]);

  const meetingLink = useMemo(
    () => getAppointmentJoinUrl(appointment),
    [appointment]
  );
  const mentorName = useMemo(() => {
    if (!appointment?.mentorId) return "Mentor";
    return (
      mentors.find((m) => String(m.id) === String(appointment.mentorId))?.name ||
      "Mentor"
    );
  }, [appointment?.mentorId, mentors]);

  const platform = (appointment?.platform ?? "zoom") as AppointmentPlatform;

  const onJoin = useCallback(async () => {
    if (!meetingLink) return;
    setIsOpening(true);
    try {
      await Linking.openURL(normalizeMeetingUrl(meetingLink));
    } catch {
      Alert.alert("Cannot open link", "Please check the meeting URL.");
    } finally {
      setIsOpening(false);
    }
  }, [meetingLink]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // ── Mentor initials avatar
  const initials = mentorName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 6 }]}>
        <Pressable
          style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.whiteHigh} />
          <Text style={s.headerBtnText}>Back</Text>
        </Pressable>

        <Text style={s.headerTitle}>Meeting Details</Text>

        <Pressable
          style={({ pressed }) => [s.refreshBtn, pressed && { opacity: 0.7 }]}
          onPress={onRefresh}
          hitSlop={10}
        >
          <Ionicons name="refresh-outline" size={18} color={COLORS.accent} />
        </Pressable>
      </View>

      {/* ── Body ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!appointmentId ? (
          <EmptyState
            icon="calendar-clear-outline"
            title="No meeting selected"
            subtitle="No appointment ID was provided."
          />
        ) : isLoading ? (
          <View style={s.center}>
            <ActivityIndicator color={COLORS.accent} size="large" />
            <Text style={s.subtleText}>Fetching meeting details…</Text>
          </View>
        ) : !appointment ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Meeting not found"
            subtitle={`This meeting may have been cancelled or doesn't belong to this account.\n\nID: ${appointmentId}`}
          />
        ) : (
          <>
            {/* ── Hero card ── */}
            <View style={s.heroCard}>
              {/* Accent stripe */}
              <View style={s.heroStripe} />

              <View style={s.heroTop}>
                {/* Avatar */}
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{initials}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.heroLabel}>Session with</Text>
                  <Text style={s.heroName} numberOfLines={1}>
                    {mentorName}
                  </Text>
                </View>
              </View>

              {/* Date / time strip */}
              <View style={s.timeStrip}>
                <View style={s.timeChip}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.accent} />
                  <Text style={s.timeChipText}>
                    {formatDayOfWeek(appointment.meetingDate)},{" "}
                    {formatDate(appointment.meetingDate)}
                  </Text>
                </View>
                <View style={s.timeDivider} />
                <View style={s.timeChip}>
                  <Ionicons name="time-outline" size={13} color={COLORS.accent} />
                  <Text style={s.timeChipText}>
                    {formatTime(appointment.meetingDate)} –{" "}
                    {formatTime(appointment.endTime)}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={s.heroActions}>
                <Pressable
                  style={[s.joinBtn, (!meetingLink || isOpening) && { opacity: 0.5 }]}
                  onPress={onJoin}
                  disabled={!meetingLink || isOpening}
                >
                  <View style={s.joinBtnInner}>
                    {isOpening ? (
                      <ActivityIndicator color={COLORS.navy} size="small" />
                    ) : (
                      <Ionicons name="videocam" size={17} color={COLORS.navy} />
                    )}
                    <Text style={s.joinText}>Join meeting</Text>
                  </View>
                </Pressable>

                {meetingLink ? (
                  <Pressable
                    style={s.shareHeroBtn}
                    onPress={() => shareContent("Meeting link", meetingLink)}
                  >
                    <Ionicons name="share-social-outline" size={17} color={COLORS.whiteHigh} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* ── Join Details ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Join details</Text>
              </View>

              {meetingLink ? (
                <MeetingJoinDetails meetingLink={meetingLink} platform={platform} />
              ) : (
                <View style={s.emptyCard}>
                  <Ionicons name="link-outline" size={22} color={COLORS.whiteLow} />
                  <Text style={s.emptyCardText}>No meeting link available yet.</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AppGradientBackground>
  );
}

// ─── Empty / Error State ──────────────────────────────────────────────────────
const EmptyState = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <View style={s.center}>
    <View style={emptyStyles.iconWrap}>
      <Ionicons name={icon as any} size={32} color={COLORS.whiteLow} />
    </View>
    <Text style={s.emptyTitle}>{title}</Text>
    <Text style={[s.subtleText, { textAlign: "center" }]}>{subtitle}</Text>
  </View>
);

const emptyStyles = StyleSheet.create({
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.whiteXLow,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: COLORS.whiteXLow,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBtnText: {
    color: COLORS.whiteHigh,
    fontWeight: "600",
    fontSize: 14,
  },
  headerTitle: {
    color: COLORS.whiteHigh,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: "rgba(79,168,224,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 24,
  },

  // Hero card
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
    overflow: "hidden",
  },
  heroStripe: {
    height: 4,
    width: "100%",
    // backgroundColor: "#FACC15",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    paddingBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroLabel: {
    color: COLORS.whiteMid,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.1,
  },

  // Time strip
  timeStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 16,
    backgroundColor: COLORS.whiteXLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  timeChipText: {
    color: COLORS.whiteHigh,
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  timeDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.whiteLow,
  },

  // Hero actions
  heroActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  joinBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  joinBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
  },
  joinText: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.1,
  },
  shareHeroBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.whiteXLow,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sections
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  sectionTitle: {
    color: COLORS.whiteHigh,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Empty card
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyCardText: {
    color: COLORS.whiteMid,
    fontSize: 14,
    fontWeight: "500",
  },

  // States
  center: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    color: COLORS.whiteHigh,
    fontSize: 17,
    fontWeight: "700",
  },
  subtleText: {
    color: COLORS.whiteMid,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
  },
});