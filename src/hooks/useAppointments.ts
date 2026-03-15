import { appointmentService } from '@/services/appointments.service';
import { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from '@/types/appointment.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const appointmentKeys = {
    all: ['appointments'] as const,
    user: (userId: string) => [...appointmentKeys.all, 'user', userId] as const,
    mentor: (mentorId: string) => [...appointmentKeys.all, 'mentor', mentorId] as const,
};

export const useUserAppointments = (userId: string | null) => {
    return useQuery({
        queryKey: appointmentKeys.user(userId || ''),
        queryFn: () => appointmentService.getUserAppointments(userId!),
        enabled: !!userId,
    });
};

export const useMentorAppointments = (mentorId: string | null) => {
    return useQuery({
        queryKey: appointmentKeys.mentor(mentorId || ''),
        queryFn: () => appointmentService.getMentorAppointments(mentorId!),
        enabled: !!mentorId,
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateAppointmentPayload) =>
            appointmentService.createAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
            queryClient.invalidateQueries({ queryKey: ['upcoming'] });
        },
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentPayload }) =>
            appointmentService.updateAppointment(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
        },
    });
};

export const useRescheduleAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { newDate: string; startTime: string; startPeriod: 'AM' | 'PM' } }) =>
            appointmentService.rescheduleAppointment(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });
        },
    });
};

export const useUpcomingAppointment = () => {
    return useQuery({
        queryKey: ['upcoming'],
        queryFn: () => appointmentService.getUpcomingAppointment(),
        staleTime: 30 * 1000,
        retry: 2,
    });
};

export const useCancelAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ meetingId }: { meetingId: string; }) =>
            appointmentService.cancelAppointment(meetingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upcoming'] });
        },
    });
};

export const useSearchAvailabilityByDate = (userId: string, date: string) => {
    return useQuery({
      queryKey: appointmentKeys.user(userId || ""),
      queryFn: () => appointmentService.searchAvailabilityWithDate(userId, date),
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    });
}
