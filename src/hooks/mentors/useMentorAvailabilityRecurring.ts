import { appointmentService } from "@/services/appointments.service";
import {
  CreateRecurringAvailabilityPayload,
  PatchMentorAvailabilityDayPayload,
  UpdateMentorAvailabilitySettingsPayload,
} from "@/types/appointment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const availabilityQueryKeys = {
  weekly: (mentorId: string | null) => ["weekly-availability", mentorId] as const,
  monthly: (mentorId: string | null, month: number, year: number) =>
    ["monthly-availability", mentorId, month, year] as const,
  document: (mentorId: string | null) =>
    ["mentor-availability-document", mentorId] as const,
};

function invalidateAvailabilityQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: ["weekly-availability"] });
  queryClient.invalidateQueries({ queryKey: ["monthly-availability"] });
  queryClient.invalidateQueries({ queryKey: ["mentor-availability-document"] });
  queryClient.invalidateQueries({ queryKey: ["appointments"] });
}

export function useMentorAvailabilityDocument(
  mentorId: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: availabilityQueryKeys.document(mentorId),
    queryFn: () => appointmentService.getMentorAvailabilityDocument(mentorId!),
    enabled: Boolean(mentorId) && options?.enabled !== false,
    staleTime: 2000,
    retry: 2,
  });
}

export function useCreateRecurringAvailability(options?: {
  onSuccess?: (message?: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRecurringAvailabilityPayload) =>
      appointmentService.createRecurringAvailability(payload),
    onSuccess: (data) => {
      invalidateAvailabilityQueries(queryClient);
      options?.onSuccess?.(
        typeof data.message === "string" ? data.message : undefined,
      );
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}

export function usePatchAvailabilitySettings(options?: {
  onSuccess?: (message?: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mentorId,
      body,
    }: {
      mentorId: string;
      body: UpdateMentorAvailabilitySettingsPayload;
    }) => appointmentService.patchAvailabilitySettings(mentorId, body),
    onSuccess: (data) => {
      invalidateAvailabilityQueries(queryClient);
      options?.onSuccess?.(
        typeof data.message === "string" ? data.message : undefined,
      );
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}

export function usePatchAvailabilityDay(options?: {
  onSuccess?: (message?: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mentorId,
      body,
    }: {
      mentorId: string;
      body: PatchMentorAvailabilityDayPayload;
    }) => appointmentService.patchAvailabilityDay(mentorId, body),
    onSuccess: (data) => {
      invalidateAvailabilityQueries(queryClient);
      options?.onSuccess?.(
        typeof data.message === "string" ? data.message : undefined,
      );
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}

export function useMarkAvailabilityDayUnavailable(options?: {
  onSuccess?: (message?: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mentorId, dateYmd }: { mentorId: string; dateYmd: string }) =>
      appointmentService.markAvailabilityDayUnavailable(mentorId, dateYmd),
    onSuccess: (data) => {
      invalidateAvailabilityQueries(queryClient);
      options?.onSuccess?.(
        typeof data.message === "string" ? data.message : undefined,
      );
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}

export function useMarkAvailabilityDayAvailable(options?: {
  onSuccess?: (message?: string) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mentorId,
      body,
    }: {
      mentorId: string;
      body: PatchMentorAvailabilityDayPayload;
    }) => appointmentService.markAvailabilityDayAvailable(mentorId, body),
    onSuccess: (data) => {
      invalidateAvailabilityQueries(queryClient);
      options?.onSuccess?.(
        typeof data.message === "string" ? data.message : undefined,
      );
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}
