// components/DynamicField/DynamicFieldRenderer.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DynamicFieldDefinition, StaticFieldDefinition } from '@/types/user.types';

interface DynamicFieldRendererProps {
    field: StaticFieldDefinition | DynamicFieldDefinition;
    value: any;
    isEditing: boolean;
    onValueChange: (fieldId: string, value: any) => void;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
    field,
    value,
    isEditing,
    onValueChange,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const renderEditField = () => {
        switch (field.type) {
            case 'text_field':
            case 'phone':
            case 'email':
                return (
                    <TextInput
                        style={styles.editInput}
                        value={value || ''}
                        onChangeText={(text) => onValueChange(field.fieldId, text)}
                        placeholder={field.label}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        keyboardType={
                            field.type === 'phone' ? 'phone-pad' :
                                field.type === 'email' ? 'email-address' : 'default'
                        }
                    />
                );

            case 'text_area':
                return (
                    <TextInput
                        style={[styles.editInput, styles.textArea]}
                        value={value || ''}
                        onChangeText={(text) => onValueChange(field.fieldId, text)}
                        placeholder={field.label}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        multiline
                        numberOfLines={4}
                    />
                );

            case 'select':
                return (
                    <View>
                        <TouchableOpacity
                            style={[styles.editInput, styles.dropdownInput]}
                            onPress={() => setShowDropdown(!showDropdown)}
                        >
                            <Text style={styles.dropdownText}>
                                {value || `Select ${field.label}`}
                            </Text>
                            <Ionicons
                                name={showDropdown ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color="rgba(255,255,255,0.7)"
                            />
                        </TouchableOpacity>
                        {showDropdown && (
                            <View style={styles.dropdownContainer}>
                                {field.options?.map((option, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.dropdownOption}
                                        onPress={() => {
                                            onValueChange(field.fieldId, option);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownOptionText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                );

            case 'checkbox':
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <View style={styles.checkboxContainer}>
                        {field.options?.map((option, idx) => {
                            const isSelected = selectedValues.includes(option);
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.checkboxItem}
                                    onPress={() => {
                                        const newValues = isSelected
                                            ? selectedValues.filter((v) => v !== option)
                                            : [...selectedValues, option];
                                        onValueChange(field.fieldId, newValues);
                                    }}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        isSelected && styles.checkboxSelected
                                    ]}>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                        )}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{option}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );

            default:
                return <Text style={styles.errorText}>Unsupported field type: {field.type}</Text>;
        }
    };

    const renderViewField = () => {
        let displayValue = value;

        if (field.type === 'checkbox' && Array.isArray(value)) {
            displayValue = value.join(', ');
        }

        return (
            <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>
                    {field.label} : {displayValue || 'Not provided'}
                </Text>
            </View>
        );
    };

    if (!isEditing) {
        return renderViewField();
    }

    return (
        <View style={styles.editFieldContainer}>
            <Text style={styles.fieldLabel}>
                {field.label} {field.required && <Text style={styles.required}>*</Text>}
            </Text>
            {renderEditField()}
        </View>
    );
};

const styles = StyleSheet.create({
    editFieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    required: {
        color: '#ff6b6b',
    },
    editInput: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 13,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        color: '#fff',
        fontSize: 13,
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1E366F',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        zIndex: 1000,
        marginTop: 4,
        maxHeight: 200,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    dropdownOptionText: {
        color: '#fff',
        fontSize: 13,
    },
    checkboxContainer: {
        gap: 12,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1E366F',
        borderColor: '#fff',
    },
    checkboxLabel: {
        color: '#fff',
        fontSize: 13,
    },
    viewField: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
    },
    viewFieldText: {
        color: '#fff',
        fontSize: 13,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 13,
    },
});
