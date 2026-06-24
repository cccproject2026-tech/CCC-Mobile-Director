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
