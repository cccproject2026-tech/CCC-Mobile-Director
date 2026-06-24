import AppGradientBackground from "@/components/layout/AppGradientBackground";
import TopBar from "@/components/Header/TopBar";
import { ScreenBackHeader } from "@/components/ui/design-system";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import { useMeetingScheduler } from "@/hooks/appointments/useMeetingScheduler";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useWeeklyAvailability } from "@/hooks/mentors/useMentorsAvailability";
import { appointmentKeys } from "@/hooks/appointments/useAppointments";
import {
  exitScheduleMeetingFlow,
  getScheduleMeetingBase,
} from "@/lib/scheduling/scheduleMeetingNavigation";
import { saveAssessmentMeetingLink } from "@/lib/assessments/assessmentMeetings";
import { appointmentService } from "@/services/appointments.service";
import { getDeviceTimezone } from "@/utils/appointments/timezone";
import { getScheduleMeetingCalendarNote } from "@/utils/google-calendar/display-messages";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatMeetingDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const year = date.getFullYear().toString().slice(-2);
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${year}`;
}

export default function ScheduleMeetingConfirmScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { drawerContext, assessmentId } = useLocalSearchParams<{
    drawerContext?: string;
    assessmentId?: string;
  }>();
  const deviceTz = useMemo(() => getDeviceTimezone(), []);
  const { draft } = useScheduleMeetingStore();
  const [isDone, setIsDone] = useState(false);
  const insets = useSafeAreaInsets();
  const scheduleBase = getScheduleMeetingBase(drawerContext, user?.role);
  const isAssessmentFlow = Boolean(assessmentId);

  const handleBack = useCallback(() => {
    router.replace({
      pathname: `${scheduleBase}/time` as any,
      params: {
        drawerContext,
        ...(assessmentId ? { assessmentId } : {}),
      },
    });
  }, [assessmentId, drawerContext, scheduleBase]);

  // Drawer freezes screens — clear "done" from the previous booking when re-entering.
  useFocusEffect(
    useCallback(() => {
      setIsDone(false);
    }, []),
  );

  const canSubmit = Boolean(
    draft.person?.id &&
      draft.meetingTitle.trim() &&
      draft.selectedDayYmd &&
      draft.selectedSlot,
  );

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";
  const availabilityOwnerId = isMentor ? user?.id : draft.person?.id;

  const { appointments: mentorAppointments } = useAppointments(
    availabilityOwnerId ? { mentorId: availabilityOwnerId } : {},
  );
  const { appointments: userAppointments } = useAppointments({
    userId: isMentor ? draft.person?.id : user?.id,
  });

  const { availability: weeklyAvailability } = useWeeklyAvailability(
    availabilityOwnerId || null,
    {
      enabled: Boolean(availabilityOwnerId),
      role: "mentor",
    },
  );

  const existingAppointment = useMemo(() => {
    if (!draft.appointmentId) return null;
    // Find from either list (best-effort)
    const all = [...mentorAppointments, ...userAppointments];
    return all.find((a) => String(a.id) === String(draft.appointmentId)) ?? null;
  }, [draft.appointmentId, mentorAppointments, userAppointments]);

  const { submit, isSubmitting } = useMeetingScheduler({
    mode: draft.mode,
    currentUserId: user?.id,
    currentUserRole: user?.role,
    selectedPerson: draft.person ? { id: draft.person.id, name: draft.person.name, role: draft.person.role } : null,
    existingAppointment,
    selectedDayYmd: draft.selectedDayYmd,
    selectedSlot: draft.selectedSlot,
    meetingTitle: draft.meetingTitle,
    meetingDescription: draft.meetingDescription,
    meetingOptionLabel: draft.meetingOptionLabel,
    settings: weeklyAvailability ?? undefined,
    mentorAppointments,
    userAppointments,
    assessmentId: assessmentId as string | undefined,
  });

  if (!canSubmit) return null;

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar
        role={String(user?.role || "pastor")}
        showUserName
        showDrawer={false}
      />
      <ScreenBackHeader title="Schedule" onPressBack={handleBack} />
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={styles.title}>Confirm meeting</Text>
          <Text style={styles.subtitle}>Review details before scheduling.</Text>

          <View style={styles.card}>
            <Row label="Title" value={draft.meetingTitle.trim() || "—"} icon="document-text-outline" />
            <Divider />
            {draft.meetingDescription.trim() ? (
              <>
                <Row
                  label="Description"
                  value={draft.meetingDescription.trim()}
                  icon="reader-outline"
                  multiline
                />
                <Divider />
              </>
            ) : null}
            <Row label="Person" value={draft.person?.name} icon="person-outline" />
            <Divider />
            <Row label="Date" value={draft.selectedDayYmd} icon="calendar-outline" />
            <Divider />
            <Row
              label="Time"
              value={
                draft.selectedSlot
                  ? `${draft.selectedSlot.startTime} ${draft.selectedSlot.startPeriod} - ${draft.selectedSlot.endTime} ${draft.selectedSlot.endPeriod}`
                  : "—"
              }
              icon="time-outline"
            />
            <Divider />
            <Row label="Platform" value={draft.meetingOptionLabel} icon="videocam-outline" />
            <Divider />
            <Row label="Timezone" value={deviceTz.timeZone || "Local"} icon="globe-outline" />
          </View>
        </ScrollView>

        <View style={[styles.footerOuter, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.footerBar}>
            <Pressable style={styles.secondaryBtn} onPress={handleBack} disabled={isSubmitting || isDone}>
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, (isSubmitting || isDone) && styles.primaryBtnDisabled]}
              disabled={isSubmitting || isDone}
              onPress={async () => {
                try {
                  const result = await submit();
                  setIsDone(true);
                  const text1 =
                    draft.mode === "reschedule" ? "Meeting rescheduled" : "Meeting scheduled";
                  const calendarNote = getScheduleMeetingCalendarNote({
                    successHint: result.googleCalendarSuccessHint,
                    warnings: result.googleCalendarSyncWarnings,
                  });
                  const returningText = isAssessmentFlow
                    ? "Returning to assessment…"
                    : "Returning to appointments…";
                  const text2 = calendarNote
                    ? `${calendarNote} · ${returningText}`
                    : returningText;
                  const meetingTimeLabel = draft.selectedSlot
                    ? `${draft.selectedSlot.startTime} ${draft.selectedSlot.startPeriod}`
                    : "";
                  const meetingMessage =
                    isAssessmentFlow && draft.selectedDayYmd
                      ? `Meeting scheduled on ${formatMeetingDateLabel(draft.selectedDayYmd)} at ${meetingTimeLabel}`
                      : undefined;

                  if (isAssessmentFlow && assessmentId) {
                    let link = result.meetingLink;
                    if (!link) {
                      try {
                        const apt = await appointmentService.getAppointmentById(
                          result.appointmentId,
                        );
                        link = getAppointmentJoinUrl(apt) ?? undefined;
                      } catch {
                        // Link may appear on the guidelines screen after refresh.
                      }
                    }
                    await saveAssessmentMeetingLink(assessmentId, {
                      appointmentId: result.appointmentId,
                      meetingDate: result.meetingDate,
                      meetingLink: link,
                    });
                    await queryClient.invalidateQueries({
                      queryKey: appointmentKeys.all,
                    });
                  }

                  Alert.alert(text1, text2);
                  setTimeout(() => {
                    exitScheduleMeetingFlow(router, user?.role, {
                      assessmentId: isAssessmentFlow ? assessmentId : undefined,
                      message: meetingMessage,
                    });
                  }, 400);
                } catch (e: any) {
                  const msg =
                    typeof e?.message === "string"
                      ? e.message
                      : e?.response?.data?.message != null
                        ? String(e.response.data.message)
                        : "Please try again.";
                  const errTitle = e?.title || "Booking failed";
                  Alert.alert(errTitle, msg);
                }
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>
                  {draft.mode === "reschedule" ? "Reschedule meeting" : "Schedule meeting"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </AppGradientBackground>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Row({
  label,
  value,
  icon,
  multiline,
}: {
  label: string;
  value?: string | null;
  icon: any;
  multiline?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={multiline ? undefined : 1}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  subtitle: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 14,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10 },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)" },
  label: { color: "rgba(255,255,255,0.6)", fontWeight: "900", fontSize: 11, textTransform: "uppercase" },
  value: { marginTop: 3, color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  footerOuter: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: "transparent" },
  footerBar: { flexDirection: "row", gap: 12 },
  secondaryBtn: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  secondaryText: { color: "#1E3A6F", fontWeight: "900" },
  primaryBtn: { flex: 1, backgroundColor: "rgba(30, 54, 111, 1)", borderRadius: 14, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#FFFFFF" },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryText: { color: "#FFFFFF", fontWeight: "900" },
});

