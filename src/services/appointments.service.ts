import {
  ApiMessageResponse,
  Appointment,
  AppointmentPlatform,
  AppointmentResponse,
  CreateAppointmentPayload,
  CreateRecurringAvailabilityPayload,
  GetMonthlyAvailabilityApiResponse,
  GetWeeklyAvailabilityApiResponse,
  MentorAvailabilityDocument,
  MonthlyAvailabilityDay,
  PatchMentorAvailabilityDayPayload,
  SetAvailabilityApiResponse,
  SetAvailabilityPayload,
  SetAvailabilityResponse,
  SessionMode,
  UpdateAppointmentPayload,
  UpdateMentorAvailabilitySettingsPayload,
  WeeklyAvailability,
} from "../types/appointment.types";
import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const appointmentService = {
  /**
   * Fetch all appointments for a specific user
   */
  getUserAppointments: async (
    userId: string,
    opts?: { futureOnly?: boolean },
  ): Promise<Appointment[]> => {
    try {
      const futureOnly = opts?.futureOnly;
      const qs =
        typeof futureOnly === "boolean" ? `?futureOnly=${futureOnly}` : "";
      const response = await apiClient.get<AppointmentResponse>(
        `${ENDPOINTS.APPOINTMENTS.GET(userId)}${qs}`,
      );
      return Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      throw error;
    }
  },

  /**
   * Fetch all appointments for a specific mentor
   */
  getMentorAppointments: async (
    mentorId: string,
    opts?: { futureOnly?: boolean },
  ): Promise<Appointment[]> => {
    try {
      const futureOnly = opts?.futureOnly;
      const qs =
        typeof futureOnly === "boolean" ? `?futureOnly=${futureOnly}` : "";
      const response = await apiClient.get<AppointmentResponse>(
        `${ENDPOINTS.APPOINTMENTS.GET_BY_MENTOR(mentorId)}${qs}`,
      );
      console.log(
        "Fetched mentor appointments for mentorId:",
        mentorId,
        "response:",
        response.data,
      );
      return Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
    } catch (error) {
      console.error("Error fetching mentor appointments:", error);
      throw error;
    }
  },

  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiClient.get<AppointmentResponse>(
      ENDPOINTS.APPOINTMENTS.GET_BY_ID(appointmentId),
    );
    return Array.isArray(response.data.data)
      ? response.data.data[0]
      : response.data.data;
  },

  /**
   * Fetch weekly appointments for a mentor
   */
  getWeeklyAvailability: async (
    mentorId: string,
  ): Promise<WeeklyAvailability> => {
    if (!mentorId) {
      throw new Error("mentorId is required for getWeeklyAvailability");
    }
    const response = await apiClient.get<GetWeeklyAvailabilityApiResponse>(
      ENDPOINTS.APPOINTMENTS.GET_WEEKLY_AVAILABILITY(mentorId),
    );
    return response.data.data;
  },

  /**
   * Fetch monthly appointments for a mentor
   */
  getMonthlyAvailability: async (
    mentorId: string,
    month: number,
    year: number,
  ): Promise<MonthlyAvailabilityDay[]> => {
    if (!mentorId) {
      throw new Error("mentorId is required for getMonthlyAvailability");
    }

    const response = await apiClient.get<GetMonthlyAvailabilityApiResponse>(
      ENDPOINTS.APPOINTMENTS.GET_MONTHLY_AVAILABILITY(mentorId, month, year),
    );
    console.log(
      "Monthly availability params:",
      mentorId,
      month,
      year,
      " raw response:",
      response.data,
    );

    return response.data.data ?? [];
  },

  /**
   * Set/Update weekly availability for a mentor (legacy bulk POST)
   */
  setAvailability: async (
    payload: SetAvailabilityPayload,
  ): Promise<SetAvailabilityResponse> => {
    try {
      const response = await apiClient.post<SetAvailabilityApiResponse>(
        ENDPOINTS.APPOINTMENTS.SET_AVAILABILITY,
        payload,
      );
      return response.data.data;
    } catch (error) {
      console.error("Error setting availability:", error);
      throw error;
    }
  },

  createRecurringAvailability: async (
    payload: CreateRecurringAvailabilityPayload,
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.post<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.CREATE_RECURRING_AVAILABILITY,
      payload,
    );
    return response.data;
  },

  patchAvailabilityDay: async (
    mentorId: string,
    body: PatchMentorAvailabilityDayPayload,
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.patch<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.PATCH_AVAILABILITY_DAY(mentorId),
      body,
    );
    return response.data;
  },

  patchAvailabilitySettings: async (
    mentorId: string,
    body: UpdateMentorAvailabilitySettingsPayload,
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.patch<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.PATCH_AVAILABILITY_SETTINGS(mentorId),
      body,
    );
    return response.data;
  },

  markAvailabilityDayUnavailable: async (
    mentorId: string,
    dateYmd: string,
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.post<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.MARK_DAY_UNAVAILABLE(mentorId),
      { date: dateYmd.slice(0, 10) },
    );
    return response.data;
  },

  markAvailabilityDayAvailable: async (
    mentorId: string,
    body: PatchMentorAvailabilityDayPayload,
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.post<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.MARK_DAY_AVAILABLE(mentorId),
      { ...body, date: body.date.slice(0, 10) },
    );
    return response.data;
  },

  deleteAvailabilityDay: async (
    mentorId: string,
    dateYmd: string,
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.delete<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.DELETE_AVAILABILITY_DAY(mentorId, dateYmd),
    );
    return response.data;
  },

  deleteAvailabilitySlot: async (
    mentorId: string,
    payload: { slotId: string; date?: string },
  ): Promise<ApiMessageResponse> => {
    const response = await apiClient.delete<ApiMessageResponse>(
      ENDPOINTS.APPOINTMENTS.DELETE_AVAILABILITY_SLOT(mentorId),
      { data: payload },
    );
    return response.data;
  },

  getMentorAvailabilityDocument: async (
    mentorId: string,
  ): Promise<MentorAvailabilityDocument> => {
    const response = await apiClient.get<{
      success: boolean;
      data: MentorAvailabilityDocument;
    }>(ENDPOINTS.APPOINTMENTS.GET_WEEKLY_AVAILABILITY(mentorId));
    return response.data.data;
  },

  /**
   * Create a new appointment
   */
  createAppointment: async (
    payload: CreateAppointmentPayload,
  ): Promise<Appointment> => {
    try {
      const response = await apiClient.post<AppointmentResponse>(
        ENDPOINTS.APPOINTMENTS.CREATE,
        payload,
      );
      const raw = response.data.data;
      const appointment = Array.isArray(raw) ? raw[0] : raw;
      return appointment as Appointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  /** Raw create response envelope (includes Google Calendar sync metadata). */
  createAppointmentRaw: async (
    payload: CreateAppointmentPayload,
  ): Promise<{ data: unknown; message?: string; success?: boolean }> => {
    const response = await apiClient.post<{
      data: unknown;
      message?: string;
      success?: boolean;
    }>(ENDPOINTS.APPOINTMENTS.CREATE, payload);
    return response.data;
  },

  /**
   * Merged CCC availability + Google Free/Busy for slot filtering.
   * GET `/availability/:mentorUserId?from=&to=&participantUserId=`
   */
  getMergedAvailability: async (
    mentorUserId: string,
    params: { from: string; to: string; participantUserId?: string },
  ): Promise<unknown> => {
    const response = await apiClient.get<{ data: unknown }>(
      ENDPOINTS.AVAILABILITY.MERGED(mentorUserId),
      { params },
    );
    return response.data;
  },

  /**
   * Update an existing appointment
   */
  updateAppointment: async (
    appointmentId: string,
    payload: UpdateAppointmentPayload,
  ): Promise<Appointment> => {
    try {
      console.log(
        "Updating appointment ID:",
        appointmentId,
        "with payload:",
        payload,
      );
      const response = await apiClient.patch<AppointmentResponse>(
        ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId),
        payload,
      );
      return Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

  updateSessionMode: async (
    appointmentId: string,
    sessionMode: SessionMode,
  ): Promise<Appointment> => {
    const response = await apiClient.patch<AppointmentResponse>(
      ENDPOINTS.APPOINTMENTS.UPDATE_SESSION_MODE(appointmentId),
      { sessionMode },
    );
    return Array.isArray(response.data.data)
      ? response.data.data[0]
      : response.data.data;
  },

  uploadSessionRecording: async (
    appointmentId: string,
    payload: {
      audio: { uri: string; name: string; type: string };
      recordingDurationSeconds?: number;
      recordingPlatform?: string;
      recordingDeviceType?: string;
    },
  ): Promise<Appointment> => {
    const formData = new FormData();
    formData.append("audio", {
      uri: payload.audio.uri,
      name: payload.audio.name,
      type: payload.audio.type,
    } as any);

    if (payload.recordingDurationSeconds != null) {
      formData.append(
        "recordingDurationSeconds",
        String(payload.recordingDurationSeconds),
      );
    }
    if (payload.recordingPlatform) {
      formData.append("recordingPlatform", payload.recordingPlatform);
    }
    if (payload.recordingDeviceType) {
      formData.append("recordingDeviceType", payload.recordingDeviceType);
    }

    const response = await apiClient.post<AppointmentResponse>(
      ENDPOINTS.APPOINTMENTS.UPLOAD_RECORDING(appointmentId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 },
    );
    return Array.isArray(response.data.data)
      ? response.data.data[0]
      : response.data.data;
  },

  /**
   * Reschedule an existing appointment
   */
  rescheduleAppointment: async (
    appointmentId: string,
    payload: {
      newDate: string;
      startTime: string;
      startPeriod: "AM" | "PM";
    },
  ): Promise<Appointment> => {
    try {
      const response = await apiClient.patch<AppointmentResponse>(
        ENDPOINTS.APPOINTMENTS.RESCHEDULE(appointmentId),
        payload,
      );
      return Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      throw error;
    }
  },

  /**
   * Cancel an existing appointment
   */
  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    try {
      const response = await apiClient.patch<AppointmentResponse>(
        ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId),
        {},
      );
      return Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;
    } catch (error) {
      console.error("Error canceling appointment:", error);
      throw error;
    }
  },

  /**
   * Build appointment payload with validation
   */
  buildCreatePayload: (
    userId: string,
    mentorId: string,
    meetingDate: string,
    platform: AppointmentPlatform,
    meetingLink?: string,
    notes?: string,
  ): CreateAppointmentPayload => {
    return {
      userId,
      mentorId,
      meetingDate,
      platform,
      ...(meetingLink && { meetingLink }),
      ...(notes && { notes }),
    };
  },

  /**
   * Convert date and time slot to ISO string
   */
  createMeetingDate: (
    dateString: string,
    timeSlot: { startTime: string; startPeriod: "AM" | "PM" },
  ): string => {
    // Parse date string (format: "2025-11-22")
    const [year, month, day] = dateString.split("-").map(Number);

    // Convert to 24-hour format
    let hour = parseInt(timeSlot.startTime, 10);
    if (timeSlot.startPeriod === "PM" && hour !== 12) {
      hour += 12;
    } else if (timeSlot.startPeriod === "AM" && hour === 12) {
      hour = 0;
    }

    // IST is UTC+5:30. We use an ISO string with offset for reliable conversion.
    const isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00+05:30`;
    return new Date(isoString).toISOString();
  },

  /**
   * Map UI platform labels to API platform values
   */
  mapPlatformToApiValue: (platformLabel: string): AppointmentPlatform => {
    const platformMap: Record<string, AppointmentPlatform> = {
      Zoom: "zoom",
      "Google Meet": "google_meet",
      "Microsoft Teams": "teams",
      "Phone Call": "phone",
      "In-Person Meeting": "in_person",
    };
    return platformMap[platformLabel] || "zoom";
  },

  /**
   * Format appointment date for display
   */
  formatAppointmentDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  },

  /**
   * Check if appointment is upcoming
   */
  isUpcoming: (meetingDate: string): boolean => {
    return new Date(meetingDate) > new Date();
  },

  /**
   * Calculate appointment duration in minutes
   */
  calculateDuration: (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  },

  /** Director home glance — upcoming appointments list */
  getUpcomingAppointment: async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get<AppointmentResponse>(
        ENDPOINTS.APPOINTMENTS.UPCOMING(),
      );
      return Array.isArray(response.data.data)
        ? response.data.data
        : [response.data.data];
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      throw error;
    }
  },
};
