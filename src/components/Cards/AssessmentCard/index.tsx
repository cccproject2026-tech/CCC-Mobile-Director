import { AssessmentProgress } from '@/types/progress.types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    data: AssessmentProgress;
    onDevelopmentPlanPress?: () => void;
}

export const AssessmentCard: React.FC<Props> = ({ data, onDevelopmentPlanPress }) => {
    const isCompleted = data.status.toLowerCase() === 'completed';

    const renderCustomizedBadge = () => (
        <TouchableOpacity
            onPress={() => {
                console.log('Development Plan button pressed', { data: data.title, onDevelopmentPlanPress });
                onDevelopmentPlanPress?.();
            }}
            style={styles.customBadge}>
            <Text style={styles.customBadgeText}>Customized Development Plans</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image source={data.image} style={styles.image} />
                </View>

                <View style={styles.textContent}>
                    <Text style={styles.title} numberOfLines={2}>{data.title}</Text>
                    {data.description && <Text style={styles.description} numberOfLines={2}>{data.description}</Text>}
                    {isCompleted && renderCustomizedBadge()}
                    {data.submittedDate ? (
                        <Text style={styles.dateText}>Submitted on : {data.submittedDate}</Text>
                    ) : data.dueDate ? (
                        <Text style={styles.dateText}>Due : {data.dueDate}</Text>
                    ) : null}
                </View>
            </View>
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
    },
    content: {
        flexDirection: 'row',
        padding: 14,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    imageContainer: {
        width: '28%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 14,
        flexShrink: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    customBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1.5,
        borderColor: 'rgba(0, 255, 255, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        marginBottom: 8,
    },
    customBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFD700',
    },
    dateText: {
        fontSize: 12.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.68)',
        marginTop: 2,
    },
});

export default AssessmentCard;
