import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelConfirmationModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0, 0, 0, 0.6)" },
          ]}
        />
        <View style={styles.content}>
          <Pressable onPress={onClose}
            style={styles.removeSlotButton}
          >
            <Ionicons name="close" size={22} color="rgba(120, 120, 120)' }" />
          </Pressable>
          <Text style={styles.message}>
            Are you sure you want to cancel the meeting ?
          </Text>
          <View style={styles.footer}>
            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>No</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onConfirm}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 24,
    padding: 15 ,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E3A6F",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "rgba(23, 97, 146, 1)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    marginTop:20
  },
  footer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#1E3A6F",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A6F",
  },
  cancelButton: {
    borderColor: "#FF4D4D",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF4D4D",
  },
  removeSlotButton: {
   justifyContent:"flex-end",
   alignSelf:"flex-end"
  },
});

export default CancelConfirmationModal;
