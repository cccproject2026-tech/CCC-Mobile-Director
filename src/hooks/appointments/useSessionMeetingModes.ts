import { appointmentService } from "@/services/appointments.service";
import type { Appointment, SessionMode } from "@/types/appointment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentKeys } from "./useAppointments";
import { mentorshipSessionKeys } from "@/hooks/roadmaps/useMentorshipSessions";

export function useUpdateSessionMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, sessionMode }: { appointmentId: string; sessionMode: SessionMode }) =>
      appointmentService.updateSessionMode(appointmentId, sessionMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all });
    },
  });
}

export function useUploadSessionRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      audio,
      recordingDurationSeconds,
      recordingPlatform,
      recordingDeviceType,
    }: {
      appointmentId: string;
      audio: { uri: string; name: string; type: string };
      recordingDurationSeconds?: number;
      recordingPlatform?: string;
      recordingDeviceType?: string;
    }) =>
      appointmentService.uploadSessionRecording(appointmentId, {
        audio,
        recordingDurationSeconds,
        recordingPlatform,
        recordingDeviceType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all });
    },
  });
}

export function useAppointmentRecordingPolling(
  appointmentId: string | undefined,
  enabled = true,
) {
  const canRun = !!appointmentId && enabled;
  return useQuery({
    queryKey: [...appointmentKeys.all, "recording", appointmentId ?? "__none__"],
    queryFn: () => appointmentService.getAppointmentById(appointmentId!),
    enabled: canRun,
    staleTime: 0,
    refetchInterval: (query) => {
      const apt = query.state.data as Appointment | undefined;
      const status = apt?.recordingStatus;
      if (!status) return 5000;
      if (status === "COMPLETED" || status === "FAILED") return false;
      return 5000;
    },
  });
}
