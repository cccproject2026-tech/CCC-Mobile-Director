import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FormCheckboxProps {
    label: string;
    value: boolean;
    onToggle: () => void;
    isEditMode: boolean;
}

export default function FormCheckbox({
    label,
    value,
    onToggle,
    isEditMode,
}: FormCheckboxProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onToggle}
            disabled={!isEditMode}
        >
            <View style={[
                styles.checkbox,
                value && (isEditMode ? styles.checkboxCheckedEdit : styles.checkboxCheckedView)
            ]}>
                {value && (
                    <Ionicons
                        name="checkmark"
                        size={14}
                        color={isEditMode ? "#1A4882" : "#fff"}
                    />
                )}
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 4,
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxCheckedEdit: {
        backgroundColor: '#fff',
    },
    checkboxCheckedView: {
        backgroundColor: 'transparent',
    },
    label: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
    },
});
