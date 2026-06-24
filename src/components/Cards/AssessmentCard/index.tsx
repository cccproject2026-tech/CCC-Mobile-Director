// components/Cards/AssessmentCard.tsx
import { ApiAssessment, AssignedAssessmentView } from '@/types/assessment.types';
import {
    formatDueDateLabel,
    isOverdue,
} from '@/utils/assignedAssessmentParser';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    data: ApiAssessment | AssignedAssessmentView;
    onPress?: () => void;
    onDevelopmentPlanPress?: () => void;
    showMenu?: boolean;
    onMenuPress?: () => void;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
}

export const AssessmentCard: React.FC<Props> = ({
    data,
    onPress,
    onDevelopmentPlanPress,
    showMenu = false,
    onMenuPress,
    selectionMode = false,
    isSelected = false,
    onToggleSelection,
}) => {
    const sections = data.sections ?? [];
    const assignments = data.assignments ?? [];
    const preSurvey = data.preSurvey ?? [];
    const displayName = data.name ?? (data as { title?: string }).title ?? '';
    const createdAt = data.createdAt ?? (data as { completedOn?: string }).completedOn;
    const extended = data as AssignedAssessmentView;
    const dueDate = extended.dueDate;
    const progressStatus = extended.progressStatus;
    const overdue = isOverdue(dueDate, progressStatus);
    const statusLabel = progressStatus
        ? progressStatus.replace(/_/g, ' ')
        : undefined;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handlePress = () => {
        if (selectionMode && onToggleSelection) {
            onToggleSelection();
        } else if (onPress) {
            onPress();
        }
    };

    const renderTypeBadge = () => (
        <View style={[
            styles.typeBadge,
            data.type === 'CMA' ? styles.typeCMA : styles.typePMP
        ]}>
            <Text style={styles.typeBadgeText}>{data.type || 'PMP'}</Text>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statText}>
                    {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                </Text>
            </View>
            {preSurvey.length > 0 && (
                <View style={styles.statDot}>
                    <Text style={styles.statText}>•</Text>
                </View>
            )}
            {preSurvey.length > 0 && (
                <View style={styles.statItem}>
                    <Text style={styles.statText}>
                        {preSurvey.length} Pre-Survey
                    </Text>
                </View>
            )}
            {assignments.length > 0 && (
                <>
                    <View style={styles.statDot}>
                        <Text style={styles.statText}>•</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statText}>
                            {assignments.length} Assigned
                        </Text>
                    </View>
                </>
            )}
        </View>
    );

    return (
        <View style={styles.card}>
            <Pressable style={styles.content} onPress={handlePress}>
                {/* Checkbox - only in selection mode */}
                {selectionMode && (
                    <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
                        </View>
                    </View>
                )}

                <View style={styles.imageContainer}>
                    <Image
                        source={data.bannerImage ? { uri: data.bannerImage } : require('@/assets/images/app/jumpstart.png')}
                        style={styles.image}
                    />
                    {renderTypeBadge()}
                </View>

                <View style={[styles.textContent, showMenu && onMenuPress && styles.textContentWithMenu]}>
                    <Text style={styles.title} numberOfLines={2}>{displayName}</Text>
                    {data.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {data.description}
                        </Text>
                    )}
                    {renderStats()}
                    {dueDate ? (
                        <View style={styles.chipRow}>
                            <View style={[styles.dueChip, overdue && styles.dueChipOverdue]}>
                                <Ionicons
                                    name={overdue ? 'alert-circle' : 'calendar-outline'}
                                    size={12}
                                    color={overdue ? '#ffb3b3' : 'rgba(255,255,255,0.85)'}
                                />
                                <Text style={[styles.dueChipText, overdue && styles.dueChipTextOverdue]}>
                                    Due: {formatDueDateLabel(dueDate)}
                                    {overdue ? ' (Overdue)' : ''}
                                </Text>
                            </View>
                            {statusLabel ? (
                                <View style={styles.statusChip}>
                                    <Text style={styles.statusChipText}>{statusLabel}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : null}
                    {createdAt ? (
                        <Text style={styles.dateText}>
                            Created on: {formatDate(createdAt)}
                        </Text>
                    ) : null}
                </View>
            </Pressable>

            {showMenu && onMenuPress ? (
                <TouchableOpacity
                    style={styles.menuButton}
                    activeOpacity={1}
                    hitSlop={16}
                    onPress={onMenuPress}
                    accessibilityRole="button"
                    accessibilityLabel="Open menu"
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color="#fff"
                    />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        marginBottom: 14,
        position: 'relative',
    },
    menuButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 20,
        padding: 4,
    },
    content: {
        flexDirection: 'row',
        padding: 14,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        marginRight: 12,
        paddingTop: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    imageContainer: {
        width: '28%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 14,
        flexShrink: 0,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    typeBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeCMA: {
        backgroundColor: 'rgba(94, 179, 209, 0.9)',
    },
    typePMP: {
        backgroundColor: 'rgba(255, 179, 71, 0.9)',
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    textContent: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'flex-start',
    },
    textContentWithMenu: {
        paddingRight: 24,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
        lineHeight: 23,
    },
    description: {
        fontSize: 13.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 10,
        lineHeight: 18,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    statItem: {
        marginRight: 4,
    },
    statDot: {
        marginHorizontal: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.68)',
    },
    dateText: {
        fontSize: 12.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.68)',
        marginTop: 2,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    dueChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dueChipOverdue: {
        backgroundColor: 'rgba(255,80,80,0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,120,120,0.4)',
    },
    dueChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
    },
    dueChipTextOverdue: {
        color: '#ffb3b3',
    },
    statusChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(94,179,209,0.25)',
    },
    statusChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'capitalize',
    },
});

export default AssessmentCard;
