import { appointmentService } from "@/services/appointments.service";
import {
    MonthlyAvailabilityDay,
    SetAvailabilityPayload,
    SetAvailabilityResponse,
    TimeSlot,
    WeeklyAvailability,
} from "@/types/appointment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

/** YYYY-MM-DD from API values (plain date or ISO datetime). */
export function normalizeAvailabilityDateString(
    d: string | undefined | null,
): string {
    if (!d || typeof d !== "string") return "";
    const head = d.includes("T") ? d.split("T")[0] : d;
    return head.length >= 10 ? head.slice(0, 10) : "";
}

/** Parse a calendar `YYYY-MM-DD` without UTC shift (unlike `new Date("YYYY-MM-DD")`). */
export function calendarYearMonthFromYmd(ymd: string): {
    year: number;
    month: number;
} | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
    if (!m) return null;
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    if (!year || month < 1 || month > 12) return null;
    return { year, month };
}

function calendarDateInMonth(
    dateStr: string,
    month: number,
    year: number,
): boolean {
    const n = normalizeAvailabilityDateString(dateStr);
    if (n.length < 10) return false;
    const y = parseInt(n.slice(0, 4), 10);
    const m = parseInt(n.slice(5, 7), 10);
    return y === year && m === month;
}

export function slotsFromWeeklyOrMonthlyDay(day: {
    rawSlots?: TimeSlot[];
    slots?: TimeSlot[];
}): TimeSlot[] {
    const raw = day.rawSlots ?? day.slots;
    return Array.isArray(raw) ? raw : [];
}

function dayOfWeekFromYmd(key: string, wsDay: number | undefined): number {
    if (typeof wsDay === "number" && !Number.isNaN(wsDay)) return wsDay;
    return new Date(`${key}T12:00:00`).getDay();
}

function pickRicherAvailabilityDay(
    monthly: MonthlyAvailabilityDay | undefined,
    weekly: MonthlyAvailabilityDay | undefined,
): MonthlyAvailabilityDay | undefined {
    const mc = monthly?.slots?.length ?? 0;
    const wc = weekly?.slots?.length ?? 0;
    // Monthly `/month` often returns one wide window for near-term days; weekly
    // keeps the real saved hourly blocks. Prefer the side with more segments.
    if (wc > mc) return weekly;
    if (mc > wc) return monthly;
    if (wc > 0) return weekly;
    return monthly;
}

/**
 * Merge monthly `/month` with GET weekly `weeklySlots`.
 * Near-term days sometimes differ: monthly may collapse to one interval while
 * weekly has the saved slots — we pick the richer (more slots) representation,
 * with ties favoring weekly (source of what the mentor saved).
 */
export function mergeMonthlyAvailabilityWithWeeklySlotDates(
    month: number,
    year: number,
    monthly: MonthlyAvailabilityDay[] | null | undefined,
    weeklySlots: any[] | null | undefined,
): MonthlyAvailabilityDay[] {
    const monthlyByDate = new Map<string, MonthlyAvailabilityDay>();
    for (const day of monthly ?? []) {
        const key = normalizeAvailabilityDateString(day.date);
        if (!key) continue;
        const slots = Array.isArray(day.slots) ? day.slots : [];
        const normalized: MonthlyAvailabilityDay = {
            ...day,
            date: key,
            slots,
            day: dayOfWeekFromYmd(key, day.day),
        };
        const prev = monthlyByDate.get(key);
        if (!prev || slots.length > (prev.slots?.length ?? 0)) {
            monthlyByDate.set(key, normalized);
        }
    }

    const weeklyByDate = new Map<string, MonthlyAvailabilityDay>();
    for (const ws of weeklySlots ?? []) {
        const key = normalizeAvailabilityDateString(ws?.date);
        if (!key) continue;
        const slots = slotsFromWeeklyOrMonthlyDay(ws);
        if (slots.length === 0) continue;
        const dow = dayOfWeekFromYmd(key, ws?.day);
        const normalized: MonthlyAvailabilityDay = {
            date: key,
            day: dow,
            slots,
        };
        const prev = weeklyByDate.get(key);
        if (!prev || slots.length > (prev.slots?.length ?? 0)) {
            weeklyByDate.set(key, normalized);
        }
    }

    const keys = new Set<string>([
        ...monthlyByDate.keys(),
        ...weeklyByDate.keys(),
    ]);
    const out: MonthlyAvailabilityDay[] = [];

    for (const key of keys) {
        if (!calendarDateInMonth(key, month, year)) continue;
        const chosen = pickRicherAvailabilityDay(
            monthlyByDate.get(key),
            weeklyByDate.get(key),
        );
        if (chosen && (chosen.slots?.length ?? 0) > 0) {
            out.push(chosen);
        }
    }

    return out.sort((a, b) => a.date.localeCompare(b.date));
}

