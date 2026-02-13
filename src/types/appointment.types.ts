export type AppointmentPlatform = 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface CreateAppointmentPayload {
    userId: string; // MongoId - REQUIRED
    mentorId: string; // MongoId - REQUIRED
    meetingDate: string; // ISO Date - REQUIRED
    platform: AppointmentPlatform; // REQUIRED
    meetingLink?: string; // OPTIONAL
    notes?: string; // OPTIONAL
}

export interface UpdateAppointmentPayload {
    meetingDate?: string;
    platform?: AppointmentPlatform;
    meetingLink?: string;
    notes?: string;
    status?: AppointmentStatus;
}

export interface Appointment {
    id: string;
    userId: string;
    mentorId: string;
    meetingDate: string; // ISO Date
    endTime: string; // ISO Date
    platform: AppointmentPlatform;
    meetingLink?: string;
    notes?: string;
    status: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface AppointmentResponse {
    success: boolean;
    message: string;
    data: Appointment | Appointment[];
}

export interface UseAppointmentsState {
    appointments: Appointment[];
    currentAppointment: Appointment | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    error: string | null;
    success: boolean;
}

export interface AppointmentFilter {
    userId?: string;
    mentorId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
}


export interface TimeSlot {
    startTime: string;
    startPeriod: 'AM' | 'PM';
    endTime: string;
    endPeriod: 'AM' | 'PM';
    _id: string;
}

export interface MonthlyAvailabilityDay {
    date: string; // Format: "2025-11-01"
    day: number; // Day of week: 0 (Sunday) - 6 (Saturday)
    slots: TimeSlot[];
}

export interface WeeklySlot {
    day: number; // Day of week: 0 (Sunday) - 6 (Saturday)
    date: string; // ISO format: "2025-11-17T00:00:00.000Z"
    rawSlots: TimeSlot[];
}

export interface WeeklyAvailability {
    mentorId: string;
    weeklySlots: WeeklySlot[];
    maxBookingsPerDay?: number;
    meetingDuration?: number;
    minSchedulingNoticeHours?: number;
}

export interface GetWeeklyAvailabilityApiResponse {
    success: boolean;
    message: string;
    data: WeeklyAvailability;
}

export interface GetMonthlyAvailabilityApiResponse {
    success: boolean;
    message: string;
    data: MonthlyAvailabilityDay[];
}

export interface WeeklySlotInput {
    day: number; // Day of week: 0 (Sunday) - 6 (Saturday)
    date: string; // Format: "2025-11-17"
    slots: {
        startTime: string;
        startPeriod: 'AM' | 'PM';
        endTime: string;
        endPeriod: 'AM' | 'PM';
    }[];
}

export interface SetAvailabilityPayload {
    mentorId: string;
    weeklySlots: WeeklySlotInput[];
    meetingDuration: number; // in minutes
    minSchedulingNoticeHours: number;
    maxBookingsPerDay: number;
}

export interface WeeklySlotResponse {
    day: number;
    date: string; // ISO format: "2025-11-17T00:00:00.000Z"
    rawSlots: TimeSlot[];
    slots: TimeSlot[];
    _id: string;
}

export interface SetAvailabilityResponse {
    _id: string;
    mentorId: string;
    __v: number;
    createdAt: string;
    maxBookingsPerDay: number;
    meetingDuration: number;
    minSchedulingNoticeHours: number;
    preferredPlatform?: string;
    updatedAt: string;
    weeklySlots: WeeklySlotResponse[];
}

export interface SetAvailabilityApiResponse {
    success: boolean;
    message: string;
    data: SetAvailabilityResponse;
}
