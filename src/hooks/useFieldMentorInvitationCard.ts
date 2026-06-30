import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/stores/auth.store";
import { Mentee } from "@/types/user.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { completionKeys, useInviteFieldMentor } from "./useCompletionWorkflow";
import { profileKeys } from "./useProfile";
import { progressKeys } from "./useProgress";

function useMarkProgramComplete() {
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

/** Handlers for Field Mentor Invitations list (dashboard) only. */
export function useFieldMentorInvitationCardHandlers(mentee?: Mentee | null) {
    const { user: director } = useAuthStore();
    const directorId = director?.id ?? "";
    const userId = mentee?.id ?? "";

    const markComplete = useMarkProgramComplete();
    const inviteFieldMentor = useInviteFieldMentor();

    if (!mentee?.id) {
        return {
            onMarkComplete: undefined,
            onInviteAsFieldMentor: undefined,
            onInvitationSent: undefined,
            isBusy: false,
        };
    }

    const onMarkComplete = () => {
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
            ],
        );
    };

    const onInviteAsFieldMentor = () => {
        const targetEmail = mentee.email;
        if (!targetEmail?.trim()) {
            Alert.alert("No email", "User email is required to send an invitation.");
            return;
        }
        if (!directorId) {
            Alert.alert("Error", "You must be logged in to send an invitation.");
            return;
        }
        if (mentee.fieldMentorInvitation || mentee.hasIssuedCertificate) {
            Alert.alert(
                "Already invited",
                "A field mentor invitation has already been sent to this pastor.",
            );
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

    const onInvitationSent = () => {
        Alert.alert(
            "Invitation already sent",
            "A field mentor invitation has already been sent to this pastor.",
        );
    };

    return {
        onMarkComplete: !mentee.hasCompleted ? onMarkComplete : undefined,
        onInviteAsFieldMentor:
            mentee.hasCompleted && !mentee.hasIssuedCertificate
                ? onInviteAsFieldMentor
                : undefined,
        onInvitationSent: mentee.hasIssuedCertificate ? onInvitationSent : undefined,
        isBusy: markComplete.isPending || inviteFieldMentor.isPending,
    };
}
