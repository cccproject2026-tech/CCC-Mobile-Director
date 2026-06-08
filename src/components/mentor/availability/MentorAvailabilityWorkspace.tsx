import GoogleCalendarConnectButton from "@/components/GoogleCalendarConnectButton";
import {
  DEFAULT_SLOT_WINDOW,
  MIN_NOTICE_OPTIONS,
} from "@/components/mentor/availability/constants";
import { ScheduleMonthCalendar } from "@/components/calendar/ScheduleMonthCalendar";
import { SlotRowEditor } from "@/components/mentor/availability/SlotRowEditor";
import {
  useCreateRecurringAvailability,
  useMarkAvailabilityDayAvailable,
  useMarkAvailabilityDayUnavailable,
  usePatchAvailabilityDay,
} from "@/hooks/mentors/useMentorAvailabilityRecurring";
import {
  useMonthlyAvailability,
  useWeeklyAvailability,
} from "@/hooks/mentors/useMentorsAvailability";
import type {
  AppointmentAvailabilityTimeSlot,
  PatchMentorAvailabilityDayPayload,
} from "@/types/appointment.types";
import { extractApiErrorMessage } from "@/utils/availability/api-error";
import type { AvailabilityFormBaseline } from "@/utils/availability/availability-recurring-utils";
import {
  WEEKDAY_LABELS_SUN0,
  baselineFromAvailabilityBlob,
  buildTemplateWeeklySlotsFromRows,
  classifyDayOccurrence,
  digAvailabilityBlob,
  findAvailabilityRowForYmd,
  findOverlappingSlotPair,
  localCalendarYmd,
  slotSpanMinutes,
  utcReferenceYmdForWeekday,
  weekPatternKeyFromRows,
  weekRowsFromAvailabilityBlob,
} from "@/utils/availability/availability-recurring-utils";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type WeekRow = {
  dayIndexUtcSunday0: number;
  label: string;
  enabled: boolean;
  slots: AppointmentAvailabilityTimeSlot[];
};

function initialWeekRows(): WeekRow[] {
  return WEEKDAY_LABELS_SUN0.map((label, idx) => ({
    dayIndexUtcSunday0: idx,
    label,
    enabled: false,
    slots: [],
  }));
}

function formatYmdHeading(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return ymd;
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(dt.getTime())) return ymd;
  return dt.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  mentorId: string;
  onAvailabilitySaved?: () => void;
};

const DAY_SHEET_MAX_WIDTH = 560;

function formatMinNoticeLabel(hours: number): string {
  const preset = MIN_NOTICE_OPTIONS.find((o) => o.hours === hours);
  if (preset) return preset.label;
  if (hours <= 0) return "Same day";
  if (hours === 1) return "1 hour";
  return `${hours} hours`;
}

function minNoticeBookingPhrase(hours: number): string {
  if (hours <= 0) {
    return "on the same day as the meeting (with enough lead time for the chosen slot)";
  }
  return `at least ${formatMinNoticeLabel(hours).toLowerCase()} before the meeting starts`;
}

