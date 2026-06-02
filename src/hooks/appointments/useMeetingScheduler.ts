import { assessmentMeetingNote } from '@/lib/assessments/assessmentMeetings';
import { appointmentService } from '@/services/appointments.service';
import type {
  Appointment,
  TimeSlot as APITimeSlot,
  WeeklyAvailability,
} from '@/types/appointment.types';
import {
  extractGoogleCalendarCreateOutcome,
  googleCalendarSuccessHintFromCreateResponse,
} from '@/utils/google-calendar/google-calendar-scheduling';
import { getAppointmentJoinUrl } from '@/utils/meetingLinkDetails';
import { labelToPlatform } from '@/utils/appointments/platform';
import { validateSchedule } from '@/utils/appointments/validation';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useCreateAppointment } from './useCreateAppointment';

export type SchedulerMode = 'schedule' | 'reschedule';

export type SchedulerPerson = {
  id: string;
  name: string;
  role?: string;
};

export type UseMeetingSchedulerParams = {
  mode: SchedulerMode;
  currentUserId: string | undefined;
  currentUserRole: string | undefined;
  selectedPerson: SchedulerPerson | null;
  /** For reschedule only. */
  existingAppointment?: Appointment | null;
  /** YYYY-MM-DD */
  selectedDayYmd: string;
  selectedSlot: APITimeSlot | null;
  meetingOptionLabel: string;
  settings?: WeeklyAvailability | null;
  mentorAppointments?: Appointment[];
  userAppointments?: Appointment[];
  /** Tags the appointment for assessment list meeting links. */
  assessmentId?: string;
};

export type MeetingSchedulerSubmitResult = {
  appointmentId: string;
  meetingDate: string;
  meetingLink?: string;
  googleCalendarSuccessHint?: string;
  googleCalendarSyncWarnings: string[];
};

export function useMeetingScheduler(params: UseMeetingSchedulerParams) {
  const {
    mode,
    currentUserId,
    currentUserRole,
    selectedPerson,
    existingAppointment,
    selectedDayYmd,
    selectedSlot,
    meetingOptionLabel,
    settings,
    mentorAppointments = [],
    userAppointments = [],
    assessmentId,
  } = params;

  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);
  const {
    rescheduleAppointmentAsync,
    isRescheduling,
  } = useCreateAppointment();

  const isSubmitting = isBooking || isRescheduling;

  async function submit(): Promise<MeetingSchedulerSubmitResult> {
    if (
      !currentUserId ||
      !selectedPerson?.id ||
      !selectedSlot?.startTime ||
      !selectedDayYmd
    ) {
      throw new Error('Missing required details.');
    }

    const meetingDateIso = appointmentService.createMeetingDate(
      selectedDayYmd,
      selectedSlot,
    );

    const issue = validateSchedule({
      meetingDateIso,
      meetingDayYmd: selectedDayYmd,
      settings,
      mentorAppointments,
      userAppointments,
      excludeAppointmentId:
        mode === "reschedule" ? existingAppointment?.id : undefined,
    });
    if (issue) {
      const err = new Error(issue.message);
      (err as any).title = issue.title;
      (err as any).code = issue.code;
      throw err;
    }

    const platform = labelToPlatform(meetingOptionLabel);

    const roleLower = String(currentUserRole || '').toLowerCase();
    const isMentorUser = roleLower === 'mentor';

    const payloadMentorId = isMentorUser ? currentUserId : selectedPerson.id;
    const payloadUserId = isMentorUser ? selectedPerson.id : currentUserId;

    const initiatorRole =
      roleLower === 'mentor' || roleLower === 'director' || roleLower === 'pastor'
        ? roleLower
        : undefined;

    if (mode === 'reschedule') {
      if (!existingAppointment?.id) {
        throw new Error('Missing appointment to reschedule.');
      }
      const res = await rescheduleAppointmentAsync({
        appointmentId: existingAppointment.id,
        newDate: meetingDateIso,
        startTime: selectedSlot.startTime,
        startPeriod: selectedSlot.startPeriod as any,
      });
      return {
        appointmentId: res.id,
        meetingDate: meetingDateIso,
        meetingLink: getAppointmentJoinUrl(res) ?? undefined,
        googleCalendarSyncWarnings: [],
      };
    }

    const notes = assessmentId
      ? assessmentMeetingNote(assessmentId)
      : `Meeting with ${selectedPerson.name}`;

    const createPayload = {
      userId: payloadUserId,
      mentorId: payloadMentorId,
      meetingDate: meetingDateIso,
      platform,
      meetingLink: undefined,
      notes,
      ...(initiatorRole ? { initiatorRole } : {}),
    };

    setIsBooking(true);
    try {
      const rawResponse = await appointmentService.createAppointmentRaw(createPayload);
      const outcome = extractGoogleCalendarCreateOutcome(rawResponse);
      const gHint = googleCalendarSuccessHintFromCreateResponse(rawResponse);

      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
      await queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });

      const data = rawResponse.data;
      const created = (Array.isArray(data) ? data[0] : data) as Appointment;

      return {
        appointmentId: created.id,
        meetingDate: meetingDateIso,
        meetingLink: getAppointmentJoinUrl(created) ?? undefined,
        googleCalendarSuccessHint: gHint,
        googleCalendarSyncWarnings: outcome.warnings,
      };
    } finally {
      setIsBooking(false);
    }
  }

  return { submit, isSubmitting };
}
