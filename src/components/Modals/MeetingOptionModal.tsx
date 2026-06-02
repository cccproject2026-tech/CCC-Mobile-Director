import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onReschedule: () => void;
    onCancel: () => void;
    onView:() => void;
}

const MeetingOptionModal: React.FC<Props> = ({ visible, onClose, onReschedule, onCancel,onView }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
                <View style={styles.content}>
                          {/* VIEW */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.option,
                            pressed && styles.optionPressed,
                        ]}
                        onPress={() => {
                            onClose();
                            onView();
                        }}
                    >
                        <Ionicons
                            name="eye-outline"
                            size={20}
                            color="#FFFFFF"
                        />

                        <Text style={styles.optionText}>
                            View Details
                        </Text>
                    </Pressable>

                    <View style={styles.separator} />
                    <Pressable 
                        style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} 
                        onPress={() => {
                            onClose();
                            onReschedule();
                        }}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.optionText}>Reschedule</Text>
                    </Pressable>
                    <View style={styles.separator} />
                    <Pressable 
                        style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} 
                        onPress={() => {
                            onClose();
                            onCancel();
                        }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                        <Text style={[styles.optionText, { color: '#FF4D4D' }]}>Cancel Meeting</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    content: {
        width: '70%',
        backgroundColor: 'rgba(30, 58, 111, 0.95)',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    optionPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 8,
    },
});

export default MeetingOptionModal;
