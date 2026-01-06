// components/Cards/AssessmentCard.tsx
import { ApiAssessment } from '@/types/assessment.types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    data: ApiAssessment;
    onPress?: () => void;
    onDevelopmentPlanPress?: () => void;
    // Selection mode props
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: () => void;
}

export const AssessmentCard: React.FC<Props> = ({
    data,
    onPress,
    onDevelopmentPlanPress,
    selectionMode = false,
    isSelected = false,
    onToggleSelection,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
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
                    {data.sections.length} {data.sections.length === 1 ? 'Section' : 'Sections'}
                </Text>
            </View>
            {data.preSurvey && data.preSurvey.length > 0 && (
                <View style={styles.statDot}>
                    <Text style={styles.statText}>•</Text>
                </View>
            )}
            {data.preSurvey && data.preSurvey.length > 0 && (
                <View style={styles.statItem}>
                    <Text style={styles.statText}>
                        {data.preSurvey.length} Pre-Survey
                    </Text>
                </View>
            )}
            <View style={styles.statDot}>
                <Text style={styles.statText}>•</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statText}>
                    {data.assignments.length} Assigned
                </Text>
            </View>
        </View>
    );

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
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

                <View style={styles.textContent}>
                    <Text style={styles.title} numberOfLines={2}>{data.name}</Text>
                    {data.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {data.description}
                        </Text>
                    )}
                    {renderStats()}
                    <Text style={styles.dateText}>
                        Created on: {formatDate(data.createdAt)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
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
});

export default AssessmentCard;
