import { Mentee } from "@/types/user.types";
import { useFieldMentorInvitationCardHandlers } from "@/hooks/useFieldMentorInvitationCard";
import React from "react";
import MenteeCard, { MenteeCardProps } from "./index";

type Props = Omit<
    MenteeCardProps,
    "onMarkComplete" | "onInviteAsFieldMentor" | "onInvitationSent"
> & {
    data: Mentee;
};

/** Pastor card for dashboard → Field Mentor Invitations (legacy behaviour). */
export default function FieldMentorInvitationCard(props: Props) {
    const handlers = useFieldMentorInvitationCardHandlers(props.data);
    return (
        <MenteeCard
            {...props}
            useLegacyFieldMentorActions
            onMarkComplete={handlers.onMarkComplete}
            onInviteAsFieldMentor={handlers.onInviteAsFieldMentor}
            onInvitationSent={handlers.onInvitationSent}
        />
    );
}
