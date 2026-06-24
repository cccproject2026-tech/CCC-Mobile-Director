import GradientCalendar from "@/components/Appointments/calendar";
import GoogleCalendarConnectButton from "@/components/GoogleCalendarConnectButton";
import TopBar from "@/components/Header/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { ScreenBackHeader } from "@/components/ui/design-system";
import {
  calendarYearMonthFromYmd,
  formatTimeSlot,
  mergeMonthlyAvailabilityWithWeeklySlotDates,
  normalizeAvailabilityDateString,
  slotsFromWeeklyOrMonthlyDay,
  useMonthlyAvailability,
  useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import {
  buildScheduleFlowParams,
  getScheduleMeetingBase,
} from "@/lib/scheduling/scheduleMeetingNavigation";
import { getReturnToParam } from "@/utils/navigation";
import { appointmentService } from "@/services/appointments.service";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import type { TimeSlot as APITimeSlot, WeeklyAvailability } from "@/types/appointment.types";
import {
  GOOGLE_CALENDAR_COPY,
  shortenGoogleCalendarMessage,
} from "@/utils/google-calendar/display-messages";
import { SCHEDULE_MEETING_PLATFORMS } from "@/utils/appointments/platform";
import { filterTimeSlotsAgainstGoogleCalendar } from "@/utils/google-calendar/google-calendar-scheduling";
import {
  filterSlotsByExistingBookings,
  filterSlotsByMinNotice,
  isMentorSlotTaken,
  isUserBookedAtSlot,
} from "@/utils/appointments/validation";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ymdToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** First upcoming date that still has at least one bookable slot (min-notice applied). */
function pickNearestBookableDay(
  availableDates: string[],
  hasBookableSlots: (ymd: string) => boolean,
  skipYmd?: string,
): string {
  const todayYmd = ymdToday();
  const ordered = [...availableDates].filter((d) => d >= todayYmd).sort();
  for (const ymd of ordered) {
    if (skipYmd && ymd === skipYmd) continue;
    if (hasBookableSlots(ymd)) return ymd;
  }
  return ordered.find((d) => d !== skipYmd) || "";
}

export default function ScheduleMeetingTimeScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const routeParams = useLocalSearchParams<{
    drawerContext?: string;
    assessmentId?: string;
    returnTo?: string;
  }>();
  const { drawerContext, assessmentId } = routeParams;
  const { draft, setDay, setSlot, setMeetingTitle, setMeetingDescription, setPlatformLabel } =
    useScheduleMeetingStore();
  const insets = useSafeAreaInsets();
  const scheduleBase = getScheduleMeetingBase(drawerContext, user?.role);
  const flowParams = useMemo(
    () =>
      buildScheduleFlowParams({
        drawerContext,
        assessmentId,
        returnTo: getReturnToParam(routeParams),
      }),
    [assessmentId, drawerContext, routeParams.returnTo],
  );

  const handleBack = useCallback(() => {
    router.replace({
      pathname: `${scheduleBase}/person` as any,
      params: {
        ...flowParams,
        mode: draft.mode,
        appointmentId: draft.appointmentId,
        preserveDraft: "1",
      },
    });
  }, [draft.appointmentId, draft.mode, flowParams, scheduleBase]);

  const topBar = (
    <>
      <TopBar
        role={String(user?.role || "pastor")}
        showUserName
        showDrawer={false}
      />
      <ScreenBackHeader title="Schedule" onPressBack={handleBack} />
    </>
  );

  const hasPerson = Boolean(draft.person?.id);

  useEffect(() => {
    if (hasPerson) return;
    router.replace({
      pathname: `${scheduleBase}/person` as any,
      params: flowParams,
    });
  }, [flowParams, hasPerson, scheduleBase]);

  const isMentor = String(user?.role || "").toLowerCase() === "mentor";

  // Availability owner (mentor hosting the grid).
  const availabilityOwnerId = isMentor ? user?.id : draft.person?.id;
  // Booker whose Google calendar may also block slots.
  const participantUserId = isMentor ? draft.person?.id : user?.id;

  // Booker whose existing appointments block duplicate slot picks.
  const overlapUserId = isMentor ? draft.person?.id : user?.id;
  const { appointments: userAppointments } = useAppointments({
    userId: overlapUserId || undefined,
  });
  const { appointments: mentorAppointments } = useAppointments(
    availabilityOwnerId ? { mentorId: availabilityOwnerId } : {},
  );

  const excludeAppointmentId =
    draft.mode === "reschedule" ? draft.appointmentId : undefined;

  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [calendarSlotSyncLoading, setCalendarSlotSyncLoading] = useState(false);
  const [calendarSlotSyncError, setCalendarSlotSyncError] = useState<string | null>(null);
  const [calendarConnectBanners, setCalendarConnectBanners] = useState<string[]>([]);
  const [calendarBusyStripped, setCalendarBusyStripped] = useState(0);
  const [googleFilteredSlots, setGoogleFilteredSlots] = useState<
    { id: string; label: string; apiSlot: APITimeSlot }[] | null
  >(null);
  const [showPlatformOptions, setShowPlatformOptions] = useState(false);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const prevAvailabilityOwnerRef = useRef<string | null>(null);

  // Drawer keeps this screen mounted (freezeOnBlur). Re-sync calendar + refetch on each visit.
  useFocusEffect(
    useCallback(() => {
      if (!availabilityOwnerId) return;

      setGoogleFilteredSlots(null);
      setCalendarSlotSyncLoading(false);
      setCalendarSlotSyncError(null);
      setCalendarConnectBanners([]);
      setCalendarBusyStripped(0);
      setSlot(null);

      const draftState = useScheduleMeetingStore.getState().draft;
      const ymd = draftState.selectedDayYmd;
      const n = new Date();
      let month = n.getMonth() + 1;
      let year = n.getFullYear();

      if (ymd) {
        const cal = calendarYearMonthFromYmd(ymd);
        if (cal) {
          month = cal.month;
          year = cal.year;
        }
      }

      setCurrentMonth(month);
      setCurrentYear(year);

      void queryClient.refetchQueries({
        queryKey: ["weekly-availability", availabilityOwnerId],
      });
      void queryClient.refetchQueries({
        queryKey: ["monthly-availability", availabilityOwnerId, month, year],
      });
      if (overlapUserId) {
        void queryClient.refetchQueries({
          queryKey: ["appointments", "user", overlapUserId],
        });
      }
      void queryClient.refetchQueries({
        queryKey: ["appointments", "mentor", availabilityOwnerId],
      });
    }, [availabilityOwnerId, overlapUserId, queryClient, setSlot]),
  );

  // New person / second booking in a row — drop stale month + slot sync from the prior session.
  useEffect(() => {
    if (!availabilityOwnerId) return;
    const ownerChanged = prevAvailabilityOwnerRef.current !== availabilityOwnerId;
    prevAvailabilityOwnerRef.current = availabilityOwnerId;
    if (!ownerChanged) return;

    setGoogleFilteredSlots(null);
    setCalendarSlotSyncLoading(false);
    setCalendarSlotSyncError(null);

    if (!draft.selectedDayYmd) {
      const n = new Date();
      setCurrentMonth(n.getMonth() + 1);
      setCurrentYear(n.getFullYear());
    }
  }, [availabilityOwnerId, draft.selectedDayYmd]);

  // Weekly settings / saved slots (source of truth for meeting settings + raw saved blocks).
  const { availability: weeklyAvailability, isLoading: isLoadingWeekly, isError: isWeeklyError } = useWeeklyAvailability(
    availabilityOwnerId || null,
    {
      enabled: Boolean(availabilityOwnerId),
      // IMPORTANT: availability belongs to mentor participant; avoid "pastor" defaults.
      role: "mentor",
    },
  );

  // Monthly availability (source of truth for which dates are selectable this month).
  // This endpoint also applies backend constraints (min notice / max bookings per day).
  const {
    availability: monthlyAvailability,
    isLoading: isLoadingMonthly,
    isError: isMonthlyError,
  } = useMonthlyAvailability(
    {
      mentorId: availabilityOwnerId || null,
      month: currentMonth,
      year: currentYear,
      // IMPORTANT: availability belongs to mentor participant; avoid "pastor" defaults.
      role: "mentor",
    },
    {
      enabled: Boolean(availabilityOwnerId),
      // IMPORTANT: never show generated/fake availability in scheduling flow.
      allowDefaultForMentee: false,
      staleTimeMs: 2000,
    },
  );

  /** Only block the calendar when this month has never loaded — not on background refetch. */
  const showMonthLoadingOverlay = isLoadingMonthly;

  const settings = weeklyAvailability;
  const weeklySlots = weeklyAvailability?.weeklySlots ?? [];

  const toDateString = (value: string) => normalizeAvailabilityDateString(value);

  const mergedAvailability = useMemo(() => {
    // Merge the backend month view with the saved weekly slots.
    // We prefer the "richer" representation (more segments) per day.
    return mergeMonthlyAvailabilityWithWeeklySlotDates(
      currentMonth,
      currentYear,
      monthlyAvailability,
      weeklySlots,
    );
  }, [currentMonth, currentYear, monthlyAvailability, weeklySlots]);

  const schedulingSettings = useMemo((): WeeklyAvailability | null => {
    if (!weeklyAvailability) return null;
    return weeklyAvailability as WeeklyAvailability;
  }, [weeklyAvailability]);

  const availableDates = useMemo(() => {
    if (!mergedAvailability?.length) return [];
    const todayYmd = ymdToday();
    const set = new Set<string>();
    for (const day of mergedAvailability as any[]) {
      const key = toDateString(String(day?.date ?? ""));
      if (!key || key < todayYmd) continue;
      const slots = slotsFromWeeklyOrMonthlyDay(day);
      const afterNotice = filterSlotsByMinNotice(key, slots, schedulingSettings);
      const bookable = filterSlotsByExistingBookings(
        key,
        afterNotice,
        userAppointments,
        mentorAppointments,
        excludeAppointmentId,
      );
      if (bookable.length > 0) set.add(key);
    }
    return Array.from(set).sort();
  }, [mergedAvailability, schedulingSettings, userAppointments, mentorAppointments, excludeAppointmentId]);

  const minNoticeHours = schedulingSettings?.minSchedulingNoticeHours ?? 0;

  const getTimeSlotsForDate = useCallback(
    (dateString: string) => {
      if (!mergedAvailability?.length) {
        return [] as { id: string; label: string; apiSlot: APITimeSlot }[];
      }
      const dayData = (mergedAvailability as any[]).find(
        (d) => toDateString(String(d?.date ?? "")) === dateString,
      ) as any;
      const raw: APITimeSlot[] = dayData ? slotsFromWeeklyOrMonthlyDay(dayData) : [];
      const afterNotice = filterSlotsByMinNotice(dateString, raw, schedulingSettings);
      const slots = filterSlotsByExistingBookings(
        dateString,
        afterNotice,
        userAppointments,
        mentorAppointments,
        excludeAppointmentId,
      );
      return slots.map((slot: APITimeSlot, idx: number) => ({
        id: slot._id || `${dateString}-${idx}`,
        label: formatTimeSlot(slot),
        apiSlot: slot,
      }));
    },
    [mergedAvailability, schedulingSettings, userAppointments, mentorAppointments, excludeAppointmentId],
  );

  const selectNearestBookableDay = useCallback(
    (skipYmd?: string) => {
      if (availableDates.length === 0) return;
      const next = pickNearestBookableDay(
        availableDates,
        (ymd) => getTimeSlotsForDate(ymd).length > 0,
        skipYmd,
      );
      if (!next || next === draft.selectedDayYmd) return;
      setDay(next);
      const cal = calendarYearMonthFromYmd(next);
      if (cal) {
        setCurrentMonth(cal.month);
        setCurrentYear(cal.year);
      }
    },
    [availableDates, draft.selectedDayYmd, getTimeSlotsForDate, setDay],
  );

  // If this month has no bookable days left, walk forward until we find some.
  useEffect(() => {
    if (isLoadingWeekly || isLoadingMonthly) return;
    if (availableDates.length > 0) return;

    const today = new Date();
    const monthsAhead =
      (currentYear - today.getFullYear()) * 12 + (currentMonth - 1 - today.getMonth());
    if (monthsAhead >= 12) return;

    const next = new Date(currentYear, currentMonth, 1);
    setCurrentMonth(next.getMonth() + 1);
    setCurrentYear(next.getFullYear());
  }, [
    availableDates.length,
    currentMonth,
    currentYear,
    isLoadingMonthly,
    isLoadingWeekly,
  ]);

  useEffect(() => {
    if (availableDates.length === 0) return;

    const todayYmd = ymdToday();
    const current = draft.selectedDayYmd;
    const invalid = !current || current < todayYmd || !availableDates.includes(current);
    if (invalid) {
      selectNearestBookableDay();
    }
  }, [availableDates, draft.selectedDayYmd, selectNearestBookableDay]);

  useEffect(() => {
    // reset time when day changes
    setSlot(null);
  }, [draft.selectedDayYmd, setSlot]);

  const timeSlots = useMemo(
    () => (draft.selectedDayYmd ? getTimeSlotsForDate(draft.selectedDayYmd) : []),
    [draft.selectedDayYmd, getTimeSlotsForDate],
  );

  const meetingDurationMinutes = schedulingSettings?.meetingDuration ?? 60;

  useEffect(() => {
    if (!availabilityOwnerId || !draft.selectedDayYmd || timeSlots.length === 0) {
      setGoogleFilteredSlots(null);
      setCalendarConnectBanners([]);
      setCalendarBusyStripped(0);
      setCalendarSlotSyncError(null);
      return;
    }

    let cancelled = false;
    setCalendarSlotSyncLoading(true);
    setCalendarSlotSyncError(null);

    void (async () => {
      const rawApiSlots = timeSlots.map((s) => s.apiSlot);
      const result = await filterTimeSlotsAgainstGoogleCalendar({
        meetingDateYmd: draft.selectedDayYmd,
        rawSlots: rawApiSlots,
        availabilityMentorUserId: availabilityOwnerId,
        availabilityParticipantUserId: participantUserId,
        meetingDurationMinutes,
        fetchMergedAvailability: (mentorUserId, params) =>
          appointmentService.getMergedAvailability(mentorUserId, params),
      });

      if (cancelled) return;

      const filtered = timeSlots.filter((row) =>
        result.slots.some((slot) => slot._id === row.apiSlot._id || (
          slot.startTime === row.apiSlot.startTime &&
          slot.startPeriod === row.apiSlot.startPeriod
        )),
      );

      setGoogleFilteredSlots(filtered);
      setCalendarConnectBanners(
        googleCalendarConnected
          ? result.connectGoogleBanners.filter(
              (msg) => !/link google calendar|reconnect google calendar/i.test(msg),
            )
          : result.connectGoogleBanners,
      );
      setCalendarBusyStripped(result.strippedCount);
      setCalendarSlotSyncError(result.error ?? null);
      setCalendarSlotSyncLoading(false);

      if (draft.selectedSlot && !filtered.some((s) => s.apiSlot._id === draft.selectedSlot?._id)) {
        setSlot(null);
      }
    })();

    return () => {
      cancelled = true;
      setCalendarSlotSyncLoading(false);
    };
  }, [
    availabilityOwnerId,
    draft.selectedDayYmd,
    draft.selectedSlot,
    googleCalendarConnected,
    meetingDurationMinutes,
    participantUserId,
    setSlot,
    timeSlots,
  ]);

  const displayTimeSlots = googleFilteredSlots ?? timeSlots;

  const bookingConflictStrippedCount = useMemo(() => {
    if (!draft.selectedDayYmd || !mergedAvailability?.length) return 0;
    const dayData = (mergedAvailability as any[]).find(
      (d) => toDateString(String(d?.date ?? "")) === draft.selectedDayYmd,
    ) as any;
    const raw: APITimeSlot[] = dayData ? slotsFromWeeklyOrMonthlyDay(dayData) : [];
    const afterNotice = filterSlotsByMinNotice(
      draft.selectedDayYmd,
      raw,
      schedulingSettings,
    );
    const afterBookings = filterSlotsByExistingBookings(
      draft.selectedDayYmd,
      afterNotice,
      userAppointments,
      mentorAppointments,
      excludeAppointmentId,
    );
    return afterNotice.length - afterBookings.length;
  }, [
    draft.selectedDayYmd,
    excludeAppointmentId,
    mergedAvailability,
    mentorAppointments,
    schedulingSettings,
    userAppointments,
  ]);

  useEffect(() => {
    if (!draft.selectedDayYmd || !draft.selectedSlot) return;
    if (
      isUserBookedAtSlot(
        draft.selectedDayYmd,
        draft.selectedSlot,
        userAppointments,
        excludeAppointmentId,
      ) ||
      isMentorSlotTaken(
        draft.selectedDayYmd,
        draft.selectedSlot,
        mentorAppointments,
        excludeAppointmentId,
      )
    ) {
      setSlot(null);
    }
  }, [
    draft.selectedDayYmd,
    draft.selectedSlot,
    excludeAppointmentId,
    mentorAppointments,
    setSlot,
    userAppointments,
  ]);

  // Selected day had slots locally but none remain after sync — try the next bookable date.
  useEffect(() => {
    if (calendarSlotSyncLoading || availableDates.length === 0) return;
    if (displayTimeSlots.length > 0) return;

    const current = draft.selectedDayYmd;
    if (!current) {
      selectNearestBookableDay();
      return;
    }

    if (timeSlots.length === 0) {
      const todayYmd = ymdToday();
      const invalid = current < todayYmd || !availableDates.includes(current);
      if (invalid) selectNearestBookableDay();
      return;
    }

    selectNearestBookableDay(current);
  }, [
    availableDates.length,
    calendarSlotSyncLoading,
    displayTimeSlots.length,
    draft.selectedDayYmd,
    selectNearestBookableDay,
    timeSlots.length,
  ]);

  const canContinue = Boolean(
    draft.person?.id &&
      draft.meetingTitle.trim() &&
      draft.selectedDayYmd &&
      draft.selectedSlot,
  );

  const visibleMonthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth - 1, 1);
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [currentMonth, currentYear]);

  if (!hasPerson) return null;

  // Only block the whole screen until weekly settings exist — monthly refetches on month change
  // must NOT replace the UI (that caused “loading same month” and missing next-month dates).
  const showBlockingLoader = isLoadingWeekly;
  const weeklyFatalError = isWeeklyError;

  if (showBlockingLoader) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        {topBar}
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.subtle}>Loading availability…</Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (weeklyFatalError) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        {topBar}
        <View style={styles.center}>
          <Text style={styles.title}>Unable to load availability</Text>
          <Text style={styles.subtle}>Please try again.</Text>
          <Pressable style={styles.primary} onPress={() => router.back()}>
            <Text style={styles.primaryText}>Go back</Text>
          </Pressable>
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      {topBar}
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <Text style={styles.title}>Pick date & time</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Meeting with {draft.person?.name}
          </Text>

          <View style={styles.calendarCard}>
            <GradientCalendar
              selected={draft.selectedDayYmd}
              setSelected={(ymd: string) => setDay(ymd)}
              availableDates={availableDates}
              onMonthChange={(m, y) => {
                setCurrentMonth(m);
                setCurrentYear(y);
              }}
              showHeader={true}
              disablePastDates={true}
              markToday={true}
            />
            {showMonthLoadingOverlay ? (
              <View style={styles.calendarLoadingOverlay} pointerEvents="none">
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.calendarLoadingText}>Loading {visibleMonthLabel}…</Text>
              </View>
            ) : null}
          </View>

          {isMonthlyError ? (
            <Text style={styles.monthlyWarning}>
              Could not refresh this month from the server; showing saved weekly slots only.
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Available time slots</Text>
          {calendarSlotSyncLoading ? (
            <View style={styles.syncRow}>
              <ActivityIndicator color="#8ec5eb" size="small" />
              <Text style={styles.syncText}>{GOOGLE_CALENDAR_COPY.syncing}</Text>
            </View>
          ) : null}
          {calendarSlotSyncError ? (
            <Text style={styles.calendarError}>
              {shortenGoogleCalendarMessage(calendarSlotSyncError) ||
                GOOGLE_CALENDAR_COPY.slotValidationFailed}
            </Text>
          ) : null}
          {calendarBusyStripped > 0 ? (
            <Text style={styles.calendarBanner}>{GOOGLE_CALENDAR_COPY.busyHidden}</Text>
          ) : null}
          {bookingConflictStrippedCount > 0 ? (
            <Text style={styles.calendarBanner}>
              Some times are hidden because they are already booked on your or the mentor&apos;s calendar.
            </Text>
          ) : null}
          {minNoticeHours > 0 ? (
            <Text style={styles.noticeHint}>
              Slots must start at least {minNoticeHours} hour{minNoticeHours === 1 ? "" : "s"} from now.
            </Text>
          ) : null}
          {displayTimeSlots.length === 0 ? (
            <Text style={styles.subtle}>
              {minNoticeHours > 0
                ? "No bookable slots for this date (notice period, availability, or calendar conflicts)."
                : "No slots for this date."}
            </Text>
          ) : (
            <View style={styles.slotGrid}>
              {displayTimeSlots.map((s) => {
                const selected = draft.selectedSlot?._id === s.apiSlot._id;
                return (
                  <Pressable
                    key={s.id}
                    style={[styles.slot, selected && styles.slotSelected]}
                    onPress={() => setSlot(s.apiSlot)}
                  >
                    <Text style={[styles.slotText, selected && styles.slotTextSelected]}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.googleCalendarSection}>
            <GoogleCalendarConnectButton
              variant="dark"
              onStatusChange={(status) => setGoogleCalendarConnected(status === "connected")}
              onConnectionSynced={() => {
                queryClient.invalidateQueries({ queryKey: ["weekly-availability"] });
                queryClient.invalidateQueries({ queryKey: ["monthly-availability"] });
              }}
            />
          </View>

          {calendarConnectBanners.map((msg) => (
            <Text key={msg.slice(0, 80)} style={styles.calendarBanner}>
              {msg}
            </Text>
          ))}

          <Text style={styles.fieldLabel}>Meeting title</Text>
          <TextInput
            value={draft.meetingTitle}
            onChangeText={setMeetingTitle}
            placeholder="Enter meeting title"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.textInput}
            autoCapitalize="sentences"
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Meeting description (optional)</Text>
          <TextInput
            value={draft.meetingDescription}
            onChangeText={setMeetingDescription}
            placeholder="Add meeting details"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={[styles.textInput, styles.textArea]}
            multiline
            textAlignVertical="top"
            autoCapitalize="sentences"
          />

          <Text style={styles.sectionTitle}>Meeting platform</Text>
          <Pressable
            style={styles.dropdownButton}
            onPress={() => setShowPlatformOptions((open) => !open)}
          >
            <Text style={styles.dropdownText}>{draft.meetingOptionLabel}</Text>
            <Ionicons
              name={showPlatformOptions ? "chevron-up" : "chevron-down"}
              size={16}
              color="#FFFFFF"
            />
          </Pressable>

          {showPlatformOptions ? (
            <View style={styles.dropdownOptions}>
              {SCHEDULE_MEETING_PLATFORMS.map((option) => {
                const selected = draft.meetingOptionLabel === option.label;
                return (
                  <Pressable
                    key={option.id}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setPlatformLabel(option.label);
                      setShowPlatformOptions(false);
                    }}
                  >
                    <Ionicons
                      name={(option.iconName as any) || "videocam-outline"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.dropdownOptionText}>{option.label}</Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={16} color="#8ec5eb" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footerOuter, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.footerBar}>
            <Pressable style={styles.secondaryBtn} onPress={handleBack}>
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, !canContinue && styles.primaryBtnDisabled]}
              disabled={!canContinue}
              onPress={() =>
                router.replace({
                  pathname: `${scheduleBase}/confirm` as any,
                  params: flowParams,
                })
              }
            >
              <Text style={styles.primaryBtnText}>Review meeting</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  subtitle: { marginTop: 6, color: "rgba(255,255,255,0.75)", fontWeight: "700" },
  googleCalendarSection: { marginTop: 18, marginBottom: 4 },
  calendarBanner: {
    color: "#fef3c7",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  calendarError: {
    color: "#fef3c7",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  syncText: { color: "#8ec5eb", fontSize: 12, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 24 },
  subtle: { color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  primary: { marginTop: 12, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  primaryText: { color: "#1E3A6F", fontWeight: "900" },
  calendarCard: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
    position: "relative",
  },
  calendarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 51, 81, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  calendarLoadingText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "700",
    fontSize: 13,
  },
  monthlyWarning: {
    marginTop: 8,
    color: "rgba(255, 209, 102, 0.95)",
    fontWeight: "600",
    fontSize: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { marginTop: 14, color: "#FFFFFF", fontWeight: "900" },
  fieldLabel: {
    marginTop: 14,
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  textInput: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  noticeHint: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
    fontSize: 12,
  },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  slot: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.06)" },
  slotSelected: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  slotText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  slotTextSelected: { color: "#1E3A6F" },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  dropdownText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  dropdownOptions: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    backgroundColor: "rgba(13, 51, 81, 0.65)",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  dropdownOptionText: { flex: 1, color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  footerOuter: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: "transparent" },
  footerBar: { flexDirection: "row", gap: 12 },
  secondaryBtn: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  secondaryText: { color: "#1E3A6F", fontWeight: "900" },
  primaryBtn: { flex: 1, backgroundColor: "rgba(30, 54, 111, 1)", borderRadius: 14, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "#FFFFFF" },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "900" },
});

