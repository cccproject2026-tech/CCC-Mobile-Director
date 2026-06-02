import type { AppointmentPlatform } from "@/types/appointment.types";

export type PlatformOption = {
  id: AppointmentPlatform;
  label: string;
  /** Kept as string to avoid icon library coupling at this layer. */
  iconName?: string;
};

export const SUPPORTED_PLATFORMS: PlatformOption[] = [
  { id: "zoom", label: "Zoom", iconName: "videocam-outline" },
  { id: "google_meet", label: "Google Meet", iconName: "videocam-outline" },
  { id: "teams", label: "Microsoft Teams", iconName: "videocam-outline" },
  { id: "phone", label: "Phone Call", iconName: "call-outline" },
  { id: "in_person", label: "In-Person Meeting", iconName: "people-outline" },
];

const LABEL_TO_PLATFORM: Record<string, AppointmentPlatform> = {
  zoom: "zoom",
  "google meet": "google_meet",
  googlemeet: "google_meet",
  google_meet: "google_meet",
  "google-meet": "google_meet",
  teams: "teams",
  "microsoft teams": "teams",
  phone: "phone",
  "phone call": "phone",
  "in-person": "in_person",
  "in person": "in_person",
  in_person: "in_person",
  "in-person meeting": "in_person",
  "in person meeting": "in_person",
};

export function platformToLabel(platform: AppointmentPlatform): string {
  const hit = SUPPORTED_PLATFORMS.find((p) => p.id === platform);
  return hit?.label ?? platform;
}

export function labelToPlatform(
  value: string | null | undefined,
): AppointmentPlatform {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return LABEL_TO_PLATFORM[normalized] ?? "zoom";
}

export function isSupportedPlatform(value: unknown): value is AppointmentPlatform {
  return (
    value === "zoom" ||
    value === "google_meet" ||
    value === "teams" ||
    value === "phone" ||
    value === "in_person"
  );
}

