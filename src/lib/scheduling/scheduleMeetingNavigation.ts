import type { Href, Router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import type { Appointment } from "@/types/appointment.types";
import {
  appointmentToSchedulePerson,
  resolveAppointmentRef,
} from "@/utils/appointments/appointmentContact";
import { platformToLabel } from "@/utils/appointments/platform";
import { getReturnToParam, normalizeReturnToHref, parseStringHref } from "@/utils/navigation";

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
  /** Reschedule flows skip the person picker entirely. */
  skipPersonPicker?: string;
};

/** Normalize expo-router param values (string | string[]). */
export function scheduleParamString(
  value: string | string[] | undefined | null,
): string | undefined {
  if (value == null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = String(raw ?? "").trim();
  return trimmed || undefined;
}

export function isRescheduleMeetingFlow(
  params: {
    mode?: string | string[];
    appointmentId?: string | string[];
    skipPersonPicker?: string | string[];
  },
  draft?: { mode?: ScheduleMeetingMode; appointmentId?: string },
): boolean {
  if (scheduleParamString(params.skipPersonPicker) === "1") return true;
  if (scheduleParamString(params.mode) === "reschedule") return true;
  if (draft?.mode === "reschedule") return true;
  if (scheduleParamString(params.appointmentId)) return true;
  if (draft?.appointmentId) return true;
  return false;
}

/** Handle back inside the schedule-meeting stack (header + hardware back). */
export function handleScheduleMeetingStackBack(
  router: Router,
  pathname: string,
  role: string | undefined,
  searchParams?: Record<string, string | string[] | undefined>,
): boolean {
  if (!pathname.includes("schedule-meeting")) return false;

  const draft = useScheduleMeetingStore.getState().draft;
  const returnTo = getReturnToParam(searchParams ?? {});
  const drawerContext = scheduleParamString(searchParams?.drawerContext);
  const scheduleBase = getScheduleMeetingBase(drawerContext, role);
  const isReschedule = isRescheduleMeetingFlow(searchParams ?? {}, draft);
  const appointmentIdParam =
    scheduleParamString(searchParams?.appointmentId) ?? draft.appointmentId;
  const flowParams = buildScheduleFlowParams({
    drawerContext,
    assessmentId: scheduleParamString(searchParams?.assessmentId),
    returnTo,
    mode: isReschedule ? "reschedule" : "schedule",
    appointmentId: appointmentIdParam,
    ...(isReschedule ? { skipPersonPicker: "1" } : {}),
    preserveDraft: "1",
  });

  if (pathname.endsWith("/confirm")) {
    backFromScheduleMeetingConfirm(router, { scheduleBase, flowParams });
    return true;
  }

  if (pathname.endsWith("/time")) {
    backFromScheduleMeetingTime(router, role, {
      mode: isReschedule ? "reschedule" : "schedule",
      scheduleBase,
      flowParams,
      returnTo,
    });
    return true;
  }

  if (pathname.endsWith("/person")) {
    leaveScheduleMeetingPersonStep(router, role, returnTo);
    return true;
  }

  return false;
}

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
  if (options.skipPersonPicker) params.skipPersonPicker = options.skipPersonPicker;
  return params;
}

function seedRescheduleDraft(appointment: Appointment, appointmentId: string): boolean {
  const currentUserId = useAuthStore.getState().user?.id;
  const person = appointmentToSchedulePerson(appointment, currentUserId);
  if (!person) return false;

  const store = useScheduleMeetingStore.getState();
  store.reset();
  store.setMode("reschedule");
  store.setAppointmentId(appointmentId);
  store.setPerson(person);

  const title = String(appointment.notes ?? "").trim();
  store.setMeetingTitle(title || `Meeting with ${person.name}`);
  store.setPlatformLabel(platformToLabel(appointment.platform));

  const ymd = String(appointment.meetingDate ?? "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    store.setDay(ymd);
  }

  return true;
}

export function openScheduleMeeting(
  router: Router,
  role: string | undefined,
  options?: {
    mode?: ScheduleMeetingMode;
    personData?: string;
    appointmentId?: string;
    /** When rescheduling, pass the appointment to skip person selection. */
    appointment?: Appointment | unknown;
    /** Tags the appointment for assessment meeting links. */
    assessmentId?: string;
    /** When set, back from the first scheduler screen restores this href. */
    returnTo?: string;
  },
): void {
  const normalizedRole = String(role ?? "").toLowerCase();
  const mode = options?.mode ?? "schedule";
  const base = getScheduleMeetingBase(undefined, normalizedRole);

  const resolvedAppointment = resolveAppointmentRef(options?.appointment);
  const appointmentId =
    options?.appointmentId ??
    (resolvedAppointment?.id ? String(resolvedAppointment.id) : undefined);

  const params = buildScheduleFlowParams({
    mode,
    assessmentId: options?.assessmentId,
    returnTo: options?.returnTo,
    appointmentId,
    ...(mode === "reschedule" ? { skipPersonPicker: "1" } : {}),
    ...(normalizedRole === "pastor" || normalizedRole === "mentor"
      ? { drawerContext: normalizedRole }
      : {}),
  });

  if (
    mode === "reschedule" &&
    resolvedAppointment &&
    appointmentId &&
    seedRescheduleDraft(resolvedAppointment, appointmentId)
  ) {
    router.replace({
      pathname: `${base}/time`,
      params,
    } as never);
    return;
  }

  if (options?.personData) params.personData = options.personData;

  router.push({
    pathname: `${base}/person`,
    params,
  } as never);
}

/** Leave the scheduler stack and return to appointments (or returnTo). */
export function leaveScheduleMeetingFlow(
  router: Router,
  role: string | undefined,
  returnTo?: string,
): void {
  const destination = normalizeReturnToHref(returnTo);
  if (destination) {
    router.replace(parseStringHref(destination));
  } else {
    router.replace(appointmentsRouteForRole(role));
  }
  // Reset after leaving so confirm/time screens don't react to an empty draft while still mounted.
  setTimeout(() => useScheduleMeetingStore.getState().reset(), 0);
}

/** Back from person picker — always exit to appointments, never to `/schedule-meeting`. */
export function leaveScheduleMeetingPersonStep(
  router: Router,
  role: string | undefined,
  returnTo?: string,
): void {
  leaveScheduleMeetingFlow(router, role, returnTo);
}

/** Back from review/confirm — always returns to time with draft preserved. */
export function backFromScheduleMeetingConfirm(
  router: Router,
  options: {
    scheduleBase: string;
    flowParams: Record<string, string>;
  },
): void {
  router.replace({
    pathname: `${options.scheduleBase}/time`,
    params: {
      ...options.flowParams,
      preserveDraft: "1",
    },
  } as never);
}

/** Back from time selection — reschedule exits; new meeting returns to person picker. */
export function backFromScheduleMeetingTime(
  router: Router,
  role: string | undefined,
  options: {
    mode: ScheduleMeetingMode;
    scheduleBase: string;
    flowParams: Record<string, string>;
    returnTo?: string;
  },
): void {
  if (options.mode === "reschedule") {
    leaveScheduleMeetingFlow(router, role, options.returnTo);
    return;
  }

  router.replace({
    pathname: `${options.scheduleBase}/person`,
    params: {
      ...options.flowParams,
      mode: "schedule",
      preserveDraft: "1",
    },
  } as never);
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
