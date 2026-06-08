import { appointmentService } from '@/services/appointments.service';
import { Appointment, UpdateAppointmentPayload } from '@/types/appointment.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseUpdateAppointmentOptions {
    onSuccess?: (appointment: Appointment) => void;
    onError?: (error: Error) => void;
}

export const useUpdateAppointment = (options?: UseUpdateAppointmentOptions) => {
    const { onSuccess, onError } = options || {};
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentPayload }) =>
            appointmentService.updateAppointment(id, payload),
        onSuccess: (updatedAppointment) => {
            // Invalidate all appointment queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ['appointments'] });

            onSuccess?.(updatedAppointment);
        },
        onError: (error: Error) => {
            console.error('Failed to update appointment:', error);
            onError?.(error);
        },
    });

    return {
        updateAppointment: mutation.mutate,
        updateAppointmentAsync: mutation.mutateAsync,
        isUpdating: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
};
