// components/FieldRenderers/TextDisplayRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TextDisplayRendererProps {
    field: {
        id: string;
        type: 'text_display';
        name: string;
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export const TextDisplayRenderer: React.FC<TextDisplayRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.typeLabel}>
                <Text style={styles.typeLabelText}>Text Display</Text>
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

            <View style={styles.displayBox}>
                <Text style={styles.displayText}>{field.name}</Text>
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
    displayBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    displayText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default TextDisplayRenderer;
