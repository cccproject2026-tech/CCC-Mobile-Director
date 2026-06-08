import type { AppointmentSlotPeriod } from "@/types/appointment.types";

export const DEFAULT_SLOT_WINDOW = {
  startTime: "9:00",
  startPeriod: "AM" as AppointmentSlotPeriod,
  endTime: "12:00",
  endPeriod: "PM" as AppointmentSlotPeriod,
};

export const PLATFORM_OPTIONS = [
  { label: "Zoom", value: "zoom" },
  { label: "Google Meet (soon)", value: "google-meet", disabled: true },
  { label: "Microsoft Teams (soon)", value: "teams", disabled: true },
  { label: "Phone (soon)", value: "phone", disabled: true },
  { label: "In person (soon)", value: "in-person", disabled: true },
] as const;

export const MEETING_DURATION_OPTIONS = [30, 60] as const;

export const MIN_NOTICE_OPTIONS = [
  { label: "Same day", hours: 0 },
  { label: "1 hour", hours: 1 },
  { label: "2 hours", hours: 2 },
  { label: "4 hours", hours: 4 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
  { label: "48 hours", hours: 48 },
  { label: "72 hours", hours: 72 },
  { label: "1 week", hours: 168 },
] as const;

export const MAX_BOOKINGS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const HORIZON_PRESETS = [
  { label: "2 weeks", days: 14 },
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "120 days", days: 120 },
] as const;
