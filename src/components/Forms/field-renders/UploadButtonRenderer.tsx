// components/FieldRenderers/UploadButtonRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UploadButtonRendererProps {
    field: {
        id: string;
        type: 'upload';
        buttonName?: string;
        buttonLabel?: string;
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export const UploadButtonRenderer: React.FC<UploadButtonRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    const displayName = (field.buttonName || field.buttonLabel || 'upload').toLowerCase();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="cloud-upload-outline" size={18} color="#5BC0EB" />
                    <Text style={styles.typeLabel}>{displayName}</Text>
                </View>
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

            <View style={styles.dropZone}>
                <View style={styles.plusCircle}>
                    <Ionicons name="add" size={28} color="#fff" />
                </View>
                <Text style={styles.dropZoneTitle}>
                    Drag & Drop or Click here to choose file
                </Text>
                <Text style={styles.dropZoneSubtitle}>
                    Supports images, documents, and videos · Max file size : 10 MB
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
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    typeLabel: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    dropZone: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.35)',
        borderRadius: 14,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        gap: 10,
    },
    plusCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    dropZoneTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 22,
    },
    dropZoneSubtitle: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 8,
    },
});

export default UploadButtonRenderer;
