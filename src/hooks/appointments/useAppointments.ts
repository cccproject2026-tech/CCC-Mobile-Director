import { appointmentService } from "@/services/appointments.service";
import { AppointmentStatus } from "@/types/appointment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseAppointmentsOptions {
  userId?: string;
  mentorId?: string;
  /** When false, include past appointments too (backend: futureOnly=false). */
  futureOnly?: boolean;
}

export const appointmentKeys = {
  all: ["appointments"] as const,
  user: (userId: string) => [...appointmentKeys.all, "user", userId] as const,
  mentor: (mentorId: string) =>
    [...appointmentKeys.all, "mentor", mentorId] as const,
};

export const useAppointments = (options?: UseAppointmentsOptions) => {
  const { userId, mentorId, futureOnly } = options || {};

  // Fetch user appointments
  const userQuery = useQuery({
    queryKey: [...appointmentKeys.user(userId || ""), { futureOnly }] as const,
    queryFn: () => appointmentService.getUserAppointments(userId!, { futureOnly }),
    enabled: !!userId,
    staleTime: 20000, // 2 seconds (was 5 minutes)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Fetch mentor appointments
  const mentorQuery = useQuery({
    queryKey: [...appointmentKeys.mentor(mentorId || ""), { futureOnly }] as const,
    queryFn: () => appointmentService.getMentorAppointments(mentorId!, { futureOnly }),
    enabled: !!mentorId,
    staleTime: 20000, // 2 seconds (was 5 minutes)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Get the right data
  const appointments = userId ? userQuery.data || [] : mentorQuery.data || [];
  const isLoading = userId ? userQuery.isLoading : mentorQuery.isLoading;
  const isError = userId ? userQuery.isError : mentorQuery.isError;
  const error = userId ? userQuery.error : mentorQuery.error;

  const isCancelledStatus = (status: unknown) => {
    const normalized = String(status ?? "")
      .trim()
      .toLowerCase();
    // Be tolerant to API variations: "cancelled" vs "canceled", casing, etc.
    return normalized === "cancelled" || normalized === "canceled" || normalized.startsWith("cancel");
  };

  // Filter helpers
  const getAppointmentsByStatus = (status: AppointmentStatus) => {
    return appointments.filter((apt) => apt.status === status);
  };

  const getAppointmentsByDate = (
    date: string,
    opts?: { includeCancelled?: boolean },
  ) => {
    const includeCancelled = opts?.includeCancelled ?? false;
    return appointments.filter((apt) => {
      if (!includeCancelled && isCancelledStatus(apt.status)) return false;
      return apt.meetingDate.split("T")[0] === date;
    });
  };

  const getUpcomingAppointments = (opts?: { includeCancelled?: boolean }) => {
    const includeCancelled = opts?.includeCancelled ?? false;
    return appointments.filter((apt) => {
      if (!includeCancelled && isCancelledStatus(apt.status)) return false;
      return appointmentService.isUpcoming(apt.meetingDate);
    });
  };

  const getPastAppointments = (opts?: { includeCancelled?: boolean }) => {
    const includeCancelled = opts?.includeCancelled ?? false;
    return appointments.filter((apt) => {
      if (!includeCancelled && isCancelledStatus(apt.status)) return false;
      return !appointmentService.isUpcoming(apt.meetingDate);
    });
  };

  return {
    // Data
    appointments,
    isLoading,
    isError,
    error,

    // Filters
    getAppointmentsByStatus,
    getAppointmentsByDate,
    getUpcomingAppointments,
    getPastAppointments,

    // Refetch
    refetch: userId ? userQuery.refetch : mentorQuery.refetch,
  };
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentService.cancelAppointment(appointmentId),
    onSuccess: (cancelledAppointment) => {
      // Immediately reflect the cancelled status in any cached appointment lists
      queryClient.setQueriesData(
        { queryKey: appointmentKeys.all },
        (oldData: unknown) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map((apt) =>
            apt?.id === cancelledAppointment.id ? cancelledAppointment : apt,
          );
        },
      );

      // Then refetch to stay consistent with server data
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};
