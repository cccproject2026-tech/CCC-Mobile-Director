import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface FormTextAreaProps {
    value: string;
    placeholder: string;
    onChangeText: (text: string) => void;
    isEditMode: boolean;
}

export default function FormTextArea({
    value,
    placeholder,
    onChangeText,
    isEditMode,
}: FormTextAreaProps) {
    if (!isEditMode) {
        return (
            <View style={styles.viewContainer}>
                <Text style={styles.viewText}>{value || placeholder}</Text>
            </View>
        );
    }

    return (
        <TextInput
            style={styles.editInput}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={value}
            onChangeText={onChangeText}
            multiline
            textAlignVertical="top"
        />
    );
}

const styles = StyleSheet.create({
    viewContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 100,
        marginBottom: 12,
    },
    viewText: {
        fontSize: 15,
        color: '#fff',
    },
    editInput: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#fff',
        minHeight: 100,
        marginBottom: 12,
    },
});
