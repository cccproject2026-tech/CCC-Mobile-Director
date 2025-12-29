// components/FieldRenderers/AssessmentRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AssessmentRendererProps {
    field: {
        id: string;
        type: 'assessment';
        selectedAssessment?: string | { id: string; name: string;[key: string]: any }; // ✅ Can be string or object
        buttonName?: string;
        scheduleMeeting?: boolean;
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export const AssessmentRenderer: React.FC<AssessmentRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    // ✅ Extract assessment name from string or object
    const getAssessmentName = () => {
        if (!field.selectedAssessment) {
            return 'No Assessment Selected';
        }

        if (typeof field.selectedAssessment === 'string') {
            return field.selectedAssessment;
        }

        // If it's an object, get the name property
        return field.selectedAssessment.name || 'Assessment';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Assessment</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => onEdit(field.id)}
                        style={styles.actionButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(field.id)}
                        style={styles.actionButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ✅ Show assessment name or placeholder */}
            <Text style={styles.assessmentName}>
                {getAssessmentName()}
            </Text>

            {/* ✅ Show button or placeholder */}
            <TouchableOpacity
                style={[
                    styles.assessmentButton,
                    !field.buttonName && styles.assessmentButtonDisabled
                ]}
                activeOpacity={field.buttonName ? 0.7 : 1}
                disabled={!field.buttonName}
            >
                <Text style={styles.assessmentButtonText}>
                    {field.buttonName || 'Take Assessment'}
                </Text>
            </TouchableOpacity>

            {/* Schedule Meeting Checkbox */}
            {field.scheduleMeeting && (
                <View style={styles.checkboxRow}>
                    <Ionicons name="checkbox" size={20} color="#fff" />
                    <Text style={styles.checkboxText}>
                        Schedule Meeting after the Assessment
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    assessmentName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    assessmentButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    assessmentButtonDisabled: {
        opacity: 0.5,
    },
    assessmentButtonText: {
        color: '#1A4882',
        fontSize: 15,
        fontWeight: '600',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    checkboxText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});

export default AssessmentRenderer;
