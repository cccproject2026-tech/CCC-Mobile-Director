import type { SchedulePerson } from "@/stores/scheduleMeeting.store";
import type { Appointment, UserMentorRespose } from "@/types/appointment.types";

function contactFromUser(user?: UserMentorRespose | null) {
  if (!user) return { email: undefined, phone: undefined };
  const email = user.email?.trim() || undefined;
  const phone =
    user.phoneNumber?.trim() ||
    (user as { mobile?: string | null }).mobile?.trim() ||
    (user as { mobileNumber?: string | null }).mobileNumber?.trim() ||
    undefined;
  return { email, phone };
}

/** Resolve who to contact for an appointment (the other party). */
export function getAppointmentContactParty(
  appointment: Appointment,
  currentUserId?: string | null,
): UserMentorRespose | undefined {
  const user = appointment.user;
  const mentor = appointment.mentor;

  if (currentUserId && mentor?.id === currentUserId) return user;
  if (currentUserId && user?.id === currentUserId) return mentor;

  return user ?? mentor;
}

export function getAppointmentContactDetails(
  appointment: Appointment,
  currentUserId?: string | null,
) {
  return contactFromUser(getAppointmentContactParty(appointment, currentUserId));
}

function userToSchedulePerson(user: UserMentorRespose): SchedulePerson {
  return {
    id: String(user.id),
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Person",
    role: user.role,
    profilePicture: user.profilePicture,
  };
}

/** The other party in a meeting — used to skip person pick on reschedule. */
export function appointmentToSchedulePerson(
  appointment: Appointment,
  currentUserId?: string | null,
): SchedulePerson | null {
  const party = getAppointmentContactParty(appointment, currentUserId);
  if (party?.id) return userToSchedulePerson(party);

  const fallbackId =
    appointment.mentorId === currentUserId
      ? appointment.userId
      : appointment.mentorId;
  if (!fallbackId) return null;

  const fallbackUser =
    appointment.mentorId === currentUserId ? appointment.user : appointment.mentor;
  if (fallbackUser?.id) return userToSchedulePerson(fallbackUser);

  return {
    id: String(fallbackId),
    name: "Person",
    role: appointment.mentorId === fallbackId ? "mentor" : "pastor",
  };
}

/** Accepts a raw appointment or a list-card wrapper `{ appointment }`. */
export function resolveAppointmentRef(value: unknown): Appointment | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.meetingDate != null && record.mentorId != null) {
    return value as Appointment;
  }
  const nested = record.appointment;
  if (nested && typeof nested === "object") {
    return nested as Appointment;
  }
  return null;
}