// Default time slots for users who don't set their own availability (e.g., Pastors)
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  {
    startTime: "09:00",
    startPeriod: "AM",
    endTime: "10:00",
    endPeriod: "AM",
    _id: "default-1",
  },
  {
    startTime: "10:00",
    startPeriod: "AM",
    endTime: "11:00",
    endPeriod: "AM",
    _id: "default-2",
  },
  {
    startTime: "11:00",
    startPeriod: "AM",
    endTime: "12:00",
    endPeriod: "PM",
    _id: "default-3",
  },
  {
    startTime: "01:00",
    startPeriod: "PM",
    endTime: "02:00",
    endPeriod: "PM",
    _id: "default-4",
  },
  {
    startTime: "02:00",
    startPeriod: "PM",
    endTime: "03:00",
    endPeriod: "PM",
    _id: "default-5",
  },
  {
    startTime: "03:00",
    startPeriod: "PM",
    endTime: "04:00",
    endPeriod: "PM",
    _id: "default-6",
  },
  {
    startTime: "04:00",
    startPeriod: "PM",
    endTime: "05:00",
    endPeriod: "PM",
    _id: "default-7",
  },
];

/**
 * Generate default monthly availability (Mon-Fri, 9AM-5PM)
 */
export const generateDefaultMonthlyAvailability = (
  month: number,
  year: number,
): MonthlyAvailabilityDay[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const availability: MonthlyAvailabilityDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // Monday to Friday (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      availability.push({
        date: dateString,
        day: dayOfWeek,
        slots: DEFAULT_TIME_SLOTS,
      });
    }
  }

  return availability;
};

/**
 * Generate default weekly availability (Mon-Fri, 9AM-5PM)
 */
export const generateDefaultWeeklyAvailability = (
  mentorId: string,
): WeeklyAvailability => {
  return {
    mentorId,
    weeklySlots: [1, 2, 3, 4, 5].map((day) => ({
      day,
      date: new Date().toISOString(),
      rawSlots: DEFAULT_TIME_SLOTS,
    })),
    maxBookingsPerDay: 5,
    meetingDuration: 60,
    minSchedulingNoticeHours: 24,
  };
};

interface UseWeeklyAvailabilityOptions {
  enabled?: boolean;
  role?: string;
}

// Helper function to format time slot
export const formatTimeSlot = (slot: TimeSlot): string => {
  return `${slot.startTime} ${slot.startPeriod} - ${slot.endTime} ${slot.endPeriod}`;
};

// Helper function to convert time slot to 24-hour format for comparison
export const convertTo24Hour = (time: string, period: "AM" | "PM"): number => {
  let hour = parseInt(time);
  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }
  return hour;
};

// Helper to get day name
export const getDayName = (dayNumber: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber];
};

/**
 * Fetches availability via GET /appointments/availability/{mentorId} only.
 * Does NOT call the monthly API (/appointments/availability/{mentorId}/month).
 */
