// components/Cards/RoadmapCard.tsx
import { RoadmapCardData } from '@/types/roadmap.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    data: RoadmapCardData & { phaseNumber?: number };
    onPress?: () => void;
    showMenu?: boolean;
    onMenuPress?: () => void;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
    paramsData?: unknown;
}

export const RoadmapCard: React.FC<Props> = ({
    data,
    onPress,
    showMenu,
    onMenuPress,
    selectionMode = false,
    isSelected = false,
    onToggleSelection,
}) => {
    const isCompleted = data.status === 'completed';
    const hasProgress = data.taskProgress && !isCompleted;
    const showArrow = data.showArrow && !isCompleted;
    const hasActions = showMenu || showArrow;
    const cardPressHandler = selectionMode ? onToggleSelection : onPress;

    const progressPercentage = useMemo(() => {
        return data.taskProgress
            ? Math.min(100, (data.taskProgress.completed / data.taskProgress.total) * 100)
            : 0;
    }, [data.taskProgress]);

    const showCompletionTimeOnLeft = data.completionTime && data.status;

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

            {data.phaseNumber ? (
                <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>Phase {data.phaseNumber}</Text>
                </View>
            ) : null}

            {isCompleted ? (
                <View style={styles.checkmarkOverlay}>
                    <Ionicons name="checkmark" size={32} color="#fff" />
                </View>
            ) : null}
        </View>
    );

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

    const menuButton =
        showMenu && onMenuPress ? (
            <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={1}
                hitSlop={16}
                onPress={onMenuPress}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
            >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
        ) : null;

    const cardBody = (
        <>
            {selectionMode ? (
                <View style={styles.selectionCheckbox}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                    </View>
                </View>
            ) : null}

            <View style={[styles.inner, !hasActions && styles.innerNoActions]}>
                <View style={[styles.left, !hasActions && styles.leftNoActions]}>
                    {renderImage()}
                </View>

                <View style={[styles.right, !hasActions && styles.rightNoActions]}>
                    <View style={styles.titleRow}>
                        <Text
                            style={[
                                styles.title,
                                !hasActions && styles.titleNoActions,
                                menuButton && styles.titleWithMenu,
                            ]}
                            numberOfLines={2}
                        >
                            {data.title}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {data.description ? (
                            <Text
                                style={[
                                    styles.description,
                                    !hasActions && styles.descriptionNoActions,
                                ]}
                            >
                                {data.description}
                            </Text>
                        ) : null}
                        {showArrow && hasActions ? (
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="rgba(255,255,255,0.6)"
                            />
                        ) : null}
                    </View>

                    {showCompletionTimeOnLeft ? (
                        <Text style={styles.completionTime}>
                            {data.completionTime?.replace('\n', '')}
                        </Text>
                    ) : null}

                    {data.completionTime && !data.status ? (
                        <Text
                            style={[
                                styles.completionTimeText,
                                !hasActions && styles.completionTimeTextNoActions,
                            ]}
                        >
                            {data.completionTime}
                        </Text>
                    ) : null}

                    {renderProgressSection()}

                    {isCompleted && data.completedDate ? (
                        <Text
                            style={[
                                styles.completedDate,
                                !hasActions && styles.completedDateNoActions,
                            ]}
                        >
                            Completed on : {data.completedDate}
                        </Text>
                    ) : null}
                </View>
            </View>
        </>
    );

    if (selectionMode || onPress) {
        const Wrapper = selectionMode ? TouchableOpacity : Pressable;
        return (
            <View style={styles.cardOuter} pointerEvents="box-none">
                <Wrapper
                    style={[styles.card, selectionMode && isSelected && styles.cardSelected]}
                    onPress={cardPressHandler}
                >
                    {cardBody}
                </Wrapper>
                {menuButton}
            </View>
        );
    }

    return (
        <View style={styles.cardOuter} pointerEvents="box-none">
            <View style={styles.card}>{cardBody}</View>
            {menuButton}
        </View>
    );
};

const styles = StyleSheet.create({
    cardOuter: {
        position: 'relative',
        marginBottom: 18,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        padding: 12,
    },
    menuButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 20,
        padding: 4,
    },
    cardSelected: {
        borderColor: '#7B3FF2',
        borderWidth: 2,
        backgroundColor: 'rgba(123, 63, 242, 0.1)',
    },
    selectionCheckbox: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#7B3FF2',
        borderColor: '#7B3FF2',
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
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 23,
        paddingRight: 40,
        minWidth: 0,
    },
    titleWithMenu: {
        paddingRight: 28,
    },
    titleNoActions: {
        paddingRight: 0,
    },
    description: {
        fontSize: 12,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 10,
        lineHeight: 18,
        width: '80%',
    },
    descriptionNoActions: {
        paddingRight: 0,
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
