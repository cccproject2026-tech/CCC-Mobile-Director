import { Mentee } from "@/types/user.types";
import { useMenteeCardCompletionHandlers } from "@/hooks/useCompletionWorkflow";
import React from "react";
import MenteeCard, { MenteeCardProps } from "./index";

type Props = Omit<
  MenteeCardProps,
  "onMarkComplete" | "onIssueCertificate" | "onInviteAsFieldMentor"
> & {
  data: Mentee;
};

/** MenteeCard with real certificate / completion / field-mentor actions wired. */
export default function MenteeProgressCard(props: Props) {
  const handlers = useMenteeCardCompletionHandlers(props.data);
  return (
    <MenteeCard
      {...props}
      onMarkComplete={handlers.onMarkComplete}
      onIssueCertificate={handlers.onIssueCertificate}
      onInviteAsFieldMentor={handlers.onInviteAsFieldMentor}
    />
  );
}
