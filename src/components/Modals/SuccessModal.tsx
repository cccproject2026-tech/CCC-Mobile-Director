import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SuccessModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    subtitle?: string;
}

export default function SuccessModal({
    visible,
    message,
    onClose,
    subtitle,
}: SuccessModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#1a5b77" />
                    </TouchableOpacity>

                    <Text style={styles.message}>{message}</Text>
                    {subtitle && (
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    content: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
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
    message: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a5b77',
        textAlign: 'center',
        marginTop: 12,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1a5b77',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
});
