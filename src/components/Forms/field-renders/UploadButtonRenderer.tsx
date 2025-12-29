// components/FieldRenderers/UploadButtonRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadButtonRendererProps {
    field: {
        id: string;
        type: 'upload';
        buttonLabel?: string; // ✅ Made optional
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export const UploadButtonRenderer: React.FC<UploadButtonRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Upload Button</Text>
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

            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.7}>
                <Ionicons name="attach-outline" size={20} color="#1A4882" />
                {/* ✅ Show button label or default text */}
                <Text style={styles.uploadButtonText}>
                    {field.buttonLabel || 'Upload'}
                </Text>
            </TouchableOpacity>
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
    uploadButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    uploadButtonText: {
        color: '#1A4882',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default UploadButtonRenderer;
