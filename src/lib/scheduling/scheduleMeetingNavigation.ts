import type { Href, Router } from "expo-router";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import { safeGoBack } from "@/utils/navigation";

export type ScheduleMeetingMode = "schedule" | "reschedule";

function appointmentsRouteForRole(role: string | undefined): Href {
  const r = String(role ?? "").toLowerCase();
  if (r === "mentor") return "/(mentor)/(tabs)/appointments";
  if (r === "director") return "/(director)/(tabs)/appointments";
  return "/(pastor)/(tabs)/appointments";
}

/** Base path for in-drawer scheduler stacks (pastor / mentor). Director uses root `/schedule-meeting`. */
export function getScheduleMeetingBase(
  drawerContext?: string,
  role?: string,
): string {
  const ctx = String(drawerContext ?? "").toLowerCase();
  const r = String(role ?? "").toLowerCase();
  if (ctx === "mentor" || r === "mentor") return "/(mentor)/schedule-meeting";
  if (ctx === "pastor" || r === "pastor") return "/(pastor)/schedule-meeting";
  return "/schedule-meeting";
}

export type ScheduleFlowParams = {
  drawerContext?: string;
  assessmentId?: string;
  returnTo?: string;
  preserveDraft?: string;
  mode?: ScheduleMeetingMode;
  appointmentId?: string;
};

/** Route params forwarded across person → time → confirm in the scheduler stack. */
export function buildScheduleFlowParams(
  options: ScheduleFlowParams,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (options.drawerContext) params.drawerContext = options.drawerContext;
  if (options.assessmentId) params.assessmentId = options.assessmentId;
  if (options.returnTo) params.returnTo = options.returnTo;
  if (options.preserveDraft) params.preserveDraft = options.preserveDraft;
  if (options.mode) params.mode = options.mode;
  if (options.appointmentId) params.appointmentId = options.appointmentId;
  return params;
}

export function openScheduleMeeting(
  router: Router,
  role: string | undefined,
  options?: {
    mode?: ScheduleMeetingMode;
    personData?: string;
    appointmentId?: string;
    /** Tags the appointment for assessment meeting links. */
    assessmentId?: string;
    /** When set, back from the first scheduler screen restores this href. */
    returnTo?: string;
  },
): void {
  const normalizedRole = String(role ?? "").toLowerCase();
  const mode = options?.mode ?? "schedule";
  const base = getScheduleMeetingBase(undefined, normalizedRole);

  const params = buildScheduleFlowParams({
    mode,
    assessmentId: options?.assessmentId,
    returnTo: options?.returnTo,
    appointmentId: options?.appointmentId,
    ...(normalizedRole === "pastor" || normalizedRole === "mentor"
      ? { drawerContext: normalizedRole }
      : {}),
  });
  if (options?.personData) params.personData = options.personData;

  router.push({
    pathname: `${base}/person`,
    params,
  } as never);
}

/** Back from the first scheduler screen — restore the screen that opened the flow. */
export function leaveScheduleMeetingPersonStep(
  router: Router,
  role: string | undefined,
  returnTo?: string,
): void {
  safeGoBack(router, { fallback: appointmentsRouteForRole(role), returnTo });
  // Reset after leaving so confirm/time screens don't react to an empty draft while still mounted.
  setTimeout(() => useScheduleMeetingStore.getState().reset(), 0);
}

/** Leave the scheduler after booking — appointments list, or assessment guidelines when applicable. */
export function exitScheduleMeetingFlow(
  router: Router,
  role: string | undefined,
  options?: { assessmentId?: string; message?: string },
): void {
  if (options?.assessmentId) {
    router.replace({
      pathname: "/assessments/survey-guidelines",
      params: {
        assessmentId: options.assessmentId,
        ...(options.message ? { message: options.message } : {}),
      },
    } as never);
  } else {
    router.replace(appointmentsRouteForRole(role));
  }
  // Reset after leaving so confirm/time screens don't react to an empty draft while still mounted.
  setTimeout(() => useScheduleMeetingStore.getState().reset(), 0);
}
