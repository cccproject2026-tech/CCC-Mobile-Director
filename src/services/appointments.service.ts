import {
    Appointment,
    AppointmentPlatform,
    AppointmentResponse,
    CreateAppointmentPayload,
    GetMonthlyAvailabilityApiResponse,
    GetWeeklyAvailabilityApiResponse,
    MonthlyAvailabilityDay,
    SetAvailabilityApiResponse,
    SetAvailabilityPayload,
    SetAvailabilityResponse,
    UpdateAppointmentPayload,
    WeeklyAvailability
} from '../types/appointment.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const appointmentService = {
    /**
     * Fetch all appointments for a specific user
     */
    getUserAppointments: async (userId: string): Promise<Appointment[]> => {
        try {
            if (!userId) return [];
              const response = await apiClient.get<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.GET(userId),
              );
            return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
        } catch (error) {
            console.error('Error fetching user appointments:', error);
            throw error;
        }
    },

    /**
     * Fetch all appointments for a specific mentor
     */
    getMentorAppointments: async (mentorId: string): Promise<Appointment[]> => {
        try {
            const response = await apiClient.get<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.GET_BY_MENTOR(mentorId)
            );
            return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
        } catch (error) {
            console.error('Error fetching mentor appointments:', error);
            throw error;
        }
    },

    /**
     * Fetch weekly appointments for a mentor
     */
    getWeeklyAvailability: async (mentorId: string): Promise<WeeklyAvailability> => {
        const response = await apiClient.get<GetWeeklyAvailabilityApiResponse>(
            ENDPOINTS.APPOINTMENTS.GET_WEEKLY_AVAILABILITY(mentorId)
        );
        return response.data.data;
    },

    /**
     * Fetch monthly appointments for a mentor
     */
    getMonthlyAvailability: async (
        mentorId: string,
        month: number,
        year: number
    ): Promise<MonthlyAvailabilityDay[]> => {
        const response = await apiClient.get<GetMonthlyAvailabilityApiResponse>(
            ENDPOINTS.APPOINTMENTS.GET_MONTHLY_AVAILABILITY(mentorId, month, year)
        );
        return response.data.data;
    },

    /**
     * Set/Update weekly availability for a mentor
     */
    setAvailability: async (
        payload: SetAvailabilityPayload
    ): Promise<SetAvailabilityResponse> => {
        try {
            const response = await apiClient.post<SetAvailabilityApiResponse>(
                ENDPOINTS.APPOINTMENTS.SET_AVAILABILITY,
                payload
            );
            return response.data.data;
        } catch (error) {
            console.error('Error setting availability:', error);
            throw error;
        }
    },

    /**
     * Create a new appointment
     */
    createAppointment: async (
        payload: CreateAppointmentPayload
    ): Promise<Appointment> => {
        try {
            const response = await apiClient.post<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.CREATE,
                payload
            );
            return Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    },

    /**
     * Update an existing appointment
     */
    updateAppointment: async (
        appointmentId: string,
        payload: UpdateAppointmentPayload
    ): Promise<Appointment> => {
        try {
            console.log('Updating appointment ID:', appointmentId, 'with payload:', payload);
            const response = await apiClient.patch<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId),
                payload
            );
            return Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    },

    /**
     * Reschedule an existing appointment
     */
    rescheduleAppointment: async (
        appointmentId: string,
        payload: {
            newDate: string;
            startTime: string;
            startPeriod: 'AM' | 'PM';
        }
    ): Promise<Appointment> => {
        try {
            const response = await apiClient.patch<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.RESCHEDULE(appointmentId),
                payload
            );
            return Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            throw error;
        }
    },

    getUpcomingAppointment: async (): Promise<Appointment[]> => {
        try {
            const response = await apiClient.get<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.UPCOMING(),
            );
            return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
        } catch (error) {
            console.error('Error upcoming appointment:', error);
            throw error;
        }
    },

    cancelAppointment: async (
        meetingId: string | null,
    ): Promise<Appointment> => {
        try {
            const response = await apiClient.patch<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.CANCEL_MEETING(meetingId),
            );
            return Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    },

    searchAvailabilityWithDate: async (
        userId: string | null,
        date: string | null
    ): Promise<Appointment[]> => {
        try {
            const response = await apiClient.get<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.SEARCH_WITH_DATE(date, userId),
            );
            return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
        } catch (error) {
            console.error('Error upcoming appointment:', error);
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
        notes?: string
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
        timeSlot: { startTime: string; startPeriod: 'AM' | 'PM' }
    ): string => {
        // Parse date string (format: "2025-11-22")
        const [year, month, day] = dateString.split('-').map(Number);

        // Convert to 24-hour format
        let hour = parseInt(timeSlot.startTime, 10);
        if (timeSlot.startPeriod === 'PM' && hour !== 12) {
            hour += 12;
        } else if (timeSlot.startPeriod === 'AM' && hour === 12) {
            hour = 0;
        }

        // IST is UTC+5:30. We use an ISO string with offset for reliable conversion.
        const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00+05:30`;
        return new Date(isoString).toISOString();
    },


    /**
     * Map UI platform labels to API platform values
     */
    mapPlatformToApiValue: (platformLabel: string): AppointmentPlatform => {
        const platformMap: Record<string, AppointmentPlatform> = {
            'Zoom': 'zoom',
            'Google Meet': 'google_meet',
            'Microsoft Teams': 'teams',
            'Phone Call': 'phone',
            'In-Person Meeting': 'in_person',
        };
        return platformMap[platformLabel] || 'zoom';
    },

    /**
     * Format appointment date for display
     */
    formatAppointmentDate: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
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
};
