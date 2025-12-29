import { RoadmapCardData } from '@/types/roadmap.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    data: RoadmapCardData & { phaseNumber?: number };
    onPress?: () => void;
    showMenu?: boolean;
    onMenuPress?: () => void;
}

export const RoadmapCard: React.FC<Props> = ({
    data,
    onPress,
    showMenu,
    onMenuPress,
}) => {
    const isCompleted = data.status === 'completed';
    const hasProgress = data.taskProgress && !isCompleted;
    const showArrow = data.showArrow && !isCompleted;

    const hasActions = showMenu || showArrow;

    const progressPercentage = useMemo(() => {
        return data.taskProgress
            ? Math.min(100, (data.taskProgress.completed / data.taskProgress.total) * 100)
            : 0;
    }, [data.taskProgress]);

    const statusConfig = useMemo(() => {
        const configs = {
            completed: { text: 'Completed', color: '#fff' },
            due: { text: 'Due', color: '#FFD700' },
            'in-progress': { text: 'In Progress', color: '#fff' },
            initial: { text: 'Not Started Yet', color: 'rgba(255,255,255,0.8)' },
        };
        return data.status ? configs[data.status as keyof typeof configs] : null;
    }, [data.status]);

    const showCompletionTimeOnLeft = data.completionTime && data.status;
    const CardWrapper = onPress ? TouchableOpacity : View;

    const renderImage = () => (
        <View style={styles.imageContainer}>
            <Image
                source={
                    typeof data.image === 'number'
                        ? data.image
                        : {
                            uri:
                                data.image ||
                                'https://via.placeholder.com/300x200?text=No+Image',
                        }
                }
                style={styles.image}
                resizeMode="cover"
            />

            {data.phaseNumber && (
                <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>Phase {data.phaseNumber}</Text>
                </View>
            )}

            {isCompleted && (
                <View style={styles.checkmarkOverlay}>
                    <Ionicons name="checkmark" size={32} color="#fff" />
                </View>
            )}
        </View>
    );

    const renderActions = () => {
        if (!hasActions) return null;

        return (
            <View style={styles.actionsContainer}>
                {showMenu && onMenuPress && (
                    <TouchableOpacity
                        onPress={onMenuPress}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name="ellipsis-vertical"
                            size={20}
                            color="rgba(255,255,255,0.6)"
                        />
                    </TouchableOpacity>
                )}
                {showArrow && (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255,255,255,0.6)"
                    />
                )}
            </View>
        );
    };

    const renderProgressSection = () => {
        if (!hasProgress || !data.taskProgress) return null;

        return (
            <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                        <View
                            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                        />
                    </View>
                    <Text style={styles.progressFraction}>
                        {data.taskProgress.completed} / {data.taskProgress.total}
                    </Text>
                </View>
                <Text style={styles.progressLabel}>Tasks Completed</Text>
            </View>
        );
    };

    return (
        <CardWrapper style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.inner, !hasActions && styles.innerNoActions]}>
                <View style={[styles.left, !hasActions && styles.leftNoActions]}>
                    {renderImage()}
                    {showCompletionTimeOnLeft && (
                        <Text style={styles.completionTime}>{data.completionTime}</Text>
                    )}
                </View>

                <View style={[styles.right, !hasActions && styles.rightNoActions]}>
                    <View style={styles.titleRow}>
                        <Text
                            style={[styles.title, !hasActions && styles.titleNoActions]}
                            numberOfLines={2}
                        >
                            {data.title}
                        </Text>
                        {renderActions()}
                    </View>

                    {data.description && (
                        <Text
                            style={[
                                styles.description,
                                !hasActions && styles.descriptionNoActions,
                            ]}
                            numberOfLines={2}
                        >
                            {data.description}
                        </Text>
                    )}

                    {data.completionTime && !data.status && (
                        <Text
                            style={[
                                styles.completionTimeText,
                                !hasActions && styles.completionTimeTextNoActions,
                            ]}
                        >
                            {data.completionTime}
                        </Text>
                    )}

                    {statusConfig && (
                        <View
                            style={[
                                styles.statusRow,
                                !hasActions && styles.statusRowNoActions,
                            ]}
                        >
                            <View style={styles.statusPill}>
                                <Text
                                    style={[
                                        styles.statusPillText,
                                        { color: statusConfig.color },
                                    ]}
                                >
                                    Status  •  {statusConfig.text}
                                </Text>
                            </View>
                        </View>
                    )}

                    {renderProgressSection()}

                    {isCompleted && data.completedDate && (
                        <Text
                            style={[
                                styles.completedDate,
                                !hasActions && styles.completedDateNoActions,
                            ]}
                        >
                            Completed on : {data.completedDate}
                        </Text>
                    )}
                </View>
            </View>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        marginBottom: 18,
        padding: 12,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minWidth: 0,
    },
    innerNoActions: {},
    left: {
        marginRight: 16,
        alignItems: 'flex-start',
        flexShrink: 0,
    },
    leftNoActions: {
        width: '30%',
        maxWidth: 140,
    },
    imageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#2A5080',
    },
    phaseBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: '#B8A641',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    phaseBadgeText: {
        color: '#1D1D1D',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    checkmarkOverlay: {
        position: 'absolute',
        right: 8,
        top: 8,
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completionTime: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 16,
        marginTop: 12,
    },
    right: {
        flex: 1,
        minWidth: 0,
    },
    rightNoActions: {
        flex: 1,
        paddingRight: 0,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 6,
        minWidth: 0,
    },
    title: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 23,
        paddingRight: 40,
        minWidth: 0,
    },
    titleNoActions: {
        paddingRight: 0,
    },
    actionsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        gap: 12,
        flexShrink: 0,
        width: 32,
    },
    description: {
        fontSize: 13.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 10,
        lineHeight: 18,
        paddingRight: 40,
        minWidth: 0,
    },
    descriptionNoActions: {
        paddingRight: 0,
    },
    statusRow: {
        marginTop: 6,
        paddingRight: 40,
    },
    statusRowNoActions: {
        paddingRight: 0,
    },
    statusPill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.08)',
        flexShrink: 1,
    },
    statusPillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    progressSection: {
        marginTop: 12,
        paddingRight: 40,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
        minWidth: 0,
    },
    progressTrack: {
        flex: 1,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        minWidth: 50,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1f2b55',
    },
    progressFraction: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 0,
        minWidth: 40,
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '400',
    },
    completedDate: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 10,
        fontSize: 13,
        fontWeight: '400',
        paddingRight: 40,
        minWidth: 0,
    },
    completedDateNoActions: {
        paddingRight: 0,
    },
    completionTimeText: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 18,
        marginTop: 6,
        paddingRight: 40,
        minWidth: 0,
    },
    completionTimeTextNoActions: {
        paddingRight: 0,
    },
});

export default RoadmapCard;
