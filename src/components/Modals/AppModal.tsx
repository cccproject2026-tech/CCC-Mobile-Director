import React, { useEffect } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    visible: boolean;

    /** "confirm" | "success" */
    type: "confirm" | "success";

    /** Title text / message */
    title: string;

    /** Confirm modal props */
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;

    /** For success popup */
    autoClose?: number;
    onClose?: () => void;
};

const AppModal: React.FC<Props> = ({
    visible,
    type,
    title,
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    autoClose = 2000,
    onClose,
}) => {

    // Auto close for success modal
    useEffect(() => {
        if (visible && type === "success" && onClose) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <View style={styles.modalBox}>

                    {/* Close icon only for confirm modal */}
                    {type === "confirm" && (
                        <Pressable style={styles.closeButton} onPress={onCancel}>
                            <Ionicons name="close" size={24} color="#666" />
                        </Pressable>
                    )}

                    <Text style={styles.title}>{title}</Text>

                    {/* Confirm Mode */}
                    {type === "confirm" && (
                        <View style={styles.row}>
                            <Pressable style={styles.cancelBtn} onPress={onCancel}>
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </Pressable>

                            <Pressable style={styles.confirmBtn} onPress={onConfirm}>
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Success Mode */}

                </View>
            </View>
        </Modal>
    );
};

export default AppModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        position: "relative",
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        padding: 6,
    },
    title: {
        textAlign: "center",
        color: "#1a5b77",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 24,
        marginTop: 6,
    },
    row: {
        flexDirection: "row",
        width: "100%",
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1a5b77",
        alignItems: "center",
    },
    cancelText: {
        color: "#1a5b77",
        fontSize: 16,
        fontWeight: "600",
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "red",
        alignItems: "center",
    },
    confirmText: {
        color: "red",
        fontSize: 16,
        fontWeight: "700",
    },
    successContainer: {
        marginTop: 10,
        padding: 20,
    },
    successText: {
        fontSize: 28,
        color: "#22c55e",
        fontWeight: "700",
    },
});
