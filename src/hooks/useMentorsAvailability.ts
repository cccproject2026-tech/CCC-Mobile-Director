import { appointmentService } from '@/services/appointments.service';
import { MonthlyAvailabilityDay, SetAvailabilityPayload, SetAvailabilityResponse, TimeSlot, WeeklyAvailability } from '@/types/appointment.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

// Default time slots for users who don't set their own availability (e.g., Pastors)
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
    { startTime: '09:00', startPeriod: 'AM', endTime: '10:00', endPeriod: 'AM', _id: 'default-1' },
    { startTime: '10:00', startPeriod: 'AM', endTime: '11:00', endPeriod: 'AM', _id: 'default-2' },
    { startTime: '11:00', startPeriod: 'AM', endTime: '12:00', endPeriod: 'PM', _id: 'default-3' },
    { startTime: '01:00', startPeriod: 'PM', endTime: '02:00', endPeriod: 'PM', _id: 'default-4' },
    { startTime: '02:00', startPeriod: 'PM', endTime: '03:00', endPeriod: 'PM', _id: 'default-5' },
    { startTime: '03:00', startPeriod: 'PM', endTime: '04:00', endPeriod: 'PM', _id: 'default-6' },
    { startTime: '04:00', startPeriod: 'PM', endTime: '05:00', endPeriod: 'PM', _id: 'default-7' },
];

/**
 * Generate default monthly availability (Mon-Fri, 9AM-5PM)
 */
export const generateDefaultMonthlyAvailability = (month: number, year: number): MonthlyAvailabilityDay[] => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const availability: MonthlyAvailabilityDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();

        // Monday to Friday (1-5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            availability.push({
                date: dateString,
                day: dayOfWeek,
                slots: DEFAULT_TIME_SLOTS
            });
        }
    }

    return availability;
};

/**
 * Generate default weekly availability (Mon-Fri, 9AM-5PM)
 */
export const generateDefaultWeeklyAvailability = (mentorId: string): WeeklyAvailability => {
    return {
        mentorId,
        weeklySlots: [1, 2, 3, 4, 5].map(day => ({
            day,
            date: new Date().toISOString(),
            rawSlots: DEFAULT_TIME_SLOTS
        })),
        maxBookingsPerDay: 5,
        meetingDuration: 60,
        minSchedulingNoticeHours: 24
    };
};

interface UseWeeklyAvailabilityOptions {
    enabled?: boolean;
    role?: string;
}

// Helper function to format time slot
export const formatTimeSlot = (slot: TimeSlot): string => {
    return `${slot.startTime} ${slot.startPeriod} - ${slot.endTime} ${slot.endPeriod}`;
};

// Helper function to convert time slot to 24-hour format for comparison
export const convertTo24Hour = (time: string, period: 'AM' | 'PM'): number => {
    let hour = parseInt(time);
    if (period === 'PM' && hour !== 12) {
        hour += 12;
    } else if (period === 'AM' && hour === 12) {
        hour = 0;
    }
    return hour;
};

// Helper to get day name
export const getDayName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
};

export const useWeeklyAvailability = (
    mentorId: string | null,
    options?: UseWeeklyAvailabilityOptions
) => {
    const query = useQuery({
        queryKey: ['weekly-availability', mentorId],
        queryFn: async () => {
            const data = await appointmentService.getWeeklyAvailability(mentorId!);
            
            // If it's a pastor/mentee and they have no availability set, return defaults
            const isMentee = options?.role?.toLowerCase() === 'pastor' || options?.role?.toLowerCase() === 'mentee';
            if (isMentee && (!data || !data.weeklySlots || data.weeklySlots.length === 0)) {
                return generateDefaultWeeklyAvailability(mentorId!);
            }
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        enabled: Boolean(mentorId) && (options?.enabled !== false),
    });

    return {
        ...query,
        availability: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
};

interface UseMonthlyAvailabilityParams {
    mentorId: string | null;
    month: number;
    year: number;
    role?: string;
}

interface UseMonthlyAvailabilityOptions {
    enabled?: boolean;
}

export const useMonthlyAvailability = (
    params: UseMonthlyAvailabilityParams,
    options?: UseMonthlyAvailabilityOptions
) => {
    const { mentorId, month, year, role } = params;

    const query = useQuery({
        queryKey: ['monthly-availability', mentorId, month, year],
        queryFn: async () => {
            const data = await appointmentService.getMonthlyAvailability(mentorId!, month, year);
            
            // If it's a pastor/mentee and they have no availability set, return defaults
            const isMentee = role?.toLowerCase() === 'pastor' || role?.toLowerCase() === 'mentee';
            if (isMentee && (!data || data.length === 0)) {
                return generateDefaultMonthlyAvailability(month, year);
            }
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        enabled: Boolean(mentorId) && (options?.enabled !== false),
    });

    return {
        ...query,
        availability: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
    };
};

// Helper hook to get current month availability
export const useCurrentMonthAvailability = (
    mentorId: string | null,
    options?: UseMonthlyAvailabilityOptions
) => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const year = currentDate.getFullYear();

    return useMonthlyAvailability({ mentorId, month, year }, options);
};

// Helper hook to navigate between months
export const useAvailabilityNavigator = (mentorId: string | null, role?: string) => {
    const [selectedDate, setSelectedDate] = React.useState(new Date());

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    const { availability, isLoading, isError } = useMonthlyAvailability({
        mentorId,
        month,
        year,
        role,
    });

    const goToNextMonth = () => {
        setSelectedDate(prevDate => {
            const nextMonth = new Date(prevDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return nextMonth;
        });
    };

    const goToPreviousMonth = () => {
        setSelectedDate(prevDate => {
            const prevMonth = new Date(prevDate);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            return prevMonth;
        });
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const canGoToNextMonth = () => {
        const nextMonth = new Date(selectedDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        // Optional: Add logic to limit how far in the future users can go
        return true;
    };

    const canGoToPreviousMonth = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfSelectedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        return firstDayOfSelectedMonth >= today;
    };

    return {
        availability,
        isLoading,
        isError,
        selectedDate,
        month,
        year,
        goToNextMonth,
        goToPreviousMonth,
        goToToday,
        canGoToNextMonth,
        canGoToPreviousMonth,
    };
};

interface UseSetAvailabilityOptions {
    onSuccess?: (data: SetAvailabilityResponse) => void;
    onError?: (error: Error) => void;
}

/**
 * Hook for setting/updating mentor availability
 */
export const useSetAvailability = (options?: UseSetAvailabilityOptions) => {
    const { onSuccess, onError } = options || {};
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload: SetAvailabilityPayload) =>
            appointmentService.setAvailability(payload),
        onSuccess: (data) => {
            // Invalidate related queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });

            onSuccess?.(data);
        },
        onError: (error: Error) => {
            console.error('Failed to set availability:', error);
            onError?.(error);
        },
    });

    return {
        setAvailability: mutation.mutate,
        setAvailabilityAsync: mutation.mutateAsync,
        isSettingAvailability: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
};
