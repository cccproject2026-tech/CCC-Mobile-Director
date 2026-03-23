import React from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
    visible: boolean;
    onClose: () => void;
    /** Pastor / mentee — open screen to assign mentor(s) to this person */
    onAssignMentor: () => void;
    /** Mentor / director — open screen to assign mentee(s) to this person */
    onAssignMentees: () => void;
};

export default function AssignInterestChoiceModal({
    visible,
    onClose,
    onAssignMentor,
    onAssignMentees,
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.title}>Assign</Text>
                    <Text style={styles.subtitle}>
                        Choose whether this person receives a mentor or takes on mentees.
                    </Text>

                    <Pressable
                        style={[styles.option, styles.optionPrimary]}
                        onPress={onAssignMentor}
                    >
                        <Text style={styles.optionTitle}>Assign mentor</Text>
                        <Text style={styles.optionHint}>For pastors / mentees</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.option, styles.optionPrimary]}
                        onPress={onAssignMentees}
                    >
                        <Text style={styles.optionTitle}>Assign mentees</Text>
                        <Text style={styles.optionHint}>For mentors / directors</Text>
                    </Pressable>

                    <Pressable style={styles.cancel} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: SCREEN_WIDTH - 48,
        maxWidth: 400,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a5b77',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#4a6b7c',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    option: {
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    optionPrimary: {
        backgroundColor: '#1E3A5F',
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    optionHint: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    cancel: {
        marginTop: 4,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a5b77',
    },
});
