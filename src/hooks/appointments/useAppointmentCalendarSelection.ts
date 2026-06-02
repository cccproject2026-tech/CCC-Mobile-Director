import {
  appointmentCalendarDayVariant,
  formatYmdShortLabel,
  normalizeYmd,
} from "@/components/calendar/ScheduleMonthCalendar";
import { localCalendarYmd } from "@/utils/availability/availability-recurring-utils";
import { useCallback, useEffect, useMemo, useState } from "react";

function ymdParts(ymd: string): { year: number; month: number } | null {
  const normalized = normalizeYmd(ymd);
  if (!normalized) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (!Number.isFinite(year) || month < 0 || month > 11) return null;
  return { year, month };
}

function clampViewMonth(month: number): number {
  if (!Number.isFinite(month)) return new Date().getMonth();
  return Math.min(11, Math.max(0, Math.trunc(month)));
}

function clampViewYear(year: number): number {
  if (!Number.isFinite(year)) return new Date().getFullYear();
  return Math.trunc(year);
}

export function useAppointmentCalendarSelection() {
  const today = useMemo(() => {
    const n = new Date();
    return localCalendarYmd(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  const todayParts = useMemo(() => ymdParts(today)!, [today]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear, setViewYear] = useState(todayParts.year);
  const [viewMonth, setViewMonth] = useState(todayParts.month);

  const normalizedSelected = useMemo(
    () => normalizeYmd(selectedDate) ?? today,
    [selectedDate, today],
  );

  // Keep stored YMD canonical so the pill and grid never drift.
  useEffect(() => {
    if (selectedDate !== normalizedSelected) {
      setSelectedDate(normalizedSelected);
    }
  }, [normalizedSelected, selectedDate]);

  const visibleMonthYmd = useMemo(
    () => localCalendarYmd(viewYear, viewMonth, 1),
    [viewMonth, viewYear],
  );

  const selectedDateLabel = useMemo(() => {
    return formatYmdShortLabel(normalizedSelected) || formatYmdShortLabel(today);
  }, [normalizedSelected, today]);

  const formatDisplayDate = useCallback(
    (dateString: string) => formatYmdShortLabel(dateString) || formatYmdShortLabel(today),
    [today],
  );

  const isToday = useCallback(
    (dateString: string) => normalizeYmd(dateString) === today,
    [today],
  );

  const onSelectCalendarDay = useCallback((ymd: string) => {
    const normalized = normalizeYmd(ymd);
    if (!normalized) return;
    setSelectedDate(normalized);
    const parts = ymdParts(normalized);
    if (parts) {
      setViewYear(parts.year);
      setViewMonth(parts.month);
    }
  }, []);

  const onCalendarMonthChange = useCallback((year: number, month: number) => {
    setViewYear(clampViewYear(year));
    setViewMonth(clampViewMonth(month));
  }, []);

  const jumpCalendarToSelected = useCallback(() => {
    const parts = ymdParts(normalizedSelected);
    if (!parts) return;
    setViewYear(parts.year);
    setViewMonth(parts.month);
  }, [normalizedSelected]);

  const dayVariantForMeetings = useCallback(
    (
      ymd: string,
      ctx: { isPast: boolean; isToday: boolean; isSelected: boolean },
      meetingCount: number,
    ) =>
      appointmentCalendarDayVariant(ymd, ctx, normalizedSelected, meetingCount),
    [normalizedSelected],
  );

  return {
    today,
    selectedDate: normalizedSelected,
    selectedDateLabel,
    visibleMonthYmd,
    viewYear,
    viewMonth,
    formatDisplayDate,
    isToday,
    onSelectCalendarDay,
    onCalendarMonthChange,
    jumpCalendarToSelected,
    dayVariantForMeetings,
  };
}