export function MentorAvailabilityWorkspace({
  mentorId,
  onAvailabilitySaved,
}: Props) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const daySheetWidth = Math.min(DAY_SHEET_MAX_WIDTH, windowWidth);
  const daySheetMaxHeight = Math.round(windowHeight * 0.9);
  const [weekRows, setWeekRows] = useState<WeekRow[]>(() => initialWeekRows());
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [horizonDays, setHorizonDays] = useState(60);

  const [meetingDuration, setMeetingDuration] = useState(60);
  const [minNoticeHours, setMinNoticeHours] = useState(2);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(5);
  const [preferredPlatform, setPreferredPlatform] = useState("zoom");

  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [blockSelectionMode, setBlockSelectionMode] = useState(false);
  const [pendingBlockYmd, setPendingBlockYmd] = useState<string | null>(null);

  const [dayModalYmd, setDayModalYmd] = useState<string | null>(null);
  const [dayModalSlots, setDayModalSlots] = useState<AppointmentAvailabilityTimeSlot[]>([]);
  const [savedBaseline, setSavedBaseline] = useState<AvailabilityFormBaseline | null>(
    null,
  );

  const showToast = useCallback((message: string, type: "success" | "error") => {
    Alert.alert(type === "success" ? "Saved" : "Error", message);
  }, []);

  const onMutationError = useCallback(
    (error: Error) => {
      showToast(extractApiErrorMessage(error), "error");
    },
    [showToast],
  );

  const { availability: weeklyDoc, isLoading: docLoading, refetch: refetchDoc } =
    useWeeklyAvailability(mentorId, { enabled: true, role: "mentor" });

  const {
    availability: monthlyRaw,
    isLoading: monthLoading,
    isFetching: monthFetching,
    refetch: refetchMonth,
  } = useMonthlyAvailability(
    { mentorId, month: calMonth + 1, year: calYear, role: "mentor" },
    { enabled: Boolean(mentorId), allowDefaultForMentee: false },
  );

  const monthRows = useMemo(() => {
    if (Array.isArray(monthlyRaw)) return monthlyRaw as unknown[];
    return [];
  }, [monthlyRaw]);

  const createRecurring = useCreateRecurringAvailability({
    onSuccess: (msg) => {
      showToast(msg ?? "Recurring availability saved.", "success");
      setSavedBaseline({
        meetingDuration,
        minNoticeHours,
        maxBookingsPerDay,
        preferredPlatform,
        horizonDays,
        weekPatternKey: weekPatternKeyFromRows(weekRows),
      });
      onAvailabilitySaved?.();
    },
    onError: onMutationError,
  });

  const patchDay = usePatchAvailabilityDay({
    onSuccess: (msg) => {
      showToast(msg ?? "Day updated.", "success");
      closeDayModal();
      onAvailabilitySaved?.();
    },
    onError: onMutationError,
  });

  const markUnavailable = useMarkAvailabilityDayUnavailable({
    onSuccess: () => {
      showToast("No meetings can be booked on this day.", "success");
      setPendingBlockYmd(null);
      setBlockSelectionMode(false);
      closeDayModal();
      onAvailabilitySaved?.();
    },
    onError: onMutationError,
  });

  const markAvailable = useMarkAvailabilityDayAvailable({
    onSuccess: (msg) => {
      showToast(msg ?? "Day reopened for booking.", "success");
      closeDayModal();
      onAvailabilitySaved?.();
    },
    onError: onMutationError,
  });

  const hydrateFromDoc = useCallback(() => {
    const blob = digAvailabilityBlob(weeklyDoc);
    const baseline = baselineFromAvailabilityBlob(blob);

    setMeetingDuration(baseline.meetingDuration);
    setMinNoticeHours(baseline.minNoticeHours);
    setMaxBookingsPerDay(baseline.maxBookingsPerDay);
    setPreferredPlatform(baseline.preferredPlatform);
    setHorizonDays(baseline.horizonDays);
    setWeekRows(weekRowsFromAvailabilityBlob(blob));
    setSavedBaseline(baseline);
  }, [weeklyDoc]);

  useEffect(() => {
    if (docLoading) return;
    hydrateFromDoc();
  }, [docLoading, hydrateFromDoc]);

  const closeDayModal = () => {
    setDayModalYmd(null);
    setDayModalSlots([]);
  };

  const openDayModal = (ymd: string) => {
    setDayModalYmd(ymd);
    const row = findAvailabilityRowForYmd(monthRows, ymd);
    const c = classifyDayOccurrence(row);
    setDayModalSlots(c.unavailable ? [] : c.slots.map((s) => ({ ...s })));
  };

  const validateSlotsForSave = (
    slots: AppointmentAvailabilityTimeSlot[],
    context: string,
  ): boolean => {
    const overlap = findOverlappingSlotPair(slots);
    if (overlap) {
      showToast(`${context}: time windows overlap. Adjust before saving.`, "error");
      return false;
    }
    for (const slot of slots) {
      if (slotSpanMinutes(slot) < meetingDuration) {
        showToast(
          `Each window must span at least ${meetingDuration} minutes.`,
          "error",
        );
        return false;
      }
    }
    return true;
  };

  const submitRecurring = async () => {
    const templateWeeklySlots = buildTemplateWeeklySlotsFromRows({ rows: weekRows });
    if (templateWeeklySlots.length === 0) {
      showToast("Enable at least one weekday and add at least one time window.", "error");
      return;
    }
    for (const d of templateWeeklySlots) {
      const overlap = findOverlappingSlotPair(d.slots);
      if (overlap) {
        const di = new Date(`${d.date}T12:00:00Z`).getUTCDay();
        showToast(
          `Overlapping slots on ${WEEKDAY_LABELS_SUN0[di]} template. Adjust times.`,
          "error",
        );
        return;
      }
      for (const slot of d.slots) {
        if (slotSpanMinutes(slot) < meetingDuration) {
          showToast(
            `Each window must span at least ${meetingDuration} minutes.`,
            "error",
          );
          return;
        }
      }
    }

    await createRecurring.mutateAsync({
      mentorId,
      templateWeeklySlots,
      horizonDays: Math.min(120, Math.max(7, horizonDays)),
      meetingDuration,
      minSchedulingNoticeHours: minNoticeHours,
      maxBookingsPerDay,
      preferredPlatform,
    });
  };

  const saveRecurring = () => {
    void submitRecurring();
  };

  const onRefresh = useCallback(async () => {
    await Promise.all([refetchDoc(), refetchMonth()]);
    queryClient.invalidateQueries({ queryKey: ["monthly-availability"] });
  }, [refetchDoc, refetchMonth, queryClient]);

  const selectedDayRow = useMemo(() => {
    if (!dayModalYmd) return undefined;
    return findAvailabilityRowForYmd(monthRows, dayModalYmd);
  }, [dayModalYmd, monthRows]);

  const selectedDayClass = useMemo(
    () => classifyDayOccurrence(selectedDayRow),
    [selectedDayRow],
  );

  const recurringBusy = createRecurring.isPending;
  const dayBusy =
    patchDay.isPending || markAvailable.isPending || markUnavailable.isPending;

  const routineHasAny = weekRows.some((r) => r.enabled && r.slots.length > 0);

  const currentWeekPatternKey = useMemo(
    () => weekPatternKeyFromRows(weekRows),
    [weekRows],
  );

  const scheduleDirty = useMemo(() => {
    if (!savedBaseline) return false;
    return (
      currentWeekPatternKey !== savedBaseline.weekPatternKey ||
      horizonDays !== savedBaseline.horizonDays
    );
  }, [savedBaseline, currentWeekPatternKey, horizonDays]);

  const canSaveRecurring =
    scheduleDirty && !recurringBusy && !docLoading;

  if (!mentorId) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Sign in to manage your availability.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={monthFetching && !monthLoading}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Your availability</Text>
          <Text style={styles.introSub}>
            Set a repeating weekly pattern, then tap calendar dates for one-off changes.
          </Text>
        </View>

        <View style={styles.googleCalendarCard}>
          <GoogleCalendarConnectButton
            variant="dark"
            onConnectionSynced={() => {
              void onRefresh();
            }}
          />
          <Text style={styles.googleCalendarHint}>
            Link Google Calendar to sync busy times and bookings.
          </Text>
        </View>

        {(docLoading || monthLoading) && !routineHasAny ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading availability…</Text>
          </View>
        ) : null}

        {/* Step 1 — Weekly pattern */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Step 1 — Weekly pattern</Text>
          <Text style={styles.sectionSub}>
            Repeats every week using UTC weekday anchors (same as web).
          </Text>

          {!routineHasAny ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No weekly pattern yet</Text>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  setWeekRows((prev) =>
                    prev.map((w) =>
                      w.dayIndexUtcSunday0 >= 1 && w.dayIndexUtcSunday0 <= 5
                        ? {
                            ...w,
                            enabled: true,
                            slots: [{ ...DEFAULT_SLOT_WINDOW }],
                          }
                        : w,
                    ),
                  );
                }}
              >
                <Text style={styles.primaryBtnText}>Add Mon–Fri default</Text>
              </Pressable>
            </View>
          ) : null}

          {weekRows.map((row) => {
            const expanded = expandedDay === row.dayIndexUtcSunday0;
            const utcRef = utcReferenceYmdForWeekday(row.dayIndexUtcSunday0);
            return (
              <View key={row.dayIndexUtcSunday0} style={styles.dayCard}>
                <Pressable
                  style={styles.dayHeader}
                  onPress={() =>
                    setExpandedDay(expanded ? null : row.dayIndexUtcSunday0)
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayLabel}>{row.label}</Text>
                    <Text style={styles.dayMeta} numberOfLines={1}>
                      {row.enabled && row.slots.length > 0
                        ? row.slots
                            .map((s) => `${s.startTime} ${s.startPeriod}–${s.endTime} ${s.endPeriod}`)
                            .join(" · ")
                        : "Off"}
                    </Text>
                    <Text style={styles.utcHint}>UTC ref: {utcRef}</Text>
                  </View>
                  <Switch
                    value={row.enabled}
                    onValueChange={(v) =>
                      setWeekRows((prev) =>
                        prev.map((w) =>
                          w.dayIndexUtcSunday0 === row.dayIndexUtcSunday0
                            ? {
                                ...w,
                                enabled: v,
                                slots:
                                  v && w.slots.length === 0
                                    ? [{ ...DEFAULT_SLOT_WINDOW }]
                                    : v
                                      ? w.slots
                                      : [],
                              }
                            : w,
                        ),
                      )
                    }
                  />
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="rgba(255,255,255,0.85)"
                  />
                </Pressable>

                {expanded && row.enabled ? (
                  <View style={styles.dayBody}>
                    {row.slots.map((slot, idx) => (
                      <SlotRowEditor
                        key={`${row.dayIndexUtcSunday0}-${idx}`}
                        slot={slot}
                        onPatch={(patch) =>
                          setWeekRows((prev) =>
                            prev.map((w) => {
                              if (w.dayIndexUtcSunday0 !== row.dayIndexUtcSunday0)
                                return w;
                              const nextSlots = [...w.slots];
                              nextSlots[idx] = { ...nextSlots[idx], ...patch };
                              return { ...w, slots: nextSlots };
                            }),
                          )
                        }
                        onRemove={() =>
                          setWeekRows((prev) =>
                            prev.map((w) =>
                              w.dayIndexUtcSunday0 === row.dayIndexUtcSunday0
                                ? {
                                    ...w,
                                    slots: w.slots.filter((_, j) => j !== idx),
                                    enabled: w.slots.length > 1,
                                  }
                                : w,
                            ),
                          )
                        }
                      />
                    ))}
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() =>
                        setWeekRows((prev) =>
                          prev.map((w) =>
                            w.dayIndexUtcSunday0 === row.dayIndexUtcSunday0
                              ? {
                                  ...w,
                                  enabled: true,
                                  slots: [...w.slots, { ...DEFAULT_SLOT_WINDOW }],
                                }
                              : w,
                          ),
                        )
                      }
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.secondaryBtnText}>Add window</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Step 2 — Booking rules (read-only) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Step 2 — Booking rules</Text>
          <Text style={styles.sectionSub}>
            How far ahead people can book, and how soon before a meeting they must schedule.
          </Text>

          <View style={styles.rulesInfoBox}>
            <Ionicons name="information-circle-outline" size={18} color="rgba(142,197,235,0.95)" />
            <Text style={styles.rulesInfoText}>
              These settings apply to every meeting booked on your calendar. You can still
              change your weekly hours in Step 1 and adjust individual days in Step 3.
            </Text>
          </View>

          <View style={styles.ruleExplainCard}>
            <View style={styles.ruleExplainHeader}>
              <View style={styles.ruleIconWrap}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.ruleExplainHeaderText}>
                <Text style={styles.ruleExplainTitle}>Minimum notice</Text>
                <Text style={styles.ruleExplainValue}>{formatMinNoticeLabel(minNoticeHours)}</Text>
              </View>
            </View>
            <Text style={styles.ruleExplainBody}>
              Bookings must be made {minNoticeBookingPhrase(minNoticeHours)}. Time slots inside
              that window are hidden so last-minute meetings cannot be scheduled.
            </Text>
          </View>

          <View style={styles.ruleExplainCard}>
            <View style={styles.ruleExplainHeader}>
              <View style={styles.ruleIconWrap}>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.ruleExplainHeaderText}>
                <Text style={styles.ruleExplainTitle}>How far ahead people can book</Text>
                <Text style={styles.ruleExplainValue}>{horizonDays} days</Text>
              </View>
            </View>
            <Text style={styles.ruleExplainBody}>
              Open dates only show through the next {horizonDays} days. After that, your calendar
              will not offer new bookings until those dates move inside the window.
            </Text>
          </View>

          <Pressable
            style={[
              styles.primaryBtn,
              (!canSaveRecurring || recurringBusy) && styles.btnDisabled,
            ]}
            disabled={!canSaveRecurring}
            onPress={saveRecurring}
          >
            {createRecurring.isPending ? (
              <ActivityIndicator color="#0E2A47" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Save repeating schedule</Text>
            )}
          </Pressable>
        </View>

        {/* Step 3 — Calendar */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Step 3 — Calendar</Text>
          <Text style={styles.sectionSub}>
            Tap a future day to customize or block it.
          </Text>

          <View style={styles.calActions}>
            {blockSelectionMode ? (
              <Text style={styles.blockHint}>Tap a future day to block</Text>
            ) : null}
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                setBlockSelectionMode((v) => !v);
                setPendingBlockYmd(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>
                {blockSelectionMode ? "Cancel block" : "Block a day"}
              </Text>
            </Pressable>
          </View>

          <ScheduleMonthCalendar
            year={calYear}
            month={calMonth}
            onMonthChange={(y, m) => {
              setCalYear(y);
              setCalMonth(m);
            }}
            disablePastDates
            loading={monthFetching}
            onSelectDay={(ymd) => {
              if (blockSelectionMode) {
                setPendingBlockYmd(ymd);
              } else {
                openDayModal(ymd);
              }
            }}
            getDayVariant={(ymd, { isPast, isToday }) => {
              if (isPast) return "past";
              if (isToday) return "today";
              const c = classifyDayOccurrence(findAvailabilityRowForYmd(monthRows, ymd));
              if (c.unavailable) return "blocked";
              if (c.slots.length > 0) return "open";
              return "default";
            }}
            getDayBadge={(ymd) => {
              const c = classifyDayOccurrence(findAvailabilityRowForYmd(monthRows, ymd));
              if (c.unavailable) return "Off";
              if (c.slots.length > 0) return String(c.slots.length);
              return "Tap";
            }}
          />
        </View>
      </ScrollView>

      {/* Block day confirm */}
      <Modal visible={Boolean(pendingBlockYmd)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Block this day?</Text>
            <Text style={styles.confirmBody}>
              {pendingBlockYmd
                ? `No one can book on ${formatYmdHeading(pendingBlockYmd)}.`
                : ""}
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => setPendingBlockYmd(null)}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.primaryBtn}
                disabled={markUnavailable.isPending}
                onPress={() => {
                  if (!pendingBlockYmd) return;
                  markUnavailable.mutate({
                    mentorId,
                    dateYmd: pendingBlockYmd,
                  });
                }}
              >
                <Text style={styles.primaryBtnText}>Block day</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Day modal — bottom sheet with safe-area footer */}
      <Modal
        visible={Boolean(dayModalYmd)}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={closeDayModal}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeDayModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[
              styles.daySheetAvoid,
              { width: daySheetWidth, maxHeight: daySheetMaxHeight },
            ]}
          >
            <Pressable
              style={styles.dayModalSheet}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.daySheetHandle} />

              <View style={styles.dayModalHeader}>
                <View style={styles.dayModalHeaderText}>
                  <Text style={styles.dayModalTitle}>Custom availability</Text>
                  {dayModalYmd ? (
                    <Text style={styles.dayModalDate}>{formatYmdHeading(dayModalYmd)}</Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={closeDayModal}
                  disabled={dayBusy}
                  style={styles.dayModalCloseBtn}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              <ScrollView
                style={styles.dayModalScroll}
                contentContainerStyle={styles.dayModalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {selectedDayClass.unavailable && dayModalSlots.length === 0 ? (
                  <Text style={styles.sectionSub}>
                    This day is blocked. Add meeting hours below and save to reopen.
                  </Text>
                ) : (
                  <Text style={styles.sectionSub}>
                    Changes apply to this date only, not your weekly pattern.
                  </Text>
                )}

                {dayModalSlots.map((slot, idx) => (
                  <SlotRowEditor
                    key={idx}
                    slot={slot}
                    onPatch={(patch) =>
                      setDayModalSlots((prev) =>
                        prev.map((s, j) => (j === idx ? { ...s, ...patch } : s)),
                      )
                    }
                    onRemove={() =>
                      setDayModalSlots((prev) => prev.filter((_, j) => j !== idx))
                    }
                  />
                ))}

                <Pressable
                  style={[styles.secondaryBtn, styles.dayModalAddBtn]}
                  onPress={() =>
                    setDayModalSlots((prev) => [...prev, { ...DEFAULT_SLOT_WINDOW }])
                  }
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.secondaryBtnText}>Add window</Text>
                </Pressable>
              </ScrollView>

              <View
                style={[
                  styles.dayModalFooter,
                  { paddingBottom: Math.max(insets.bottom, 16) },
                ]}
              >
                {selectedDayClass.unavailable ? (
                  <Pressable
                    style={[styles.secondaryBtn, styles.dayModalFooterBtn]}
                    disabled={dayBusy}
                    onPress={() => {
                      if (!dayModalYmd || dayModalSlots.length === 0) {
                        showToast("Add at least one time window.", "error");
                        return;
                      }
                      if (!validateSlotsForSave(dayModalSlots, "Day")) return;
                      markAvailable.mutate({
                        mentorId,
                        body: { date: dayModalYmd, slots: dayModalSlots },
                      });
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Open for booking</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.secondaryBtn, styles.dayModalFooterBtn]}
                    disabled={dayBusy}
                    onPress={() => {
                      if (!dayModalYmd) return;
                      Alert.alert(
                        "Block entire day?",
                        "Pastors will not be able to book on this date.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Block",
                            style: "destructive",
                            onPress: () =>
                              markUnavailable.mutate({
                                mentorId,
                                dateYmd: dayModalYmd,
                              }),
                          },
                        ],
                      );
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>Block entire day</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.primaryBtn, styles.dayModalFooterBtn]}
                  disabled={dayBusy || !dayModalYmd}
                  onPress={() => {
                    if (!dayModalYmd) return;
                    if (dayModalSlots.length === 0) {
                      showToast("Add at least one time window or block the day.", "error");
                      return;
                    }
                    if (!validateSlotsForSave(dayModalSlots, "Day")) return;
                    const body: PatchMentorAvailabilityDayPayload = {
                      date: dayModalYmd,
                      slots: dayModalSlots,
                      meetingDuration,
                      minSchedulingNoticeHours: minNoticeHours,
                      maxBookingsPerDay,
                      preferredPlatform,
                    };
                    patchDay.mutate({ mentorId, body });
                  }}
                >
                  {patchDay.isPending ? (
                    <ActivityIndicator color="#0E2A47" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Save this day</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32, paddingHorizontal: 16, gap: 14 },
  introCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  introTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  introSub: {
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  googleCalendarCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 8,
  },
  googleCalendarHint: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
  loadingBlock: { alignItems: "center", paddingVertical: 24, gap: 10 },
  loadingText: { color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 10,
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  sectionSub: { color: "rgba(255,255,255,0.68)", fontSize: 12.5, lineHeight: 17 },
  emptyWrap: { padding: 24, alignItems: "center" },
  emptyText: { color: "rgba(255,255,255,0.75)", textAlign: "center" },
  emptyState: { alignItems: "center", gap: 10, paddingVertical: 8 },
  emptyTitle: { color: "rgba(255,255,255,0.85)", fontWeight: "700" },
  dayCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    marginTop: 4,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  dayLabel: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  dayMeta: { color: "rgba(255,255,255,0.65)", fontSize: 11.5, marginTop: 2 },
  utcHint: { color: "rgba(142,197,235,0.75)", fontSize: 10, marginTop: 2 },
  dayBody: { padding: 12, paddingTop: 4 },
  fieldLabel: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    fontSize: 12,
    marginTop: 6,
  },
  rulesInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(142,197,235,0.12)",
    borderWidth: 1,
    borderColor: "rgba(142,197,235,0.28)",
  },
  rulesInfoText: {
    flex: 1,
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  ruleExplainCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  ruleExplainHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ruleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  ruleExplainHeaderText: { flex: 1, minWidth: 0 },
  ruleExplainTitle: {
    color: "rgba(255,255,255,0.72)",
    fontWeight: "700",
    fontSize: 12,
  },
  ruleExplainValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  ruleExplainBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    paddingLeft: 52,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  chipActive: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
  chipText: { color: "rgba(255,255,255,0.88)", fontWeight: "800", fontSize: 12 },
  chipTextActive: { color: "#0E2A47" },
  clearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  clearLabel: { color: "rgba(255,255,255,0.85)", fontWeight: "700", flex: 1 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primaryBtnText: { color: "#0E2A47", fontWeight: "900", fontSize: 14 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  secondaryBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  btnDisabled: { opacity: 0.55 },
  calActions: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  blockHint: { color: "#fdecc8", fontSize: 12, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 18,
  },
  confirmCard: {
    backgroundColor: "#0E2A47",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  confirmTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  confirmBody: { color: "rgba(255,255,255,0.75)", marginTop: 8, lineHeight: 20 },
  confirmActions: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  daySheetAvoid: {
    alignSelf: "center",
    width: "100%",
  },
  dayModalSheet: {
    backgroundColor: "#041f35",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
    maxHeight: "100%",
  },
  daySheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginTop: 10,
    marginBottom: 4,
  },
  dayModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  dayModalHeaderText: { flex: 1, minWidth: 0 },
  dayModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dayModalTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  dayModalDate: { color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: 13 },
  dayModalScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  dayModalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  dayModalAddBtn: {
    alignSelf: "stretch",
    justifyContent: "center",
    marginTop: 4,
  },
  dayModalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#041f35",
  },
  dayModalFooterBtn: {
    alignSelf: "stretch",
    width: "100%",
    justifyContent: "center",
  },
});
