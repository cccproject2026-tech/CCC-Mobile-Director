export {
  appointmentKeys,
  useAppointments,
  useCancelAppointment as useCancelAppointmentMutation,
} from "@/hooks/appointments/useAppointments";

export { useCreateAppointment } from "@/hooks/appointments/useCreateAppointment";
export { useMeetingScheduler } from "@/hooks/appointments/useMeetingScheduler";

import { appointmentService } from "@/services/appointments.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "@/hooks/appointments/useAppointments";

export const useUpcomingAppointment = () => {
  return useQuery({
    queryKey: ["upcoming"],
    queryFn: () => appointmentService.getUpcomingAppointment(),
    staleTime: 30 * 1000,
    retry: 2,
  });
};

export const useUserAppointments = (userId: string | null) => {
  const { useAppointments } = require("@/hooks/appointments/useAppointments") as typeof import("@/hooks/appointments/useAppointments");
  const { appointments, isLoading, isError, error, refetch } = useAppointments(
    userId ? { userId } : {},
  );
  return { data: appointments, isLoading, isError, error, refetch };
};

export const useMentorAppointments = (mentorId: string | null) => {
  const { useAppointments } = require("@/hooks/appointments/useAppointments") as typeof import("@/hooks/appointments/useAppointments");
  const { appointments, isLoading, isError, error, refetch } = useAppointments(
    mentorId ? { mentorId } : {},
  );
  return { data: appointments, isLoading, isError, error, refetch };
};

/** Wraps cancel mutation for legacy `{ meetingId }` call sites */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId }: { meetingId: string }) =>
      appointmentService.cancelAppointment(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["upcoming"] });
    },
  });
};
