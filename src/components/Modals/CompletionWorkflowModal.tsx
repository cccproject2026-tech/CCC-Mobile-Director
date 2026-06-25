import HomeConfirmModal from "@/components/Modals/HomeConfirmModal";
import React from "react";

export type WorkflowDialogState = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  alertOnly?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type Props = {
  dialog: WorkflowDialogState | null;
  onClose: () => void;
};

export default function CompletionWorkflowModal({ dialog, onClose }: Props) {
  if (!dialog?.visible) return null;

  return (
    <HomeConfirmModal
      visible={dialog.visible}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      alertOnly={dialog.alertOnly}
      loading={dialog.loading}
      onConfirm={dialog.onConfirm}
      onCancel={dialog.onCancel ?? onClose}
    />
  );
}
