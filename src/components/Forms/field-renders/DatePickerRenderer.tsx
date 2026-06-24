// components/FieldRenderers/DatePickerRenderer.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}

export const DatePickerRenderer: React.FC<DatePickerRendererProps> = ({
    field,
    onEdit,
    onDelete,
}) => {
    const parseDate = (dateValue?: Date | string): Date | null => {
        if (!dateValue) return null;
        if (dateValue instanceof Date) {
            return Number.isNaN(dateValue.getTime()) ? null : dateValue;
        }
        const parsed = new Date(dateValue);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const currentDate = parseDate(field.date);

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.typeLabel}>Date Picker</Text>
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

            <Text style={styles.fieldLabel}>{field.label || 'date'}</Text>

            <View style={styles.dateInput}>
                <Ionicons name="calendar-outline" size={18} color="#5BC0EB" />
                <Text
                    style={[
                        styles.dateText,
                        !currentDate && styles.datePlaceholder,
                    ]}
                >
                    {currentDate ? formatDisplayDate(currentDate) : 'dd/mm/yyyy'}
                </Text>
            </View>

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
    typeLabel: {
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
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        opacity: 0.85,
    },
    dateText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    datePlaceholder: {
        color: 'rgba(255,255,255,0.55)',
        fontWeight: '400',
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
