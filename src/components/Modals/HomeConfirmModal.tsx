import { homeLayout, roadmapTheme } from "@/components/ui/design-system";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  /** Single-button alert (no cancel). */
  alertOnly?: boolean;
};

export default function HomeConfirmModal({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  alertOnly = false,
}: Props) {
  const handleClose = onCancel ?? onConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={[...Colors.appBgGradient]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={roadmapTheme.textMuted} />
          </Pressable>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {loading ? (
            <ActivityIndicator
              color={roadmapTheme.accentMint}
              size="small"
              style={styles.loader}
            />
          ) : (
            <View style={[styles.footer, alertOnly && styles.footerSingle]}>
              {!alertOnly && onCancel ? (
                <Pressable style={styles.cancelButton} onPress={onCancel}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.confirmButton, alertOnly && styles.confirmButtonFull]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: homeLayout.cardRadius,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  message: {
    color: roadmapTheme.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  loader: {
    marginTop: 24,
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  footerSingle: {
    justifyContent: "center",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    backgroundColor: roadmapTheme.frostedSurface,
  },
  cancelText: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(142, 197, 235, 0.45)",
    backgroundColor: "rgba(142, 197, 235, 0.25)",
  },
  confirmButtonFull: {
    flex: 0,
    minWidth: 140,
    alignSelf: "center",
    paddingHorizontal: 28,
  },
  confirmText: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
});
