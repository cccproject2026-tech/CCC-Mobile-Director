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
import {
  useWeeklyAvailability,
  useSetAvailability,
} from "@/hooks/useMentorsAvailability";
import { useAuthStore } from "@/stores/auth.store";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { Colors } from "@/constants/Colors";
const timeOptions = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

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
    new Date().toISOString().split("T")[0],
  );
  const [activeTab, setActiveTab] = React.useState<
    "appointments" | "availability"
  >("availability");

  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    day: keyof WeeklyAvailability;
    slotId: string;
    field: "start" | "end";
  } | null>(null);

  // Reset active tab when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab("availability");
    }, []),
  );

  const user = useAuthStore((state) => state.user);
  const { availability: apiAvailability, isLoading: isLoadingAvailability } =
    useWeeklyAvailability(user?.id || null);
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

      const dayNamesArr = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      apiAvailability.weeklySlots.forEach((slot) => {
        const dayName = dayNamesArr[slot.day] as keyof WeeklyAvailability;
        if (dayName && newAvailability[dayName]) {
          newAvailability[dayName] = {
            enabled: slot.rawSlots.length > 0,
            slots: slot.rawSlots.map((s) => ({
              id: s._id,
              start: `${s.startTime} ${s.startPeriod}`,
              end: `${s.endTime} ${s.endPeriod}`,
            })),
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
    const timeSlots = [
      "09:00 am - 10:00 am",
      "11:00 am - 12:00 pm",
      "01:00 pm - 02:00 pm",
      "03:00 pm - 04:00 pm",
    ];
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

  const [dateSearchQuery, setDateSearchQuery] = useState("");

  const parseDuration = (durationStr: string): number => {
    const num = parseInt(durationStr);
    return isNaN(num) ? 60 : num;
  };

  const parseNoticeHours = (noticeStr: string): number => {
    const lower = noticeStr.toLowerCase();
    if (lower === "same day") return 0;
    const num = parseInt(noticeStr);
    if (isNaN(num)) return 48;
    if (lower.includes("day")) return num * 24;
    if (lower.includes("week")) return num * 24 * 7;
    return num;
  };

  const handleSubmit = () => {
    if (!user?.id) return;

    const dayMap: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    };

    const weeklySlots = Object.entries(weeklyAvailability)
      .filter(([_, data]) => data.enabled)
      .map(([day, data]) => ({
        day: dayMap[day],
        date: selectedDate,
        slots: data.slots.map((slot: TimeSlot) => ({
          startTime: slot.start.split(" ")[0],
          startPeriod: slot.start.split(" ")[1] as "AM" | "PM",
          endTime: slot.end.split(" ")[0],
          endPeriod: slot.end.split(" ")[1] as "AM" | "PM",
        })),
      }));

    setAvailability({
      mentorId: user.id,
      weeklySlots,
      meetingDuration: parseDuration(meetingDuration),
      minSchedulingNoticeHours: parseNoticeHours(minSchedulingNotice),
      maxBookingsPerDay: parseInt(maxBookingPerDay) || 5,
    });
  };

  const renderDropdown = (
    visible: boolean,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void,
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

  //Time Picker functions
  const openTimePicker = (
    day: keyof WeeklyAvailability,
    slotId: string,
    field: "start" | "end",
  ) => {
    setSelectedTimeSlot({ day, slotId, field });
    setShowTimePicker(true);
  };

  const updateTimeSlot = (
    day: keyof WeeklyAvailability,
    slotId: string,
    field: "start" | "end",
    value: string,
  ) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot) =>
          slot.id === slotId ? { ...slot, [field]: value } : slot,
        ),
      },
    }));
  };

  const selectTime = (time: string) => {
    if (selectedTimeSlot) {
      updateTimeSlot(
        selectedTimeSlot.day,
        selectedTimeSlot.slotId,
        selectedTimeSlot.field,
        time,
      );
    }
    setShowTimePicker(false);
    setSelectedTimeSlot(null);
  };
  const handleDateSearch = (value: string) => {
    setDateSearchQuery(value);

    // If it's a valid dd-mm-yyyy format, update selectedDate
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [_, day, month, year] = match;
      const newDate = `${year}-${month}-${day}`;
      setSelectedDate(newDate);
    }
  };

  return (
    <LinearGradient colors={["#1E3A6F", "#176192"]} style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* <Header title="Schedule" showBackButton={true} /> */}

        {/* <TopBar role="director" /> */}
        <View style={styles.topBarContainer}>
          <TopBar notifications={3} showUserName showNotifications />
        </View>
        <Header title="Schedule" showBackButton={true} showNewMeeting={false} />

        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === "appointments" && styles.activeTab,
            ]}
            onPress={() => handleTabPress("appointments")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "appointments" && styles.activeTabText,
              ]}
            >
              Appointments
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === "availability" && styles.activeTab,
            ]}
            onPress={() => handleTabPress("availability")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "availability" && styles.activeTabText,
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
              <Text style={styles.sectionTitle}>Enter a date (dd-mm-yyyy)</Text>
              <View style={styles.searchContainer}>
                <SearchBar
                  backgroundColor="transparent"
                  value={dateSearchQuery}
                  onChangeValue={handleDateSearch}
                  placeholder="Enter a date (dd-mm-yyyy)"
                />
              </View>
            </View>

            {/* My Weekly Availability */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
                <Text style={styles.sectionTitle}>My Weekly Availability</Text>
              </View>

              <View style={styles.calendarContainer}>
                <WeeklyCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </View>
            </View>

            {/* Available Hours */}
            {/* <View style={styles.sectionContainer}>
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
                        </View> */}
            {/* Available Hours */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Hours</Text>
                <TouchableOpacity>
                  <Image
                    source={require("@/assets/images/app/AvailableHoursIcon.png")}
                    style={styles.logoImage}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.hoursContainer}>
                {dayNames.map(({ key, label }) => (
                  <View key={key} style={styles.dayContainer}>
                    <View style={styles.dayHeader}>
                      <Pressable
                        style={styles.checkbox}
                        onPress={() => toggleDayEnabled(key)}
                      >
                        {weeklyAvailability[key].enabled && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#1E3A6F"
                          />
                        )}
                      </Pressable>
                      <Text style={styles.dayLabel}>{label}</Text>
                    </View>

                    {weeklyAvailability[key].enabled && (
                      <View style={styles.timeSlotsContainer}>
                        {weeklyAvailability[key].slots.map((slot) => (
                          <View key={slot.id} style={styles.timeSlotRow}>
                            <View style={styles.timeSlotInputs}>
                              <Pressable
                                style={styles.timeInput}
                                onPress={() =>
                                  openTimePicker(key, slot.id, "start")
                                }
                              >
                                <Text style={styles.timeInputText}>
                                  {slot.start}
                                </Text>
                                <Ionicons
                                  name="chevron-down"
                                  size={16}
                                  color="#FFFFFF"
                                />
                              </Pressable>
                              <Text style={styles.timeSeparator}>to</Text>
                              <Pressable
                                style={styles.timeInput}
                                onPress={() =>
                                  openTimePicker(key, slot.id, "end")
                                }
                              >
                                <Text style={styles.timeInputText}>
                                  {slot.end}
                                </Text>
                                <Ionicons
                                  name="chevron-down"
                                  size={16}
                                  color="#FFFFFF"
                                />
                              </Pressable>
                            </View>
                            {weeklyAvailability[key].slots.length > 1 && (
                              <Pressable
                                style={styles.removeSlotButton}
                                onPress={() => removeTimeSlot(key, slot.id)}
                              >
                                <Ionicons
                                  name="close"
                                  size={16}
                                  color="#FF6B6B"
                                />
                              </Pressable>
                            )}
                          </View>
                        ))}
                        <Pressable
                          style={styles.addSlotButton}
                          onPress={() => addTimeSlot(key)}
                        >
                          <Text style={styles.addSlotText}>+ Add</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Meeting Settings */}
            <View style={styles.rowContainer}>
              <View style={[styles.sectionContainer, { flex: 1 }]}>
                <Text style={styles.sectionTitle}>Meeting Duration</Text>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() => setShowDurationDropdown(!showDurationDropdown)}
                >
                  <Text style={styles.dropdownText}>{meetingDuration}</Text>
                  <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                </Pressable>
                {renderDropdown(
                  showDurationDropdown,
                  durationOptions,
                  meetingDuration,
                  setMeetingDuration,
                  () => setShowDurationDropdown(false),
                )}
              </View>

              <View style={[styles.sectionContainer, { flex: 1 }]}>
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
                  () => setShowMaxBookingDropdown(false),
                )}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.sectionContainer, { flex: 1 }]}>
                <Text style={styles.sectionTitle}>Min. Scheduling Notice</Text>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() =>
                    setShowMinNoticeDropdown(!showMinNoticeDropdown)
                  }
                >
                  <Text style={styles.dropdownText}>{minSchedulingNotice}</Text>
                  <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
                </Pressable>
                {renderDropdown(
                  showMinNoticeDropdown,
                  minNoticeOptions,
                  minSchedulingNotice,
                  setMinSchedulingNotice,
                  () => setShowMinNoticeDropdown(false),
                )}
              </View>

              <View style={[styles.sectionContainer, { flex: 1 }]}>
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
                  () => setShowMeetingOptionDropdown(false),
                )}
              </View>
            </View>
            {/* Submit Button */}
            <Pressable
              style={[
                styles.submitButton,
                isSettingAvailability && { opacity: 0.7 },
              ]}
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
      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowTimePicker(false);
          setSelectedTimeSlot(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Times</Text>
              <Pressable
                onPress={() => {
                  setShowTimePicker(false);
                  setSelectedTimeSlot(null);
                }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            <ScrollView style={styles.timePickerList}>
              {timeOptions.map((time) => (
                <Pressable
                  key={time}
                  style={styles.timePickerOption}
                  onPress={() => selectTime(time)}
                >
                  <Text style={styles.timePickerOptionText}>{time}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
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
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  dropdownOptions: {
    backgroundColor: "#1E3A6F",
    borderRadius: 8,
    marginTop: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.09)",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 54,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "rgba(0, 31, 193, 1)",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.darkBlueGradientOne,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
    paddingBottom: 20,
  },
  logoImage: { width: 20, height: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  topBarContainer: {
    width: "100%",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timePickerList: {
    maxHeight: 300,
  },
  timePickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  timePickerOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  hoursContainer: {
    backgroundColor: "rgba(14, 48, 115, 1)",
    borderRadius: 12,
    padding: 16,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dayLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  timeSlotsContainer: {
    marginLeft: 32,
  },
  timeSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeSlotInputs: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  timeInputText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginRight: 4,
  },
  timeSeparator: {
    color: "#FFFFFF",
    fontSize: 12,
    marginHorizontal: 8,
  },
  removeSlotButton: {
    padding: 4,
  },
  addSlotButton: {
    marginTop: 8,
  },
  addSlotText: {
    color: "#FFC107",
    fontSize: 12,
    fontWeight: "500",
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
});

export default AvailabilityScreen;
