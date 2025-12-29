// components/FieldRenderers/DatePickerRenderer.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerRendererProps {
    field: {
        id: string;
        type: 'datepicker';
        label: string;
        date?: Date | string;
        buttonName?: string;
        allowPastorSelect?: boolean;
        showOnCard?: boolean;
    };
    onEdit: (fieldId: string) => void;
    onDelete: (fieldId: string) => void;
    onDateChange?: (fieldId: string, date: Date) => void; // ✅ New prop
}

export const DatePickerRenderer: React.FC<DatePickerRendererProps> = ({
    field,
    onEdit,
    onDelete,
    onDateChange,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const parseDate = (dateValue?: Date | string): Date => {
        if (!dateValue) {
            return new Date();
        }
        if (typeof dateValue === 'string') {
            return new Date(dateValue);
        }
        return dateValue;
    };

    const currentDate = parseDate(field.date);

    const formatDate = (date: Date) => {
        if (isNaN(date.getTime())) {
            date = new Date();
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day} - ${month} - ${year}`;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate && onDateChange) {
            onDateChange(field.id, selectedDate);
        }
    };

    const handleDatePress = () => {
        // ✅ Only allow date selection if pastor cannot select OR if we're in edit mode
        if (!field.allowPastorSelect) {
            setShowPicker(true);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Date Picker</Text>
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

            <Text style={styles.fieldLabel}>{field.label}</Text>

            {/* ✅ Clickable date input */}
            <TouchableOpacity
                style={styles.dateInput}
                onPress={handleDatePress}
                disabled={field.allowPastorSelect} // ✅ Disable if pastor can select
            >
                <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
                {!field.allowPastorSelect && (
                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                )}
            </TouchableOpacity>

            {/* ✅ Date Picker */}
            {showPicker && (
                <DateTimePicker
                    value={currentDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    textColor="#fff"
                />
            )}

            {/* iOS: Show Done button */}
            {showPicker && Platform.OS === 'ios' && (
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowPicker(false)}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            )}

            {/* Checkboxes */}
            {field.allowPastorSelect && (
                <View style={styles.checkboxRow}>
                    <Ionicons name="checkbox" size={20} color="#fff" />
                    <Text style={styles.checkboxText}>Allow Pastor to Select Date</Text>
                </View>
            )}

            {field.showOnCard && (
                <View style={styles.checkboxRow}>
                    <Ionicons name="checkbox" size={20} color="#fff" />
                    <Text style={styles.checkboxText}>Show Date on Info card</Text>
                </View>
            )}
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
    fieldLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    dateInput: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
        fontSize: 15,
    },
    doneButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    checkboxText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default DatePickerRenderer;
