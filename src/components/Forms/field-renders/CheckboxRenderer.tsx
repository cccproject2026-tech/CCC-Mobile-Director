// components/FieldRenderers/CheckboxRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxRendererProps {
    field: {
        id: string;
        type: 'checkbox_item';
        name: string;
        buttonName?: string;
        haveButton?: boolean;
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export const CheckboxRenderer: React.FC<CheckboxRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.typeLabel}>
                <Text style={styles.typeLabelText}>Check Box</Text>
            </View>

            <View style={styles.header}>
                <Text style={styles.label}>{field.name}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => onEdit(field.id)}
                        hitSlop={10}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(field.id)}
                        hitSlop={10}
                    >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.checkboxRow}>
                <View style={styles.checkboxMock}>
                    <Ionicons name="checkmark" size={14} color="#1A4882" />
                </View>
                <Text style={styles.checkboxMockText}>{field.name}</Text>
            </View>

            {/* ✅ Show action button preview if enabled */}
            {field.haveButton && (
                <View style={styles.buttonPreview}>
                    <Text style={styles.buttonPreviewText}>
                        {field.buttonName || 'Action Button'}
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
        marginBottom: 16,
    },
    typeLabel: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    typeLabelText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    checkboxMock: {
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxMockText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        flex: 1,
    },
    buttonPreview: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    buttonPreviewText: {
        color: '#1A4882',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CheckboxRenderer;
