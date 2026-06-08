import {
  WEEKDAY_LABELS_SUN0,
  localCalendarYmd,
} from "@/utils/availability/availability-recurring-utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type DayCellVariant =
  | "default"
  | "today"
  | "selected"
  | "open"
  | "blocked"
  | "past";

export type ScheduleMonthCalendarProps = {
  year: number;
  /** 0-indexed (January = 0) */
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay: (ymd: string) => void;
  selectedYmd?: string;
  disablePastDates?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  getDayVariant?: (
    ymd: string,
    ctx: { isPast: boolean; isToday: boolean; isSelected: boolean },
  ) => DayCellVariant | undefined;
  getDayBadge?: (ymd: string) => string | null;
};

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YMD_PARTS_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Accepts YYYY-MM-DD or ISO datetime; returns YYYY-MM-DD or null. */
export function normalizeYmd(value: string | undefined | null): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const head = raw.slice(0, 10);
  return YMD_PATTERN.test(head) ? head : null;
}

function parseYmdParts(ymd: string): { year: string; month: string; day: string } | null {
  const m = YMD_PARTS_PATTERN.exec(ymd);
  if (!m) return null;
  return { year: m[1], month: m[2], day: m[3] };
}

function parseLocalYmd(ymd: string): Date {
  const normalized = normalizeYmd(ymd);
  if (!normalized) return new Date();
  const parts = parseYmdParts(normalized);
  if (!parts) return new Date();
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

function coerceViewYear(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && /^\d{4}$/.test(value.trim())) {
    return Number(value.trim());
  }
  return new Date().getFullYear();
}

function coerceViewMonth(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const m = Math.trunc(value);
    if (m >= 0 && m <= 11) return m;
  }
  return new Date().getMonth();
}

function viewPartsFromYmd(ymd: string): { year: number; month: number } {
  const d = parseLocalYmd(ymd);
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
  };
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Format YYYY-MM-DD (or ISO) for compact UI labels — string-only (no Date/timezone). */
export function formatYmdShortLabel(value: string | undefined | null): string {
  const ymd = normalizeYmd(value);
  if (!ymd) return "";
  const parts = parseYmdParts(ymd);
  if (!parts) return "";
  const monthIndex = Number(parts.month) - 1;
  const day = Number(parts.day);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return "";
  return `${day} ${MONTH_SHORT[monthIndex]} ${parts.year.slice(-2)}`;
}

