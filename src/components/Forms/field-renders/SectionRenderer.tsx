// components/FieldRenderers/SectionRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SectionRendererProps {
    field: {
        id: string;
        type: 'section';
        name: string;
        buttonName?: string;
        showDuplicateButton?: boolean;
    };
    nestedFields: any[];
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
    onAddNestedField: () => void;
    renderNestedField: (field: any) => React.ReactNode;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
    field,
    nestedFields,
    onEdit,
    onDelete,
    onAddNestedField,
    renderNestedField,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Section</Text>
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

            <Text style={styles.sectionName}>{field.name}</Text>

            {/* Show duplicate button checkbox - Just for display */}
            {field.showDuplicateButton && (
                <View style={styles.checkboxRow}>
                    <Ionicons name="checkbox" size={20} color="#fff" />
                    <Text style={styles.checkboxText}>Button to add More Section</Text>
                </View>
            )}

            {/* Nested Fields */}
            {nestedFields.length > 0 && (
                <View style={styles.nestedFieldsContainer}>
                    {nestedFields.map((nestedField) => (
                        <View key={nestedField.id} style={styles.nestedField}>
                            {renderNestedField(nestedField)}
                        </View>
                    ))}
                </View>
            )}

            {/* Insert Field Button (inside section) */}
            <View style={styles.insertFieldContainer}>
                <Text style={styles.insertFieldText}>Insert Field</Text>
                <TouchableOpacity
                    style={styles.inlineAddButton}
                    onPress={onAddNestedField}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={18} color="#1A4882" />
                    <Text style={styles.inlineAddButtonText}>Add Field</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ Show PREVIEW of duplicate button (not functional in director view) */}
            {field.showDuplicateButton && (
                <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Users will see this button:</Text>
                    <View style={styles.duplicateButtonPreview}>
                        <Ionicons name="copy-outline" size={18} color="#7C3AED" />
                        <Text style={styles.duplicateButtonPreviewText}>
                            {field.buttonName || 'Add More Section'}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(100,149,237,0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(100,149,237,0.4)',
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
    sectionName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 12,
    },
    checkboxText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    nestedFieldsContainer: {
        marginTop: 12,
        gap: 8,
    },
    nestedField: {
        marginLeft: 8,
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(255,255,255,0.3)',
        paddingLeft: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    buttonRowLabel: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    insertFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.12)', // Slightly more subtle glass effect
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginTop: 16,
    },
    insertFieldText: {
        color: '#fff',
        fontSize: 16, // Slightly smaller than the main one for hierarchy
        fontWeight: '500',
    },
    inlineAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Solid white look
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    inlineAddButtonText: {
        color: '#1A4882',
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 4,
    },
    addFieldButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C3AED',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        gap: 6,
    },
    addFieldButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    previewContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
    },
    previewLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8,
    },
    duplicateButtonPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: '#7C3AED',
        opacity: 0.7, // ✅ Show it's a preview
    },
    duplicateButtonPreviewText: {
        color: '#7C3AED',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default SectionRenderer;
