import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonStyle?: any;
    confirmTextStyle?: any;
}

export default function ConfirmModal({
    visible,
    title,
    onConfirm,
    onCancel,
    confirmText = 'Save',
    cancelText = 'Cancel',
    confirmButtonStyle,
    confirmTextStyle,
}: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                        <Ionicons name="close" size={24} color="#1a5b77" />
                    </TouchableOpacity>

                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmButton, confirmButtonStyle]} onPress={onConfirm}>
                            <Text style={[styles.confirmText, confirmTextStyle]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    content: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a5b77',
        textAlign: 'center',
        marginTop: 20,      // fixed instead of getSpacing
        marginBottom: 24,
        lineHeight: 26,
        maxWidth: '80%',
        alignSelf: 'center',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a5b77',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#1a5b77',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