export function ScheduleMonthCalendar({
  year,
  month,
  onMonthChange,
  onSelectDay,
  selectedYmd = "",
  disablePastDates = false,
  loading = false,
  style,
  getDayVariant,
  getDayBadge,
}: ScheduleMonthCalendarProps) {
  const viewYear = coerceViewYear(year);
  const viewMonth = coerceViewMonth(month);

  const daysInMonth = useMemo(
    () => new Date(viewYear, viewMonth + 1, 0).getDate(),
    [viewYear, viewMonth],
  );
  const firstDow = useMemo(
    () => new Date(viewYear, viewMonth, 1).getDay(),
    [viewYear, viewMonth],
  );
  const todayYmd = useMemo(() => {
    const now = new Date();
    return localCalendarYmd(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const monthLabel = useMemo(() => {
    const labelDate = new Date(viewYear, viewMonth, 1);
    return labelDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) onMonthChange(viewYear - 1, 11);
    else onMonthChange(viewYear, viewMonth - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) onMonthChange(viewYear + 1, 0);
    else onMonthChange(viewYear, viewMonth + 1);
  };

  return (
    <View style={style}>
      <View style={styles.monthNav}>
        <Pressable style={styles.navBtn} onPress={goPrevMonth} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable style={styles.navBtn} onPress={goNextMonth} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#8ec5eb" style={{ marginVertical: 8 }} />
      ) : null}

      <View style={styles.weekHeaderRow}>
        {WEEKDAY_LABELS_SUN0.map((d) => (
          <Text key={d} style={styles.weekHeader}>
            {d.slice(0, 3)}
          </Text>
        ))}
      </View>

      <View style={styles.calGrid}>
        {Array.from({ length: firstDow }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.calCell} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dom = i + 1;
          const ymd = localCalendarYmd(viewYear, viewMonth, dom);
          const isPast =
            new Date(`${ymd}T23:59:59`) < new Date(new Date().toDateString());
          const isTodayCell = ymd === todayYmd;
          const isSelected = Boolean(selectedYmd && ymd === selectedYmd);

          const variant =
            getDayVariant?.(ymd, { isPast, isToday: isTodayCell, isSelected }) ??
            (isPast
              ? "past"
              : isSelected
                ? "selected"
                : isTodayCell
                  ? "today"
                  : "default");

          const badge = getDayBadge?.(ymd) ?? null;
          const disabled = disablePastDates && isPast;

          return (
            <View key={ymd} style={styles.calCell}>
              <Pressable
                disabled={disabled}
                style={[
                  styles.calDay,
                  variant === "past" && styles.calPast,
                  variant === "today" && styles.calToday,
                  variant === "selected" && styles.calSelected,
                  variant === "blocked" && styles.calBlocked,
                  variant === "open" && styles.calOpen,
                ]}
                onPress={() => onSelectDay(ymd)}
              >
                <Text style={styles.calDom}>{dom}</Text>
                {badge ? (
                  <Text
                    style={[
                      styles.calBadge,
                      variant === "blocked" && styles.calBadgeBlocked,
                      variant === "open" && styles.calBadgeOpen,
                    ]}
                    numberOfLines={1}
                  >
                    {badge}
                  </Text>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Month grid — visible month and selection are fully driven by parent props (no hidden state). */
export function ScheduleMonthCalendarFromSelection({
  selectedYmd,
  visibleMonthYmd,
  viewYear: viewYearProp,
  viewMonth: viewMonthProp,
  onSelectDay,
  onMonthChange,
  disablePastDates,
  loading,
  style,
  getDayVariant,
  getDayBadge,
}: Omit<ScheduleMonthCalendarProps, "year" | "month" | "onMonthChange"> & {
  onMonthChange?: (year: number, month: number) => void;
  /** Which month to display; parent updates when user picks a day, taps pill, or swipes months. */
  visibleMonthYmd?: string;
  /** Preferred: explicit calendar month (0-indexed). Avoids snapping back to selected day’s month. */
  viewYear?: number;
  viewMonth?: number;
}) {
  const fallbackAnchor = localCalendarYmd(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const anchorYmd =
    normalizeYmd(visibleMonthYmd) ?? fallbackAnchor;
  const derived = viewPartsFromYmd(anchorYmd);
  const year =
    typeof viewYearProp === "number" && Number.isFinite(viewYearProp)
      ? coerceViewYear(viewYearProp)
      : derived.year;
  const month =
    typeof viewMonthProp === "number" && Number.isFinite(viewMonthProp)
      ? coerceViewMonth(viewMonthProp)
      : derived.month;
  const normalizedSelected = normalizeYmd(selectedYmd) ?? "";

  const handleMonthChange = (y: number, m: number) => {
    const safeYear = coerceViewYear(y);
    const safeMonth = coerceViewMonth(m);
    onMonthChange?.(safeYear, safeMonth);
  };

  return (
    <ScheduleMonthCalendar
      year={year}
      month={month}
      selectedYmd={normalizedSelected}
      onSelectDay={onSelectDay}
      onMonthChange={handleMonthChange}
      disablePastDates={disablePastDates}
      loading={loading}
      style={style}
      getDayVariant={getDayVariant}
      getDayBadge={getDayBadge}
    />
  );
}

/** Default day-variant styling: selected wins; de-emphasize "today" when another day is selected. */
export function appointmentCalendarDayVariant(
  ymd: string,
  ctx: { isPast: boolean; isToday: boolean; isSelected: boolean },
  selectedYmd: string,
  meetingCount = 0,
): DayCellVariant {
  if (ctx.isSelected) return "selected";
  const selected = normalizeYmd(selectedYmd);
  const showTodayRing = ctx.isToday && (!selected || selected === ymd);
  if (showTodayRing) return "today";
  if (meetingCount > 0) return "open";
  return "default";
}

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  navBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  monthLabel: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  weekHeaderRow: { flexDirection: "row", marginTop: 8 },
  weekHeader: {
    flex: 1,
    textAlign: "center",
    color: "rgba(142,197,235,0.9)",
    fontSize: 11,
    fontWeight: "800",
  },
  calGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -3 },
  calCell: { width: "14.28%", aspectRatio: 1, padding: 3 },
  calDay: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  calPast: { opacity: 0.3 },
  calToday: {
    borderColor: "#8ec5eb",
    backgroundColor: "rgba(142,197,235,0.15)",
  },
  calSelected: {
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  calBlocked: {
    borderColor: "rgba(248,113,113,0.45)",
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  calOpen: {
    borderColor: "rgba(52,211,153,0.45)",
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  calDom: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  calBadge: { color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: "700" },
  calBadgeBlocked: { color: "#fecaca" },
  calBadgeOpen: { color: "#a7f3d0" },
});
