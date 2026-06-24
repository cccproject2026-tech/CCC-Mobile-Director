import {
  certificatesService,
  hasRealCertificate,
} from "@/services/certificates.service";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth.store";
import { CertificateRecord } from "@/types/certificate.types";
import {
  CourseCompletedStatus,
  CourseCompletedUser,
  InviteFieldMentorPayload,
} from "@/types/progress.types";
import { Mentee } from "@/types/user.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { profileKeys } from "./useProfile";
import { progressKeys } from "./useProgress";

export const completionKeys = {
  courseCompleted: (search?: string) => ["courseCompleted", search ?? ""] as const,
  certificate: (userId: string) => ["certificate", userId] as const,
};

const DEFAULT_PROGRAM_NAME = "12-Month Mentoring Revitalization Program";

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      issuedBy,
      completionDate,
      personalMessage,
    }: {
      userId: string;
      issuedBy: string;
      completionDate?: string;
      personalMessage?: string;
    }) =>
      certificatesService.issueCertificate({
        userId,
        issuedBy,
        programName: DEFAULT_PROGRAM_NAME,
        completionDate,
        personalMessage,
      }),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: completionKeys.certificate(userId) });
      queryClient.invalidateQueries({ queryKey: ["mentees"] });
      queryClient.invalidateQueries({ queryKey: completionKeys.courseCompleted() });
      queryClient.invalidateQueries({ queryKey: ["directorOverview"] });
    },
  });
}

export function useUserCertificate(userId: string | undefined) {
  return useQuery({
    queryKey: completionKeys.certificate(userId ?? ""),
    queryFn: () => certificatesService.getUserCertificate(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function openCertificateUrl(_certificate: CertificateRecord | null | undefined) {
  Alert.alert(
    'Certificate',
    'Use View Certificate to open the programme completion certificate preview.',
  );
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
    queryFn: async (): Promise<CourseCompletedUser[]> => {
      const data = await usersService.getAllUsers({
        role: "pastor",
        search: search || undefined,
        limit: 500,
        roleMatch: "mixed",
      });

      const rawUsers = data.users as Array<Record<string, unknown>>;
      const usersExposeCertificateData = rawUsers.some((u) =>
        certificatesService.userExposesCertificateFields(u),
      );

      const mapped = await Promise.all(
        rawUsers.map(async (u): Promise<CourseCompletedUser | null> => {
          const mentee = u as unknown as Mentee;
          const id = String(u.id ?? u._id ?? "").trim();
          if (!id) return null;

          const certificate = await certificatesService.resolveCertificateForUser(
            u,
            usersExposeCertificateData,
          );
          const hasCert = hasRealCertificate(certificate);
          const hasCompleted = Boolean(u.hasCompleted);
          const fieldMentorInvitation = mentee.fieldMentorInvitation;

          if (!fieldMentorInvitation && !hasCert && !hasCompleted) {
            return null;
          }

          let status: CourseCompletedStatus = "completed";
          if (fieldMentorInvitation) status = "invited";
          else if (hasCert) status = "certificate_issued";
          else if (hasCompleted) status = "completed";
          else return null;

          return {
            id,
            name:
              `${String(u.firstName ?? "")} ${String(u.lastName ?? "")}`.trim() ||
              "Unknown",
            email: String(u.email ?? ""),
            profilePicture:
              typeof u.profilePicture === "string" ? u.profilePicture : undefined,
            createdAt: typeof u.createdAt === "string" ? u.createdAt : undefined,
            status,
            hasCompleted,
            hasIssuedCertificate: Boolean(mentee.hasIssuedCertificate) || hasCert,
            hasRealCertificate: hasCert,
            fieldMentorInvitation,
            invitationDate: fieldMentorInvitation
              ? new Date(
                  String(
                    (fieldMentorInvitation as { invitedAt?: string }).invitedAt ?? "",
                  ),
                ).toLocaleDateString()
              : undefined,
            response: fieldMentorInvitation ? "Waiting" : undefined,
          };
        }),
      );

      return mapped.filter((row): row is CourseCompletedUser => row !== null);
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

/** Certificate + field mentor actions for director post-completion workflow. */
export function useCompletionWorkflow(userId: string, user?: Partial<Mentee> | null) {
  const { user: director } = useAuthStore();
  const directorId = director?.id ?? "";

  const issueCertificate = useIssueCertificate();
  const inviteFieldMentor = useInviteFieldMentor();

  const runIssueCertificate = () => {
    if (!userId || !directorId) {
      Alert.alert("Error", "You must be logged in to issue a certificate.");
      return;
    }
    if (!user?.hasCompleted) {
      Alert.alert(
        "Not completed",
        "This pastor must be marked complete by their mentor before a certificate can be issued.",
      );
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
            },
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
              },
            );
          },
        },
      ],
    );
  };

  return {
    runIssueCertificate,
    runInviteFieldMentor,
    isIssuingCertificate: issueCertificate.isPending,
    isInvitingFieldMentor: inviteFieldMentor.isPending,
    isBusy: issueCertificate.isPending || inviteFieldMentor.isPending,
  };
}

export function useMenteeCardCompletionHandlers(mentee?: Mentee | null) {
  const workflow = useCompletionWorkflow(mentee?.id ?? "", mentee ?? undefined);
  if (!mentee?.id) {
    return {
      onIssueCertificate: undefined,
      onInviteAsFieldMentor: undefined,
      isBusy: false,
    };
  }
  return {
    onIssueCertificate:
      mentee.hasCompleted && !mentee.hasIssuedCertificate
        ? workflow.runIssueCertificate
        : undefined,
    onInviteAsFieldMentor:
      mentee.hasCompleted && mentee.hasIssuedCertificate && !mentee.isFieldMentor
        ? () => workflow.runInviteFieldMentor(mentee.email)
        : undefined,
    isBusy: workflow.isBusy,
  };
}

export function filterCourseCompletedByTab(
  users: CourseCompletedUser[],
  tab: CourseCompletedStatus,
) {
  return users.filter((u) => {
    if (tab === "completed") {
      return Boolean(u.hasCompleted) && !u.hasRealCertificate;
    }
    if (tab === "certificate_issued") {
      return Boolean(u.hasRealCertificate) && !u.fieldMentorInvitation;
    }
    if (tab === "invited") {
      return Boolean(u.fieldMentorInvitation);
    }
    return false;
  });
}

export function sortCourseCompletedUsers(
  users: CourseCompletedUser[],
  sortBy: string,
): CourseCompletedUser[] {
  const list = [...users];

  if (sortBy === "latest_completed" || sortBy === "latest_issued") {
    return list.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
  }

  if (sortBy === "oldest_completed" || sortBy === "oldest_issued") {
    return list.sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
    );
  }

  if (sortBy === "accepted") {
    return list.filter((u) => u.response === "Accepted");
  }

  if (sortBy === "waiting") {
    return list.filter((u) => u.response === "Waiting");
  }

  return list;
}