export const useWeeklyAvailability = (
  mentorId: string | null,
  options?: UseWeeklyAvailabilityOptions,
) => {
  const query = useQuery({
    queryKey: ["weekly-availability", mentorId],
    queryFn: async () => {
      if (!mentorId) {
        throw new Error("mentorId is required for weekly availability");
      }

      const data = await appointmentService.getWeeklyAvailability(mentorId!);

      // If it's a pastor/mentee and they have no availability set, return defaults
      const isMentee =
        options?.role?.toLowerCase() === "pastor" ||
        options?.role?.toLowerCase() === "mentee";
      if (
        isMentee &&
        (!data || !data.weeklySlots || data.weeklySlots.length === 0)
      ) {
        return generateDefaultWeeklyAvailability(mentorId!);
      }
      return data;
    },
    staleTime: 2000, // 2 seconds
    retry: 2,
    enabled: Boolean(mentorId) && options?.enabled !== false,
  });

  const availability = query.data;
  const weeklySlots = availability?.weeklySlots ?? [];

  return {
    ...query,
    availability,
    weeklySlots,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

interface UseMonthlyAvailabilityParams {
  mentorId: string | null;
  month: number;
  year: number;
  role?: string;
}

interface UseMonthlyAvailabilityOptions {
  enabled?: boolean;
  /**
   * When true (default), pastors/mentees with no saved availability get
   * generated default monthly availability (Mon–Fri, 9AM–5PM).
   *
   * IMPORTANT: For scheduling flows, set this to false so the UI doesn't show
   * "fake" availability that the backend will reject.
   */
  allowDefaultForMentee?: boolean;
  /** Override React Query staleTime for this query (e.g. scheduling UI month paging). */
  staleTimeMs?: number;
}

export const useMonthlyAvailability = (
  params: UseMonthlyAvailabilityParams,
  options?: UseMonthlyAvailabilityOptions,
) => {
  const { mentorId, month, year, role } = params;

  const query = useQuery({
    queryKey: ["monthly-availability", mentorId, month, year],
    queryFn: async () => {
      if (!mentorId) {
        throw new Error("mentorId is required for monthly availability");
      }

      const data = await appointmentService.getMonthlyAvailability(
        mentorId!,
        month,
        year,
      );

      // If it's a pastor/mentee and they have no availability set, return defaults
      const isMentee =
        role?.toLowerCase() === "pastor" || role?.toLowerCase() === "mentee";
      const allowDefaultForMentee = options?.allowDefaultForMentee ?? true;
      if (allowDefaultForMentee && isMentee && (!data || data.length === 0)) {
        return generateDefaultMonthlyAvailability(month, year);
      }
      return data;
    },
    staleTime: options?.staleTimeMs ?? 2000,
    retry: 2,
    enabled: Boolean(mentorId) && options?.enabled !== false,
  });

  return {
    ...query,
    availability: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
  };
};

// Helper hook to get current month availability
export const useCurrentMonthAvailability = (
  mentorId: string | null,
  options?: UseMonthlyAvailabilityOptions,
) => {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const year = currentDate.getFullYear();

  return useMonthlyAvailability({ mentorId, month, year }, options);
};

// Helper hook to navigate between months
export const useAvailabilityNavigator = (
  mentorId: string | null,
  role?: string,
) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const { availability, isLoading, isError } = useMonthlyAvailability({
    mentorId,
    month,
    year,
    role,
  });

  const goToNextMonth = () => {
    setSelectedDate((prevDate) => {
      const nextMonth = new Date(prevDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    });
  };

  const goToPreviousMonth = () => {
    setSelectedDate((prevDate) => {
      const prevMonth = new Date(prevDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return prevMonth;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const canGoToNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    // Optional: Add logic to limit how far in the future users can go
    return true;
  };

  const canGoToPreviousMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfSelectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    );
    return firstDayOfSelectedMonth >= today;
  };

  return {
    availability,
    isLoading,
    isError,
    selectedDate,
    month,
    year,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    canGoToNextMonth,
    canGoToPreviousMonth,
  };
};

interface UseSetAvailabilityOptions {
  onSuccess?: (data: SetAvailabilityResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for setting/updating mentor availability
 */
export const useSetAvailability = (options?: UseSetAvailabilityOptions) => {
  const { onSuccess, onError } = options || {};
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SetAvailabilityPayload) =>
      appointmentService.setAvailability(payload),
    onSuccess: (data) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["weekly-availability"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-availability"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error("Failed to set availability:", error);
      onError?.(error);
    },
  });

  return {
    setAvailability: mutation.mutate,
    setAvailabilityAsync: mutation.mutateAsync,
    isSettingAvailability: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
