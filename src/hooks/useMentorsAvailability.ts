import { appointmentService } from '@/services/appointments.service';
import { SetAvailabilityPayload, SetAvailabilityResponse, TimeSlot } from '@/types/appointment.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

interface UseWeeklyAvailabilityOptions {
    enabled?: boolean;
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
        queryFn: () => appointmentService.getWeeklyAvailability(mentorId!),
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
}

interface UseMonthlyAvailabilityOptions {
    enabled?: boolean;
}

export const useMonthlyAvailability = (
    params: UseMonthlyAvailabilityParams,
    options?: UseMonthlyAvailabilityOptions
) => {
    const { mentorId, month, year } = params;

    const query = useQuery({
        queryKey: ['monthly-availability', mentorId, month, year],
        queryFn: () => appointmentService.getMonthlyAvailability(mentorId!, month, year),
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
export const useAvailabilityNavigator = (mentorId: string | null) => {
    const [selectedDate, setSelectedDate] = React.useState(new Date());

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    const { availability, isLoading, isError } = useMonthlyAvailability({
        mentorId,
        month,
        year,
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
