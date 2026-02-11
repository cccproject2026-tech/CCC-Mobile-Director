import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TimeSlot {
    id: string;
    start: string;
    end: string;
}

export interface DayAvailability {
    enabled: boolean;
    slots: TimeSlot[];
}

export interface WeeklyAvailability {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
}

interface AvailableHoursProps {
    availability: WeeklyAvailability;
    onToggleDay: (day: keyof WeeklyAvailability) => void;
    onAddSlot: (day: keyof WeeklyAvailability) => void;
    onRemoveSlot: (day: keyof WeeklyAvailability, slotId: string) => void;
}

const AvailableHours: React.FC<AvailableHoursProps> = ({
    availability,
    onToggleDay,
    onAddSlot,
    onRemoveSlot
}) => {
    const dayNames: { key: keyof WeeklyAvailability, label: string }[] = [
        { key: "monday", label: "Mon" },
        { key: "tuesday", label: "Tue" },
        { key: "wednesday", label: "Wed" },
        { key: "thursday", label: "Thu" },
        { key: "friday", label: "Fri" },
        { key: "saturday", label: "Sat" },
        { key: "sunday", label: "Sun" },
    ];

    return (
        <View style={styles.container}>
            {dayNames.map(({ key, label }, index) => (
                <View key={key} style={[
                    styles.dayRow,
                    index === dayNames.length - 1 && styles.lastDayRow
                ]}>
                    <View style={styles.leftSection}>
                        <Pressable
                            style={[
                                styles.checkbox,
                                availability[key].enabled && styles.checkboxActive
                            ]}
                            onPress={() => onToggleDay(key)}
                        >
                            {availability[key].enabled && (
                                <Ionicons name="checkmark" size={14} color="#1E3A6F" />
                            )}
                        </Pressable>
                        <Text style={styles.dayLabel}>{label}</Text>
                    </View>

                    <View style={styles.rightSection}>
                        {availability[key].enabled && availability[key].slots.map((slot, sIdx) => (
                            <View key={slot.id} style={styles.slotRow}>
                                <View style={styles.timeInputsWrapper}>
                                    <View style={styles.timeInput}>
                                        <Text style={styles.timeText}>{slot.start}</Text>
                                        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.7)" />
                                    </View>
                                    <Text style={styles.separator}>-</Text>
                                    <View style={styles.timeInput}>
                                        <Text style={styles.timeText}>{slot.end}</Text>
                                        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.7)" />
                                    </View>
                                </View>
                                
                                {availability[key].slots.length > 1 && (
                                    <Pressable 
                                        onPress={() => onRemoveSlot(key, slot.id)}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
                                    </Pressable>
                                )}
                            </View>
                        ))}

                        {availability[key].enabled && (
                            <Pressable 
                                style={styles.addButton}
                                onPress={() => onAddSlot(key)}
                            >
                                <Ionicons name="add" size={16} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.addText}>Add</Text>
                            </Pressable>
                        )}
                        
                        {!availability[key].enabled && (
                            <View style={styles.unavailableWrapper}>
                                <Text style={styles.unavailableText}>Unavailable</Text>
                            </View>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0F2B6B',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dayRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    lastDayRow: {
        borderBottomWidth: 0,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: 80,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    dayLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    rightSection: {
        flex: 1,
    },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    timeInputsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        minWidth: 90,
    },
    timeText: {
        color: '#FFFFFF',
        fontSize: 13,
    },
    separator: {
        color: 'rgba(255,255,255,0.5)',
        marginHorizontal: 8,
    },
    removeButton: {
        padding: 4,
        marginLeft: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    addText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        marginLeft: 4,
    },
    unavailableWrapper: {
        justifyContent: 'center',
        height: 40,
    },
    unavailableText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default AvailableHours;
