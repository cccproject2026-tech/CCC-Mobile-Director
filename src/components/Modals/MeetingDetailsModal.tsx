import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type Props = {
    visible: boolean;
    onClose: () => void;
    meeting: any;
};

const MeetingDetailsModal = ({
    visible,
    onClose,
    meeting,
}: Props) => {
    if (!meeting) return null;

    const handleOpenLink = async () => {
        if (meeting?.meetingLink) {
            await Linking.openURL(meeting.meetingLink);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Meeting Details
                        </Text>

                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close"
                                size={24}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >

                        {/* USER */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Person
                            </Text>

                            <Text style={styles.value}>
                                {meeting?.user?.firstName} {meeting?.user?.lastName}
                            </Text>
                        </View>

                        {/* MENTOR */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Mentor
                            </Text>

                            <Text style={styles.value}>
                                {meeting?.mentor?.firstName} {meeting?.mentor?.lastName}
                            </Text>
                        </View>

                        {/* DATE */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Date & Time
                            </Text>

                            <Text style={styles.value}>
                                {new Date(meeting?.meetingDate).toLocaleString()}
                            </Text>
                        </View>

                        {/* STATUS */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Status
                            </Text>

                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            meeting?.status === 'scheduled'
                                                ? '#16A34A'
                                                : meeting?.status === 'canceled'
                                                    ? '#DC2626'
                                                    : '#F59E0B',
                                    },
                                ]}
                            >
                                <Text style={styles.statusText}>
                                    {meeting?.status}
                                </Text>
                            </View>
                        </View>

                        {/* NOTES */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Notes
                            </Text>

                            <Text style={styles.value}>
                                {meeting?.notes || 'No notes available'}
                            </Text>
                        </View>

                        {/* PLATFORM */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Platform
                            </Text>

                            <Text style={styles.value}>
                                {meeting?.platform?.toUpperCase()}
                            </Text>
                        </View>

                        {/* LINK */}
                        <View style={styles.card}>
                            <Text style={styles.label}>
                                Meeting Link
                            </Text>

                            <TouchableOpacity
                                onPress={handleOpenLink}
                                style={styles.linkContainer}
                            >
                                <Ionicons
                                    name="videocam-outline"
                                    size={18}
                                    color="#60A5FA"
                                />

                                <Text
                                    style={styles.linkText}
                                    numberOfLines={2}
                                >
                                    Join Meeting
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>

                    {/* FOOTER BUTTON */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>
                            Close
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default MeetingDetailsModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    container: {
        width: '100%',
        maxHeight: '85%',
        backgroundColor: '#176192',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },

    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    label: {
        color: '#FFEA00',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    value: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
    },

    statusText: {
        color: '#FFFFFF',
        fontWeight: '700',
        textTransform: 'capitalize',
    },

    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: 12,
        borderRadius: 12,
    },

    linkText: {
        color: '#60A5FA',
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
        flex: 1,
    },

    closeButton: {
        backgroundColor: '#0B3B5E',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
    },

    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});