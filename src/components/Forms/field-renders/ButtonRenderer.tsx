// components/FieldRenderers/ButtonRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonRendererProps {
    field: {
        id: string;
        type: 'button';
        name: string;
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export const ButtonRenderer: React.FC<ButtonRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.typeLabel}>
                <Text style={styles.typeLabelText}>Action Button</Text>
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

            <View style={styles.buttonPreview}>
                <Text style={styles.buttonPreviewText}>
                    {field.name || 'Action Button'}
                </Text>
            </View>
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
    buttonPreview: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    buttonPreviewText: {
        color: '#1A4882',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ButtonRenderer;
