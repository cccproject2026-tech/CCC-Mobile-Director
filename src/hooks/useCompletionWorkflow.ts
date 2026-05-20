import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth.store";
import {
  CourseCompletedStatus,
  InviteFieldMentorPayload,
} from "@/types/progress.types";
import { Mentee } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { profileKeys } from "./useProfile";
import { progressKeys } from "./useProgress";

export const completionKeys = {
  courseCompleted: (search?: string) => ["courseCompleted", search ?? ""] as const,
};

export function useMarkProgramComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.markProgramComplete(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: ["mentees"] });
      queryClient.invalidateQueries({ queryKey: completionKeys.courseCompleted() });
      queryClient.invalidateQueries({ queryKey: ["directorOverview"] });
    },
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, issuedBy }: { userId: string; issuedBy: string }) =>
      usersService.issueCertificate(userId, issuedBy),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: ["mentees"] });
      queryClient.invalidateQueries({ queryKey: completionKeys.courseCompleted() });
      queryClient.invalidateQueries({ queryKey: ["directorOverview"] });
    },
  });
}

export function useInviteFieldMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteFieldMentorPayload & { userId?: string }) => {
      const { userId: _uid, ...body } = payload;
      return usersService.inviteFieldMentor(body);
    },
    onSuccess: (_data, variables) => {
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.user(variables.userId) });
      }
      queryClient.invalidateQueries({ queryKey: ["mentees"] });
      queryClient.invalidateQueries({ queryKey: completionKeys.courseCompleted() });
      queryClient.invalidateQueries({ queryKey: ["directorOverview"] });
    },
  });
}

export function useCourseCompletedUsers(search?: string) {
  return useQuery({
    queryKey: completionKeys.courseCompleted(search),
    queryFn: async () => {
      const data = await usersService.getAllUsers({
        role: "pastor",
        search: search || undefined,
        limit: 500,
        roleMatch: "mixed",
      });
      return usersService.mapToCourseCompletedUsers(data.users);
    },
  });
}

export function useCompletedPastorsCount() {
  return useQuery({
    queryKey: ["courseCompleted", "count"],
    queryFn: async () => {
      const data = await usersService.getAllUsers({
        role: "pastor",
        hasCompleted: true,
        limit: 1,
        roleMatch: "mixed",
      });
      return data.total ?? data.users?.length ?? 0;
    },
  });
}

/** Shared handlers for MenteeCard / progress detail / course completed */
export function useCompletionWorkflow(userId: string, user?: Partial<Mentee> | null) {
  const { user: director } = useAuthStore();
  const directorId = director?.id ?? "";

  const markComplete = useMarkProgramComplete();
  const issueCertificate = useIssueCertificate();
  const inviteFieldMentor = useInviteFieldMentor();

  const runMarkComplete = () => {
    if (!userId) return;
    Alert.alert(
      "Mark as complete",
      "Mark this programme as completed for this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            markComplete.mutate(userId, {
              onSuccess: () =>
                Alert.alert("Success", "Programme marked as completed."),
              onError: (e: Error) =>
                Alert.alert("Error", e.message || "Could not mark complete."),
            });
          },
        },
      ]
    );
  };

  const runIssueCertificate = () => {
    if (!userId || !directorId) {
      Alert.alert("Error", "You must be logged in to issue a certificate.");
      return;
    }
    Alert.alert("Issue certificate", "Issue certificate for this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Issue",
        onPress: () => {
          issueCertificate.mutate(
            { userId, issuedBy: directorId },
            {
              onSuccess: () =>
                Alert.alert("Success", "Certificate issued successfully."),
              onError: (e: Error) =>
                Alert.alert("Error", e.message || "Could not issue certificate."),
            }
          );
        },
      },
    ]);
  };

  const runInviteFieldMentor = (email?: string) => {
    const targetEmail = email ?? user?.email;
    if (!targetEmail?.trim()) {
      Alert.alert("No email", "User email is required to send an invitation.");
      return;
    }
    if (!directorId) {
      Alert.alert("Error", "You must be logged in to send an invitation.");
      return;
    }
    if (user?.fieldMentorInvitation) {
      Alert.alert("Already invited", "This user has already been invited as a field mentor.");
      return;
    }
    Alert.alert(
      "Invite as Field Mentor",
      `Send field mentor invitation to ${targetEmail}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send invite",
          onPress: () => {
            inviteFieldMentor.mutate(
              { email: targetEmail.trim(), invitedBy: directorId, userId },
              {
                onSuccess: () =>
                  Alert.alert("Success", "Field mentor invitation sent."),
                onError: (e: Error) =>
                  Alert.alert("Error", e.message || "Could not send invitation."),
              }
            );
          },
        },
      ]
    );
  };

  return {
    runMarkComplete,
    runIssueCertificate,
    runInviteFieldMentor,
    isMarkingComplete: markComplete.isPending,
    isIssuingCertificate: issueCertificate.isPending,
    isInvitingFieldMentor: inviteFieldMentor.isPending,
    isBusy:
      markComplete.isPending ||
      issueCertificate.isPending ||
      inviteFieldMentor.isPending,
  };
}

export function useMenteeCardCompletionHandlers(mentee?: Mentee | null) {
  const workflow = useCompletionWorkflow(mentee?.id ?? "", mentee ?? undefined);
  if (!mentee?.id) {
    return {
      onMarkComplete: undefined,
      onIssueCertificate: undefined,
      onInviteAsFieldMentor: undefined,
      isBusy: false,
    };
  }
  return {
    onMarkComplete: workflow.runMarkComplete,
    onIssueCertificate: workflow.runIssueCertificate,
    onInviteAsFieldMentor: () => workflow.runInviteFieldMentor(mentee.email),
    isBusy: workflow.isBusy,
  };
}

export function filterCourseCompletedByTab(
  users: ReturnType<typeof usersService.mapToCourseCompletedUsers>,
  tab: CourseCompletedStatus
) {
  return users.filter((u) => u.status === tab);
}
