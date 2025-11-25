import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onClick?: () => void;
    avatar: any;
    message: string;
    progress?: number;
    bg?: string;
    borderColor?: string;
};

const WelcomeCard: React.FC<Props> = ({ avatar, message, progress, bg = '#14517d', borderColor = '#fff', onClick }) => {
    const showProgress = progress !== undefined && progress >= 0;

    return (
        <TouchableOpacity
            onPress={onClick}
            activeOpacity={onClick ? 0.8 : 1}
            style={[styles.container, { backgroundColor: bg, borderColor }]}
        >
            <View style={styles.content}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person-circle-outline" size={48} color="#fff" />
                    </View>
                )}

                <View style={styles.messageBlock}>
                    <Text style={styles.message}>{message}</Text>

                    {showProgress && (
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Progress</Text>

                            <View style={styles.progressVisuals}>
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{progress}%</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default WelcomeCard;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 18,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    messageBlock: {
        flex: 1,
        flexDirection: 'column',
    },
    message: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 17,
        marginBottom: 8,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 10,
    },
    progressVisuals: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressContainer: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(24, 44, 91, 1)',
        borderRadius: 4,
        overflow: 'hidden',
        elevation: 3,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 36,
        textAlign: 'right',
    },
});
