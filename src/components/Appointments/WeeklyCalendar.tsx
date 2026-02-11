import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

interface WeeklyCalendarProps {
    selectedDate: string; // ISO format (YYYY-MM-DD)
    onDateSelect: (date: string) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ selectedDate, onDateSelect }) => {
    const selected = new Date(selectedDate);
    
    // Calculate the start of the week for the selected date
    const weekStart = startOfWeek(selected, { weekStartsOn: 0 }); // Sunday start

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(weekStart, i);
            return {
                date,
                dayName: format(date, 'EEEEEE').toUpperCase(), // S M T W T F S
                dayNumber: format(date, 'd'),
                isSelected: isSameDay(date, selected),
                dateStr: format(date, 'yyyy-MM-dd'),
            };
        });
    }, [weekStart, selected]);

    const handlePrevWeek = () => {
        onDateSelect(format(subWeeks(selected, 1), 'yyyy-MM-dd'));
    };

    const handleNextWeek = () => {
        onDateSelect(format(addWeeks(selected, 1), 'yyyy-MM-dd'));
    };

    const monthYear = format(selected, 'MMMM yyyy');

    return (
        <View style={styles.container}>
            {/* <LinearGradient
                colors={['#000000', '#000000']}
                style={styles.gradient}
            > */}
                <View style={styles.navBar}>
                    <Pressable onPress={handlePrevWeek} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                    </Pressable>
                    <Text style={styles.monthTitle}>{monthYear}</Text>
                    <Pressable onPress={handleNextWeek} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </Pressable>
                </View>

                <View style={styles.weekRow}>
                    {weekDays.map((day) => (
                        <Pressable
                            key={day.dateStr}
                            style={[
                                styles.dayColumn,
                                day.isSelected && styles.selectedDayColumn
                            ]}
                            onPress={() => onDateSelect(day.dateStr)}
                        >
                            <Text style={[styles.dayName, day.isSelected && styles.selectedDayName]}>
                                {day.dayName}
                            </Text>
                            <View style={[
                                styles.dateCircle,
                                day.isSelected && styles.selectedDateCircle
                            ]}>
                                <Text style={[styles.dayNumber, day.isSelected && styles.selectedDayNumber]}>
                                    {day.dayNumber}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            {/* </LinearGradient> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // borderRadius: 20,
        marginVertical: 10,
        overflow: 'hidden',
    },
    gradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        // borderRadius: 20,
    },
    navBar: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    navButton: {
        padding: 4,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayColumn: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 12,
        width: '13%',
    },
    selectedDayColumn: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    dayName: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 8,
    },
    selectedDayName: {
        color: '#FFFFFF',
    },
    dateCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedDateCircle: {
        // color: '#FFFFFF',
        // backgroundColor: '#FFFFFF',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    selectedDayNumber: {
        color: '#ffffff',
    },
});

export default WeeklyCalendar;
