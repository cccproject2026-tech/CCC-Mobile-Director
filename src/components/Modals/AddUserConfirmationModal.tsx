import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    visible: boolean;
    userName: string;
    userRole: string;
    onLater: () => void;
    onAssign: () => void;
};

const UserAddedConfirmationModal: React.FC<Props> = ({
    visible,
    userName,
    userRole,
    onLater,
    onAssign,
}) => {
    const assignButtonText =
        userRole === 'Pastor' ? 'Assign Mentor >>' : 'Assign Mentees >>';

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>
                        Added {userName} as {userRole} !
                    </Text>
                    <Text style={styles.message}>
                        Log-in credentials have been send to respective email ID
                    </Text>

                    <View style={styles.actions}>
                        <Pressable style={styles.laterButton} onPress={onLater}>
                            <Text style={styles.laterButtonText}>Later</Text>
                        </Pressable>

                        <Pressable style={styles.assignButton} onPress={onAssign}>
                            <Text style={styles.assignButtonText}>{assignButtonText}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default UserAddedConfirmationModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 21,
        fontWeight: '700',
        color: '#164d62',
        textAlign: 'center',
        marginBottom: 14,
    },
    message: {
        fontSize: 15,
        color: '#4a6b7c',
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        gap: 14,
        width: '100%',
    },
    laterButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#164d62',
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
    },
    laterButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#164d62',
    },
    assignButton: {
        flex: 1,
        backgroundColor: '#164d62',
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
