import WeeklyCalendar from "@/components/Appointments/WeeklyCalendar";
import AvailableHours from "@/components/Appointments/AvailableHours";
import SimpleSuccessModal from "@/components/Appointments/SimpleSuccessModal";
import { Header } from "@/components/Header/Header";
import SearchBar from "@/components/Header/SearchBar";
import TopBar from "@/components/Header/TopBar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useWeeklyAvailability, useSetAvailability } from "@/hooks/useMentorsAvailability";
import { useAuthStore } from "@/stores/auth.store";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/constants";

interface TimeSlot {
    id: string;
    start: string;
    end: string;
}

interface DayAvailability {
    enabled: boolean;
    slots: TimeSlot[];
}

interface WeeklyAvailability {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
}

const AvailabilityScreen = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [activeTab, setActiveTab] = React.useState<
        "appointments" | "availability"
    >("availability");

    // Reset active tab when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setActiveTab("availability");
        }, [])
    );

    const user = useAuthStore((state) => state.user);
    const { availability: apiAvailability, isLoading: isLoadingAvailability } = useWeeklyAvailability(user?.id || null);
    const { setAvailability, isSettingAvailability } = useSetAvailability({
        onSuccess: () => setShowSuccessModal(true),
    });

    // Weekly availability state
    const [weeklyAvailability, setWeeklyAvailability] =
        React.useState<WeeklyAvailability>({
            monday: { enabled: false, slots: [] },
            tuesday: { enabled: false, slots: [] },
            wednesday: { enabled: false, slots: [] },
            thursday: { enabled: false, slots: [] },
            friday: { enabled: false, slots: [] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] },
        });

    useEffect(() => {
        if (apiAvailability?.weeklySlots) {
            const newAvailability: WeeklyAvailability = {
                monday: { enabled: false, slots: [] },
                tuesday: { enabled: false, slots: [] },
                wednesday: { enabled: false, slots: [] },
                thursday: { enabled: false, slots: [] },
                friday: { enabled: false, slots: [] },
                saturday: { enabled: false, slots: [] },
                sunday: { enabled: false, slots: [] },
            };

            const dayNamesArr = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            apiAvailability.weeklySlots.forEach(slot => {
                const dayName = dayNamesArr[slot.day] as keyof WeeklyAvailability;
                if (dayName && newAvailability[dayName]) {
                    newAvailability[dayName] = {
                        enabled: slot.rawSlots.length > 0,
                        slots: slot.rawSlots.map(s => ({
                            id: s._id,
                            start: `${s.startTime} ${s.startPeriod}`,
                            end: `${s.endTime} ${s.endPeriod}`,
                        }))
                    };
                }
            });
            setWeeklyAvailability(newAvailability);
        }
    }, [apiAvailability]);

    // Meeting preferences state
    const [meetingDuration, setMeetingDuration] = React.useState("60 Minutes");
    const [maxBookingPerDay, setMaxBookingPerDay] = React.useState("5");
    const [minSchedulingNotice, setMinSchedulingNotice] =
        React.useState("2 Days");
    const [preferredMeetingOption, setPreferredMeetingOption] =
        React.useState("Zoom");

    // Dropdown states
    const [showDurationDropdown, setShowDurationDropdown] = React.useState(false);
    const [showMaxBookingDropdown, setShowMaxBookingDropdown] =
        React.useState(false);
    const [showMinNoticeDropdown, setShowMinNoticeDropdown] =
        React.useState(false);
    const [showMeetingOptionDropdown, setShowMeetingOptionDropdown] =
        React.useState(false);

    const durationOptions = ["30 Minutes", "60 Minutes", "90 Minutes"];
    const maxBookingOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const minNoticeOptions = ["Same day", "1 Day", "2 Days", "3 Days", "1 Week"];
    const meetingOptions = [
        "Zoom",
        "Google Meet",
        "Phone call",
        "Microsoft Teams",
        "WhatsApp",
    ];

    const handleTabPress = (tab: "appointments" | "availability") => {
        setActiveTab(tab);
        if (tab === "appointments") {
            router.back();
        }
    };

    const toggleDayEnabled = (day: keyof WeeklyAvailability) => {
        setWeeklyAvailability((prev) => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled },
        }));
    };

    const addTimeSlot = (day: keyof WeeklyAvailability) => {
        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            start: "10:00 AM",
            end: "12:00 PM",
        };

        setWeeklyAvailability((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                slots: [...prev[day].slots, newSlot],
            },
        }));
    };

    const removeTimeSlot = (day: keyof WeeklyAvailability, slotId: string) => {
        setWeeklyAvailability((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                slots: prev[day].slots.filter((slot) => slot.id !== slotId),
            },
        }));
    };

    const handleSubmit = () => {
        if (!user?.id) return;

        const dayMap: Record<string, number> = {
            monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0
        };

        const weeklySlots = Object.entries(weeklyAvailability)
            .filter(([_, data]) => data.enabled)
            .map(([day, data]) => ({
                day: dayMap[day],
                date: selectedDate,
                slots: data.slots.map((slot: TimeSlot) => ({
                    startTime: slot.start.split(' ')[0],
                    startPeriod: slot.start.split(' ')[1] as 'AM' | 'PM',
                    endTime: slot.end.split(' ')[0],
                    endPeriod: slot.end.split(' ')[1] as 'AM' | 'PM',
                }))
            }));

        setAvailability({
            mentorId: user.id,
            weeklySlots,
            meetingDuration: parseInt(meetingDuration) || 60,
            minSchedulingNoticeHours: parseInt(minSchedulingNotice) * 24 || 48,
            maxBookingsPerDay: parseInt(maxBookingPerDay) || 5,
        });
    };

    const renderDropdown = (
        visible: boolean,
        options: string[],
        selectedValue: string,
        onSelect: (value: string) => void,
        onClose: () => void
    ) => {
        if (!visible) return null;

        return (
            <View style={styles.dropdownOptions}>
                {options.map((option) => (
                    <Pressable
                        key={option}
                        style={styles.dropdownOption}
                        onPress={() => {
                            onSelect(option);
                            onClose();
                        }}
                    >
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                        {selectedValue === option && (
                            <Ionicons name="checkmark" size={16} color="#FFC107" />
                        )}
                    </Pressable>
                ))}
            </View>
        );
    };

    const dayNames = [
        { key: "monday" as keyof WeeklyAvailability, label: "Mon" },
        { key: "tuesday" as keyof WeeklyAvailability, label: "Tue" },
        { key: "wednesday" as keyof WeeklyAvailability, label: "Wed" },
        { key: "thursday" as keyof WeeklyAvailability, label: "Thu" },
        { key: "friday" as keyof WeeklyAvailability, label: "Fri" },
        { key: "saturday" as keyof WeeklyAvailability, label: "Sat" },
        { key: "sunday" as keyof WeeklyAvailability, label: "Sun" },
    ];

    return (
        <LinearGradient
            colors={['#1E3A6F', '#176192']}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1 }}>
                {/* <Header
                    title="Schedule"
                    showBackButton={true}
                /> */}

                <TopBar role="director" />

                <View style={styles.tabContainer}>
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'appointments' && styles.activeTab,
                        ]}
                        onPress={() => handleTabPress('appointments')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'appointments' && styles.activeTabText,
                            ]}
                        >
                            Appointments
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.tab,
                            activeTab === 'availability' && styles.activeTab,
                        ]}
                        onPress={() => handleTabPress('availability')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'availability' && styles.activeTabText,
                            ]}
                        >
                            Availability
                        </Text>
                    </Pressable>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: bottom + 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        {/* Date Input */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Enter a date (dd-mm-yyyy)
                            </Text>
                            <View style={styles.searchContainer}>
                                <SearchBar
                                    backgroundColor="transparent"
                                    value=""
                                    onChangeValue={() => { }}
                                    placeholder="Enter a date (dd-mm-yyyy)"
                                />
                            </View>
                        </View>

                        {/* My Weekly Availability */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={24}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.sectionTitle}>
                                    My Weekly Availability
                                </Text>
                            </View>

                            <View style={styles.calendarContainer}>
                                <WeeklyCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                />
                            </View>
                        </View>

                        {/* Available Hours */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Available Hours</Text>
                                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            </View>

                            <AvailableHours
                                availability={weeklyAvailability}
                                onToggleDay={toggleDayEnabled}
                                onAddSlot={addTimeSlot}
                                onRemoveSlot={removeTimeSlot}
                            />
                        </View>

                        {/* Meeting Settings */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Meeting Duration</Text>
                            <Pressable
                                style={styles.dropdownButton}
                                onPress={() =>
                                    setShowDurationDropdown(!showDurationDropdown)
                                }
                            >
                                <Text style={styles.dropdownText}>{meetingDuration}</Text>
                                <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                            </Pressable>
                            {renderDropdown(
                                showDurationDropdown,
                                durationOptions,
                                meetingDuration,
                                setMeetingDuration,
                                () => setShowDurationDropdown(false)
                            )}
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Max. Booking per Day</Text>
                            <Pressable
                                style={styles.dropdownButton}
                                onPress={() =>
                                    setShowMaxBookingDropdown(!showMaxBookingDropdown)
                                }
                            >
                                <Text style={styles.dropdownText}>{maxBookingPerDay}</Text>
                                <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                            </Pressable>
                            {renderDropdown(
                                showMaxBookingDropdown,
                                maxBookingOptions,
                                maxBookingPerDay,
                                setMaxBookingPerDay,
                                () => setShowMaxBookingDropdown(false)
                            )}
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Min. Scheduling Notice
                            </Text>
                            <Pressable
                                style={styles.dropdownButton}
                                onPress={() =>
                                    setShowMinNoticeDropdown(!showMinNoticeDropdown)
                                }
                            >
                                <Text style={styles.dropdownText}>
                                    {minSchedulingNotice}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                            </Pressable>
                            {renderDropdown(
                                showMinNoticeDropdown,
                                minNoticeOptions,
                                minSchedulingNotice,
                                setMinSchedulingNotice,
                                () => setShowMinNoticeDropdown(false)
                            )}
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>
                                Preferred Meeting Option
                            </Text>
                            <Pressable
                                style={styles.dropdownButton}
                                onPress={() =>
                                    setShowMeetingOptionDropdown(!showMeetingOptionDropdown)
                                }
                            >
                                <Text style={styles.dropdownText}>
                                    {preferredMeetingOption}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                            </Pressable>
                            {renderDropdown(
                                showMeetingOptionDropdown,
                                meetingOptions,
                                preferredMeetingOption,
                                setPreferredMeetingOption,
                                () => setShowMeetingOptionDropdown(false)
                            )}
                        </View>

                        {/* Submit Button */}
                        <Pressable 
                            style={[styles.submitButton, isSettingAvailability && { opacity: 0.7 }]} 
                            onPress={handleSubmit}
                            disabled={isSettingAvailability}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSettingAvailability ? "Submitting..." : "Submit"}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>

            <SimpleSuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Availability Submitted"
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    // Tab Container
    tabContainer: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginVertical: 10,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: "#FFFFFF",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.7)",
    },
    activeTabText: {
        color: "#1E3A6F",
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    searchContainer: {
        marginTop: 8,
    },
    calendarContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 12,
        
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    dropdownText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    dropdownOptions: {
        backgroundColor: "#1E3A6F",
        borderRadius: 8,
        marginTop: 4,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dropdownOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    dropdownOptionText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
    submitButton: {
        justifyContent: "center",
        alignSelf: "center",
        
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 54,
        alignItems: "center",
        marginTop: 20,
    },
    submitButtonText: {
        color: "#1E3A6F",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default AvailabilityScreen;
