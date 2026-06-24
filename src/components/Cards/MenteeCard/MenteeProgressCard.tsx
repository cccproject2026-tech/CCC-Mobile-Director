import { Mentee } from "@/types/user.types";
import { useMenteeCardCompletionHandlers } from "@/hooks/useCompletionWorkflow";
import React from "react";
import MenteeCard, { MenteeCardProps } from "./index";

type Props = Omit<
  MenteeCardProps,
  "onIssueCertificate" | "onInviteAsFieldMentor"
> & {
  data: Mentee;
};

/** MenteeCard with certificate / field-mentor actions wired (post mentor completion). */
export default function MenteeProgressCard(props: Props) {
  const handlers = useMenteeCardCompletionHandlers(props.data);
  return (
    <MenteeCard
      {...props}
      onIssueCertificate={handlers.onIssueCertificate}
      onInviteAsFieldMentor={handlers.onInviteAsFieldMentor}
    />
  );
}
