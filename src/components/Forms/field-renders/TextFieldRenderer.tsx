import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CustomField } from '@/hooks/roadmap/useRoadmapForm';

interface TextFieldRendererProps {
    field: CustomField;
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
}

export default function TextFieldRenderer({ field, onEdit, onDelete }: TextFieldRendererProps) {
    return (
        <View style={styles.container}>
            <View style={styles.typeLabel}>
                <Text style={styles.typeLabelText}>Text Field</Text>
            </View>

            <View style={styles.header}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => onEdit(field.id)} hitSlop={10}>
                        <Ionicons name="create-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(field.id)} hitSlop={10}>
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="rgba(255,255,255,0.5)"
                editable={false}
            />
        </View>
    );
}

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
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 15,
    },
});
