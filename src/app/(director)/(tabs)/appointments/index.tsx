import { ScheduleMonthCalendarFromSelection } from "@/components/calendar/ScheduleMonthCalendar";
import GoogleCalendarScheduleBanner from "@/components/GoogleCalendarScheduleBanner";
import { useAppointmentCalendarSelection } from "@/hooks/appointments/useAppointmentCalendarSelection";
import SimpleSuccessModal from "@/components/Appointments/SimpleSuccessModal";
import TopBar from "@/components/Header/TopBar";
import { ScreenBackHeader } from "@/components/ui/design-system";
import AppointmentCard, { MenuItem } from "@/components/director/AppointmentCard";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants";
import {
  useAppointments,
  useCancelAppointment,
} from "@/hooks/appointments/useAppointments";
import { useMentors } from "@/hooks/useMentors";
import { openScheduleMeeting } from "@/lib/scheduling/scheduleMeetingNavigation";
import { useAuthStore } from "@/stores/auth.store";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import { getDeviceTimezone } from "@/utils/appointments/timezone";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppGradientBackground from "@/components/layout/AppGradientBackground";

interface ResponseModalState {
  visible: boolean;
  message: string;
  buttonText: string;
}

const Appointments: React.FC = () => {
  const {
    selectedDate,
    selectedDateLabel,
    visibleMonthYmd,
    viewYear,
    viewMonth,
    formatDisplayDate,
    isToday,
    onSelectCalendarDay,
    onCalendarMonthChange,
    jumpCalendarToSelected,
    dayVariantForMeetings,
  } = useAppointmentCalendarSelection();
  const [activeTab, setActiveTab] = React.useState<
    "appointments" | "availability"
  >("appointments");
  const router = useRouter();
  const deviceTz = useMemo(() => getDeviceTimezone(), []);

  // When returning from Availability via router.back(), React state is preserved
  // but we were left on activeTab === "availability" — reset highlight on focus.
  useFocusEffect(
    useCallback(() => {
      setActiveTab("appointments");
    }, []),
  );
  const [responseModal, setResponseModal] = React.useState<ResponseModalState>({
    visible: false,
    message: "",
    buttonText: "",
  });
  const { bottom } = useSafeAreaInsets();

  // Bottom sheet ref
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const [rescheduleData, setRescheduleData] = React.useState<any>(null);
  const { openSheet, assessmentId } = useLocalSearchParams();

  // Get current user
  const { user } = useAuthStore();

  // Fetch appointments for mentor
  const {
    appointments,
    isLoading: isLoadingAppointments,
    getAppointmentsByDate,
    getUpcomingAppointments,
  } = useAppointments({
    userId: user?.id,
  });

  const {
    mutateAsync: cancelAppointmentAsync,
    isPending: isCancelling,
  } = useCancelAppointment();

  const { data: mentorsData } = useMentors(100);

  const allMentors = useMemo(() => {
    return mentorsData?.pages.flatMap((page) => page.mentors) || [];
  }, [mentorsData]);

  React.useEffect(() => {
    if (openSheet === "true" && scheduleMeetingBottomSheetRef.current) {
      setTimeout(() => {
        scheduleMeetingBottomSheetRef.current?.present();
      }, 200); // Ensure sheet presents after mount
    }
  }, [openSheet]);

  // Helper function to format time for display (device timezone)
  const formatTime = React.useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      ...(deviceTz.timeZone ? { timeZone: deviceTz.timeZone } : {}),
    });
  }, [deviceTz.timeZone]);

  // Helper function to get platform icon
  const getPlatformIcon = React.useCallback((platform: string) => {
    switch (platform) {
      case "zoom":
        return icons.duoMeet;
      case "google_meet":
        return icons.googleMeet;
      case "teams":
        return icons.duoMeet;
      default:
        return icons.duoMeet;
    }
  }, []);

  // Helper function to get mode label
  const getModeLabel = React.useCallback((platform: string) => {
    switch (platform) {
      case "zoom":
        return "Zoom";
      case "google_meet":
        return "Google Meet";
      case "teams":
        return "Teams";
      case "phone":
        return "Phone call";
      case "in_person":
        return "In Person";
      default:
        return "Zoom";
    }
  }, []);

  const getMentorName = React.useCallback(
    (mentorId: string) => {
      const mentor = allMentors?.find((m) => m.id === mentorId);
      if (mentor) {
        return (
          `${mentor.firstName || ""} ${mentor.lastName || ""}`.trim() ||
          "Mentor"
        );
      }
      return "Mentor";
    },
    [allMentors],
  );

  // Format appointments for display
  const formattedAppointments = useMemo(() => {
    if (!appointments || !getAppointmentsByDate) return [];
    const dateAppointments = getAppointmentsByDate(selectedDate);

    const uniqueDateAppointments = dateAppointments.filter(
      (apt, index, self) =>
        index ===
        self.findIndex((a) =>
          a.id
            ? a.id === apt.id
            : a.meetingDate === apt.meetingDate &&
              a.mentorId === apt.mentorId &&
              a.userId === apt.userId,
        ),
    );

    const activeDateAppointments = uniqueDateAppointments.filter(
      (apt) => !String(apt.status ?? "").trim().toLowerCase().startsWith("cancel"),
    );

    return activeDateAppointments.map((apt) => {
      const mentorName = getMentorName(apt.mentorId);
      const startTime = formatTime(apt.meetingDate);
      const endTime = formatTime(apt.endTime);

      return {
        id: apt.id,
        date: formatDisplayDate(apt.meetingDate),
        time: `${startTime} - ${endTime}`,
        tz: deviceTz.badge,
        person: mentorName,
        role: "Mentor",
        mode: getModeLabel(apt.platform),
        icon: getPlatformIcon(apt.platform),
        appointment: apt, // Keep original appointment data for handlers
      };
    });
  }, [
    appointments,
    getAppointmentsByDate,
    selectedDate,
    formatDisplayDate,
    formatTime,
    getModeLabel,
    getPlatformIcon,
    getMentorName,
  ]);

  const selectedDateAppointments = formattedAppointments;

  const appointmentCountByYmd = useMemo(() => {
    const map = new Map<string, number>();
    if (!appointments) return map;
    for (const apt of appointments) {
      if (String(apt.status ?? "").trim().toLowerCase().startsWith("cancel")) continue;
      const ymd = String(apt.meetingDate ?? "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) continue;
      map.set(ymd, (map.get(ymd) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  // Format getUpcomingAppointments appointments for display
  const upcomingAppointments = useMemo(() => {
    if (!appointments || !getUpcomingAppointments) return [];

    const dateAppointments = getUpcomingAppointments();
    const uniqueUpcomingAppointments = dateAppointments.filter(
      (apt, index, self) =>
        index ===
        self.findIndex((a) =>
          a.id
            ? a.id === apt.id
            : a.meetingDate === apt.meetingDate &&
              a.mentorId === apt.mentorId &&
              a.userId === apt.userId,
        ),
    );
    const activeUpcomingAppointments = uniqueUpcomingAppointments.filter(
      (apt) => !String(apt.status ?? "").trim().toLowerCase().startsWith("cancel"),
    );
    const mapped = activeUpcomingAppointments.map((apt) => {
      const mentorName = getMentorName(apt.mentorId);
      const startTime = formatTime(apt.meetingDate);
      const endTime = formatTime(apt.endTime);
      if (
        formatDisplayDate(apt.meetingDate) !== formatDisplayDate(selectedDate)
      ) {
        return {
          id: apt.id,
          date: formatDisplayDate(apt.meetingDate),
          time: `${startTime} - ${endTime}`,
          tz: deviceTz.badge,
          person: mentorName,
          role: "Mentee",
          mode: getModeLabel(apt.platform),
          icon: getPlatformIcon(apt.platform),
          appointment: apt, // Keep original appointment data for handlers
        };
      }
    });
    return mapped.filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [
    appointments,
    getAppointmentsByDate,
    selectedDate,
    formatDisplayDate,
    formatTime,
    getModeLabel,
    getPlatformIcon,
    getMentorName,
  ]);

  const allUpcomingAppointments = upcomingAppointments;

  const handleViewDetails = (appointment: any) => {
    console.log("View details", appointment);
    // Navigate to appointment details
  };

  const handleReschedule = (appointment: any) => {
    openScheduleMeeting(router, user?.role, {
      mode: "reschedule",
      appointmentId: String(appointment.id),
    });
  };

  const handleCancel = (appointment: any) => {
    if (appointment?.status !== "scheduled") {
      Alert.alert(
        "Cannot Cancel",
        "Only scheduled meetings can be cancelled.",
      );
      return;
    }

    Alert.alert(
      "Cancel Meeting",
      "Are you sure you want to cancel this meeting?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            if (!appointment?.id) {
              Alert.alert("Error", "Missing appointment id.");
              return;
            }
            try {
              await cancelAppointmentAsync(appointment.id);
              setResponseModal({
                visible: true,
                message: "Meeting has been Canceled",
                buttonText: "OK",
              });
            } catch {
              Alert.alert(
                "Error",
                "Failed to cancel the meeting. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  // Handle new meeting button press
  const handleNewMeeting = () => {
    openScheduleMeeting(router, user?.role, { mode: "schedule" });
  };

  // Handle close bottom sheet
  const handleCloseScheduleBottomSheet = () => {
    setRescheduleData(null);
  };

  const handleTabPress = (tab: "appointments" | "availability") => {
    setActiveTab(tab);
    if (tab === "availability") {
      router.push({
        pathname: "/(director)/(tabs)/appointments/availability",
      });
    }
  };

  const [changeModeModalVisible, setChangeModeModalVisible] =
    React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState("Zoom");
  const [showModeSuccess, setShowModeSuccess] = React.useState(false);
  const [modeSuccessText, setModeSuccessText] = React.useState("");
  const meetingModes = [
    "Zoom",
    "Google Meet",
    "Teams",
    "Whatsapp",
    "Phone call",
  ];

  const handleChangeMode = (appointment: any) => {
    setChangeModeModalVisible(true);
  };

  const handleChooseMode = () => {
    setChangeModeModalVisible(false);
    setModeSuccessText(`Meeting Mode has been\nChanged to ${selectedMode}`);
    setShowModeSuccess(true);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground>
        <>
          <View style={{ paddingBottom: 10 }}>
            <TopBar role="director" showUserName />
          </View>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <ScreenBackHeader
              title="Schedule"
              rightElement={
                <Pressable onPress={handleNewMeeting} style={styles.newMeetingButton}>
                  <Ionicons name="add" size={20} color="#FFFFFF" style={styles.newMeetingIcon} />
                  <Text style={styles.newMeetingText}>New Meetings</Text>
                </Pressable>
              }
            />

            <View style={{ paddingHorizontal: 16 }}>
              <GoogleCalendarScheduleBanner />
            </View>

            {/* Tab Switcher */}
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

            {/* Main content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: bottom }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={styles.screenContent}
              >
                {/* Calendar */}
                <View style={styles.calendarContainer}>
                  {/* Heading with Icon */}
                  <View style={styles.calendarHeader}>
                    <View style={styles.calendarHeaderLeft}>
                      <View style={styles.calendarIconWrap}>
                        <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.calendarTitle} numberOfLines={1}>
                          Monthly Meeting Calendar
                        </Text>
                        <Text style={styles.calendarSubtitle} numberOfLines={1}>
                          Select a date to view your meetings
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.datePill}
                      accessibilityRole="button"
                      accessibilityLabel={`Show ${selectedDateLabel} on calendar`}
                      onPress={jumpCalendarToSelected}
                    >
                      <Text style={styles.datePillText}>{selectedDateLabel}</Text>
                    </Pressable>
                  </View>

                  <ScheduleMonthCalendarFromSelection
                    selectedYmd={selectedDate}
                    visibleMonthYmd={visibleMonthYmd}
                    viewYear={viewYear}
                    viewMonth={viewMonth}
                    disablePastDates
                    onSelectDay={onSelectCalendarDay}
                    onMonthChange={onCalendarMonthChange}
                    getDayVariant={(ymd, ctx) =>
                      dayVariantForMeetings(ymd, ctx, appointmentCountByYmd.get(ymd) ?? 0)
                    }
                    getDayBadge={(ymd) => {
                      const count = appointmentCountByYmd.get(ymd) ?? 0;
                      return count > 0 ? String(count) : null;
                    }}
                  />
                </View>

                {/* Selected Date Appointments */}
                {selectedDateAppointments.length > 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <Text style={styles.sectionTitle} numberOfLines={1}>
                          Appointments
                        </Text>
                        <Text style={styles.sectionSubtitle} numberOfLines={1}>
                          {isToday(selectedDate)
                            ? "Scheduled for today"
                            : `Scheduled for ${formatDisplayDate(selectedDate)}`}
                        </Text>
                      </View>
                      <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{selectedDateAppointments.length}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 10 }}>
                      {isLoadingAppointments ? (
                        <View
                          style={{ paddingVertical: 20, alignItems: "center" }}
                        >
                          <ActivityIndicator size="small" color="white" />
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              marginTop: 8,
                              fontSize: 14,
                            }}
                          >
                            Loading appointments...
                          </Text>
                        </View>
                      ) : (
                        selectedDateAppointments.map((appointment, i) => {
                          const isScheduled =
                            appointment.appointment?.status === "scheduled";

                          const menuItems: MenuItem[] = [
                            {
                              key: "reschedule",
                              title: "Reschedule Meeting",
                              icon: {
                                ios: "calendar.badge.clock",
                                android: "ic_event_available",
                              },
                              onSelect: () =>
                                handleReschedule(appointment.appointment),
                            },
                          ];

                          if (isScheduled) {
                            menuItems.push({
                              key: "cancel",
                              title: "Cancel Meeting",
                              destructive: true,
                              icon: {
                                ios: "trash",
                                android: "ic_menu_delete",
                              },
                              onSelect: () =>
                                handleCancel(appointment.appointment),
                            });
                          }

                          return (
                            <AppointmentCard
                              key={appointment.id || i}
                              date={appointment.date}
                              time={appointment.time}
                              tz={appointment.tz}
                              person={appointment.person}
                              role={appointment.role}
                              mode={appointment.mode}
                              platformIcon={appointment.icon}
                              menuItems={menuItems}
                              meetingJoinUrl={getAppointmentJoinUrl(
                                appointment.appointment,
                              )}
                              onViewDetails={() =>
                                router.push({
                                  pathname: "/appointments/meeting-details",
                                  params: {
                                    appointmentId: String(
                                      appointment.appointment?.id ?? appointment.id ?? "",
                                    ),
                                  },
                                })
                              }
                            />
                          );
                        })
                      )}
                    </View>
                  </View>
                )}

                {/* No appointments message */}
                {selectedDateAppointments.length === 0 && (
                  <View style={styles.appointmentsContainer}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <Text style={styles.sectionTitle} numberOfLines={1}>
                          {isToday(selectedDate) ? "No appointments today" : "No appointments"}
                        </Text>
                        <Text style={styles.sectionSubtitle} numberOfLines={2}>
                          {isToday(selectedDate)
                            ? "Try selecting another date or schedule a new meeting."
                            : `No meetings on ${formatDisplayDate(selectedDate)}. Pick a different date or schedule one.`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.emptyStateIconWrap}>
                      <Ionicons name="calendar-outline" size={26} color="rgba(255,255,255,0.55)" />
                    </View>
                  </View>
                )}

                {/* Selected Date Appointments */}
                {allUpcomingAppointments?.length > 0 &&
                  allUpcomingAppointments[0] && (
                    <View style={styles.appointmentsContainer}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                          <Text style={styles.sectionTitle} numberOfLines={1}>
                            Next up
                          </Text>
                          <Text style={styles.sectionSubtitle} numberOfLines={1}>
                            Your upcoming meetings
                          </Text>
                        </View>
                        <View style={styles.countPillMuted}>
                          <Text style={styles.countPillTextMuted}>
                            {Math.min(allUpcomingAppointments.length, 3)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ gap: 10 }}>
                        {isLoadingAppointments ? (
                          <View
                            style={{
                              paddingVertical: 20,
                              alignItems: "center",
                            }}
                          >
                            <ActivityIndicator size="small" color="white" />
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.7)",
                                marginTop: 8,
                                fontSize: 14,
                              }}
                            >
                              Loading appointments...
                            </Text>
                          </View>
                        ) : (
                          allUpcomingAppointments?.map((appointment, i) => {
                            const isScheduled =
                              appointment?.appointment?.status === "scheduled";

                            const menuItems: MenuItem[] = [
                              {
                                key: "reschedule",
                                title: "Reschedule Meeting",
                                icon: {
                                  ios: "calendar.badge.clock",
                                  android: "ic_event_available",
                                },
                                onSelect: () => handleReschedule(appointment),
                              },
                            ];

                            if (isScheduled) {
                              menuItems.push({
                                key: "cancel",
                                title: "Cancel Meeting",
                                destructive: true,
                                icon: {
                                  ios: "trash",
                                  android: "ic_menu_delete",
                                },
                                onSelect: () => handleCancel(appointment),
                              });
                            }

                            return (
                              <AppointmentCard
                              key={appointment.id || i}
                              date={appointment.date}
                              time={appointment.time}
                              tz={appointment.tz}
                              person={appointment.person}
                              role={appointment.role}
                              mode={appointment.mode}
                              platformIcon={appointment.icon}
                                menuItems={menuItems}
                                meetingJoinUrl={getAppointmentJoinUrl(
                                appointment.appointment,
                                )}
                                onViewDetails={() =>
                                  router.push({
                                    pathname: "/appointments/meeting-details",
                                    params: {
                                      appointmentId: String(
                                        appointment.appointment?.id ?? appointment.id ?? "",
                                      ),
                                    },
                                  })
                                }
                              />
                            );
                          })
                        )}
                      </View>
                    </View>
                  )}
              </View>
            </ScrollView>
          </View>
        </>
      </AppGradientBackground>

      {/* Scheduling moved to /schedule-meeting pages */}

      {/* Change Meeting Mode Modal */}
      <Modal
        visible={changeModeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangeModeModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LinearGradient
            colors={["#264387", "#1D548D", "#176192"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              borderRadius: 24,
              width: Math.min(Dimensions.get("window").width * 0.92, 400),
              paddingHorizontal: 20,
              paddingVertical: 28,
              alignSelf: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: "700",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                Choose your meeting option
              </Text>
              <Pressable
                onPress={() => setChangeModeModalVisible(false)}
                style={{ marginLeft: 8 }}
              >
                <Text
                  style={{ color: "white", fontSize: 28, fontWeight: "400" }}
                >
                  ×
                </Text>
              </Pressable>
            </View>
            {meetingModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setSelectedMode(mode)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  minHeight: 36,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    borderWidth: 2,
                    borderColor: selectedMode === mode ? "#3CA1F0" : "#B0B8D1",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  {selectedMode === mode && (
                    <View
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: 6.5,
                        backgroundColor: "#3CA1F0",
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    color: selectedMode === mode ? "#EAF7FF" : "#B0B8D1",
                    fontSize: 19,
                    fontWeight: "500",
                  }}
                >
                  {mode}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={handleChooseMode}
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                paddingVertical: 14,
                marginTop: 10,
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  color: "#1535A8",
                  fontSize: 19,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                Choose
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
      {/* Success Modal for Meeting Mode Change */}
      <SimpleSuccessModal
        visible={showModeSuccess}
        onClose={() => setShowModeSuccess(false)}
        title={modeSuccessText}
      />
      {/* General Success Modal */}
      <SimpleSuccessModal
        visible={responseModal.visible}
        onClose={() => setResponseModal({ ...responseModal, visible: false })}
        title={responseModal.message}
      />
    </>
  );
};

export default Appointments;
const styles = StyleSheet.create({
  newMeetingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexShrink: 0,
  },
  newMeetingIcon: {
    marginRight: 6,
  },
  newMeetingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  screenContent: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
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
  // Calendar Container
  calendarContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  // Calendar Header with Icon
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  calendarHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  calendarIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  calendarTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  calendarSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  datePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  datePillText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
  },

  // Wrapper to control calendar height
  calendarWrapper: {
    maxHeight: 340, // Reduced from default height
    overflow: "hidden",
  },

  // Appointments Container
  appointmentsContainer: {
    marginTop: 14,
    position: "relative",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  sectionHeaderLeft: { flex: 1, minWidth: 0 },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  sectionSubtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  countPill: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 204, 21, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.25)",
  },
  countPillText: { color: "rgba(250, 204, 21, 0.95)", fontSize: 13, fontWeight: "900" },
  countPillMuted: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  countPillTextMuted: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "900" },

  emptyStateIconWrap: {
    marginTop: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
  },
});
