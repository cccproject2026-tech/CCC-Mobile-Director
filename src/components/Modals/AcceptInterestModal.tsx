import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AcceptInterestModalProps {
    visible: boolean;
    onLater: () => void;
    onAssignMentor: () => void;
}

export default function AcceptInterestModal({
    visible,
    onLater,
    onAssignMentor,
}: AcceptInterestModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onLater}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Interest Form Accepted !</Text>

                    <Text style={styles.message}>
                        Log-in credentials have been{'\n'}send to respective email ID
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.laterButton} onPress={onLater}>
                            <Text style={styles.laterButtonText}>Later</Text>
                        </Pressable>

                        <Pressable style={styles.assignButton} onPress={onAssignMentor}>
                            <Text style={styles.assignButtonText} numberOfLines={1} adjustsFontSizeToFit>
                                Assign Mentor {'>>'}
                            </Text>
                        </Pressable>
                    </View>
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
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        width: SCREEN_WIDTH - 60,
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a5b77',
        textAlign: 'center',
        marginBottom: 16,
    },
    message: {
        fontSize: 15,
        color: '#1a5b77',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    laterButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#1a5b77',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },
    laterButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a5b77',
    },
    assignButton: {
        flex: 1,
        backgroundColor: '#1E3A5F',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },
    assignButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
