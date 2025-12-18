import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FormDropdownProps {
    value: string;
    placeholder: string;
    onPress: () => void;
    isEditMode: boolean;
}

export default function FormDropdown({
    value,
    placeholder,
    onPress,
    isEditMode,
}: FormDropdownProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            disabled={!isEditMode}
        >
            <Text style={styles.text}>{value || placeholder}</Text>
            <Ionicons
                name="chevron-down"
                size={20}
                color={isEditMode ? "#fff" : "rgba(255,255,255,0.6)"}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        color: '#fff',
    },
});
