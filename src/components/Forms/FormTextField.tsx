import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface FormTextFieldProps {
    value: string;
    placeholder: string;
    onChangeText: (text: string) => void;
    isEditMode: boolean;
    showClearButton?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
}

export default function FormTextField({
    value,
    placeholder,
    onChangeText,
    isEditMode,
    showClearButton = false,
    keyboardType = 'default',
}: FormTextFieldProps) {
    if (!isEditMode) {
        return (
            <View style={styles.viewContainer}>
                <TextInput
                    style={styles.viewText}
                    value={value || placeholder}
                    editable={false}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                />
            </View>
        );
    }

    return (
        <View style={styles.editContainer}>
            <TextInput
                style={styles.editInput}
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
            {showClearButton && value !== '' && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => onChangeText('')}
                >
                    <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    viewContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        marginBottom: 12,
    },
    viewText: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#fff',
    },
    editContainer: {
        position: 'relative',
        marginBottom: 12,
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
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
    },
});
