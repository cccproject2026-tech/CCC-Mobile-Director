import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { ColorValue, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

export interface RecurringAvailability {
  type: 'weekly' | 'monthly' | 'custom';
  // For weekly: [0-6] where 0 = Sunday, 1 = Monday, etc.
  daysOfWeek?: number[];
  // For monthly: [1-31] days of month
  daysOfMonth?: number[];
  // For custom: function to determine if date is available
  customCheck?: (date: string) => boolean;
}

interface GradientCalendarProps {
  selected: string;
  setSelected: (date: string) => void;
  containerStyle?: ViewStyle;
  gradientColors?: string[];

  // Availability Options
  availableDates?: string[]; // Specific available dates
  unavailableDates?: string[]; // Specific unavailable dates (booked slots)
  recurringAvailability?: RecurringAvailability; // Recurring patterns

  // Behavior Options
  disablePastDates?: boolean; // Default: true for scheduling
  showHeader?: boolean;
  minDate?: string;
  maxDate?: string;

  // Styling Options
  markToday?: boolean; // Show red dot on today
}

const GradientCalendar: React.FC<GradientCalendarProps> = ({
  selected,
  setSelected,
  containerStyle,
  gradientColors = ["#176192", "#1D548D", "#0d2847"],
  availableDates,
  unavailableDates = [],
  recurringAvailability,
  disablePastDates = true,
  showHeader = true,
  minDate,
  maxDate,
  markToday = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date().toISOString().split('T')[0];

  // Check if a date is available based on all rules
  const isDateAvailable = (dateStr: string): boolean => {
    // Check if date is in unavailable list (booked)
    if (unavailableDates.includes(dateStr)) {
      return false;
    }

    // Check if past date and disablePastDates is true
    if (disablePastDates && dateStr < today) {
      return false;
    }

    // If specific available dates provided, use that list
    if (availableDates && availableDates.length > 0) {
      return availableDates.includes(dateStr);
    }

    // If recurring availability provided, check pattern
    if (recurringAvailability) {
      const date = new Date(dateStr);

      if (recurringAvailability.type === 'weekly' && recurringAvailability.daysOfWeek) {
        const dayOfWeek = date.getDay();
        return recurringAvailability.daysOfWeek.includes(dayOfWeek);
      }

      if (recurringAvailability.type === 'monthly' && recurringAvailability.daysOfMonth) {
        const dayOfMonth = date.getDate();
        return recurringAvailability.daysOfMonth.includes(dayOfMonth);
      }

      if (recurringAvailability.type === 'custom' && recurringAvailability.customCheck) {
        return recurringAvailability.customCheck(dateStr);
      }
    }

    // Default: all dates available (if no restrictions)
    return true;
  };

  const handleDayPress = (day: DateData): void => {
    if (isDateAvailable(day.dateString)) {
      setSelected(day.dateString);
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const monthYearString = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Build marked dates object
  const markedDates = useMemo(() => {
    const marked: any = {};

    // Get date range for current month (and a bit extra for safety)
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month + 2, 0);

    // Mark all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isAvailable = isDateAvailable(dateStr);

      marked[dateStr] = {
        disabled: !isAvailable,
        disableTouchEvent: !isAvailable,
        customStyles: {
          container: {},
          text: {
            color: isAvailable ? '#fff' : 'rgba(255,255,255,0.3)',
            fontWeight: isAvailable ? '500' : '400',
          },
        },
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Mark today with red dot
    if (markToday && marked[today]) {
      marked[today] = {
        ...marked[today],
        marked: true,
        dotColor: '#FF4444',
        customStyles: {
          ...marked[today].customStyles,
          container: {
            ...marked[today].customStyles?.container,
          },
          text: {
            ...marked[today].customStyles?.text,
            fontWeight: '600',
          },
        },
      };
    }

    // Mark selected date with border
    if (selected && marked[selected]) {
      marked[selected] = {
        ...marked[selected],
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: '#fff',
            borderRadius: 50,
            backgroundColor: 'transparent',
          },
          text: {
            color: '#fff',
            fontWeight: '700',
          },
        },
      };
    }

    return marked;
  }, [
    currentMonth,
    selected,
    today,
    availableDates,
    unavailableDates,
    recurringAvailability,
    disablePastDates,
    markToday
  ]);

  return (
    <View style={containerStyle}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Available Date</Text>
        </View>
      )}

      <LinearGradient
        colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]}
        style={styles.container}
      >
        {/* Month/Year Navigation Header */}
        <View style={styles.monthHeader}>
          <Pressable onPress={handlePrevMonth} hitSlop={12} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>

          <Text style={styles.monthText}>{monthYearString}</Text>

          <Pressable onPress={handleNextMonth} hitSlop={12} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            key={currentMonth.toISOString()}
            current={currentMonth.toISOString().split('T')[0]}
            onDayPress={handleDayPress}
            markingType="custom"
            markedDates={markedDates}
            minDate={minDate || (disablePastDates ? today : undefined)}
            maxDate={maxDate}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#fff",
              selectedDayBackgroundColor: "transparent",
              selectedDayTextColor: "#fff",
              todayTextColor: "#fff",
              dayTextColor: "#fff",
              textDisabledColor: "rgba(255,255,255,0.3)",
              textDayFontSize: 16,
              textDayFontWeight: "500",
              arrowColor: "transparent",
              monthTextColor: "transparent",
              // textMonthFontSize: 0,
            }}
            style={{
              backgroundColor: "transparent",
            }}
            hideArrows={true}
            hideDayNames={false}
            hideExtraDays={true}
            disableMonthChange={true}
            enableSwipeMonths={false}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  navButton: {
    padding: 4,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  calendarWrapper: {
    backgroundColor: "transparent",
  },
});

export default GradientCalendar;
