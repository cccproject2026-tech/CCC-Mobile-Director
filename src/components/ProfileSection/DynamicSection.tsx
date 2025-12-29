// components/ProfileSection/DynamicSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { DynamicFieldDefinition, StaticFieldDefinition } from '@/types/user.types';

interface DynamicSectionProps {
    sectionName: string;
    fields: (StaticFieldDefinition | DynamicFieldDefinition)[];
    values: Record<string, any>;
    isEditing: boolean;
    onValueChange: (fieldId: string, value: any) => void;
    hideTitle?: boolean; // NEW: Option to hide section title
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({
    sectionName,
    fields,
    values,
    isEditing,
    onValueChange,
    hideTitle = false,
}) => {
    // Sort fields by order (dynamic fields have order, static don't)
    const sortedFields = [...fields].sort((a, b) => {
        const orderA = 'order' in a ? a.order : 0;
        const orderB = 'order' in b ? b.order : 0;
        return orderA - orderB;
    });

    if (sortedFields.length === 0) {
        return null;
    }

    return (
        <View style={isEditing ? styles.editSection : styles.viewSection}>
            {!hideTitle && sectionName && (
                <Text style={styles.sectionTitle}>{sectionName}</Text>
            )}
            {sortedFields.map((field) => (
                <DynamicFieldRenderer
                    key={field.fieldId}
                    field={field}
                    value={values[field.fieldId]}
                    isEditing={isEditing}
                    onValueChange={onValueChange}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    viewSection: {
        marginBottom: 16,
    },
    editSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
});
