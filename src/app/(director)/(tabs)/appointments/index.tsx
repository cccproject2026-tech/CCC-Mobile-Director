import GradientCalendar from "@/components/Appointments/calendar";
import SimpleSuccessModal from "@/components/Appointments/SimpleSuccessModal";
import {Header} from "@/components/Header/Header";
import AppointmentCard, {MenuItem} from "@/components/Cards/AppointmentCard";
import ScheduleMeetingBottomSheet from "@/components/Sheets/ScheduleMeetingBottomSheet";
import SearchBar from "@/components/Header/SearchBar";
import TopBar from "@/components/Header/TopBar";
import {Colors} from "@/constants/Colors";
import {icons} from "@/constants";
import {useAuthStore} from "@/stores/auth.store";
import {
  useUserAppointments,
  useCreateAppointment,
  useUpcomingAppointment,
  useCancelAppointment
} from "@/hooks/useAppointments";
import {appointmentService} from "@/services/appointments.service";
import {Appointment} from "@/types/appointment.types";
import {Mentor} from "@/types/user.types";
import {BottomSheetModal, BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import {useMentors} from "@/hooks/useMentors";
import {useMentees} from "@/hooks/useMentees";
import {Ionicons} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";
import MeetingOptionModal from "@/components/Modals/MeetingOptionModal";
import CancelConfirmationModal from "@/components/Modals/CancelConfirmationModal";
import React, {useCallback, useMemo, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type ResponseModalState = {
  visible: boolean;
  message: string;
  buttonText: string;
};

const Appointments: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = React.useState<string>(today);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<
    "appointments" | "availability" | "meeting"
  >("appointments");
  const router = useRouter();
  const [responseModal, setResponseModal] = React.useState<ResponseModalState>({
    visible: false,
    message: "",
    buttonText: "",
  });
  const {bottom} = useSafeAreaInsets();

  // // Reset active tab when screen comes into focus
  // useFocusEffect(
  //     useCallback(() => {
  //         setActiveTab('appointments');
  //     }, [])
  // );

  // Bottom sheet ref
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const {openSheet} = useLocalSearchParams();

  React.useEffect(() => {
    if (openSheet === "true" && scheduleMeetingBottomSheetRef.current) {
      setTimeout(() => {
        scheduleMeetingBottomSheetRef.current?.present();
      }, 200); // Ensure sheet presents after mount
    }
  }, [openSheet]);

  // Fetch real data
  const {data: mentorsData} = useMentors(100);
  const {data: menteesData} = useMentees(100);

  const allUsers = useMemo(() => {
    const mentors = mentorsData?.pages.flatMap((page) => page.mentors) || [];
    const mentees = menteesData?.pages.flatMap((page) => page.mentees) || [];
    return [...mentors, ...mentees];
  }, [mentorsData, menteesData]);

  const user = useAuthStore((state) => state.user);
  // const {data: appointments = [], isLoading: isLoadingAppointments} =
  //   useUserAppointments(user?.id || null);
  

  const {mutate: createAppointment} = useCreateAppointment();
  const {mutate: cancelAppointment, isPending: cancelLoading} = useCancelAppointment();

  const {data: appointments = [], isLoading: isLoadingAppointments} = useUpcomingAppointment();

  const filteredAppointments = appointments.filter(
    (app) =>
      app.meetingDate.split("T")[0] === selectedDate &&
      (app.notes || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  // const [cancelLoading, setCancelLoading] = useState(false);

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    scheduleMeetingBottomSheetRef.current?.present();
  };

  const handleCancelPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    if (selectedAppointment) {
      // TODO: Implement actual cancel API call if needed, currently it just filters local state which is now driven by react-query
      // For now, we'll just show success. Ideally useDeleteAppointment hook.
      cancelAppointment(
        {
          meetingId: selectedAppointment?.id || "undefined"
        },
        {
          onSuccess: () => {
            setShowCancelConfirmModal(false);
            setSelectedAppointment(null);
            setResponseModal({
              visible: true,
              message: "Meeting has been Canceled",
              buttonText: "OK",
            });
          },
          onError: (error: any) => {
            console.error("Error cancel meeting:", error);
            Alert.alert("Error", "Failed to cancel meeting. Please try again.");
          },
        }
      )
      // setShowCancelConfirmModal(false);
      // setSelectedAppointment(null);
      // setResponseModal({
      //   visible: true,
      //   message: "Meeting has been Canceled",
      //   buttonText: "OK",
      // });
    }
  };

  const handleScheduleMeeting = (data: any) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to schedule a meeting.");
      return;
    }

    createAppointment(
      {
        userId: user.id,
        mentorId: data.mentorId,
        meetingDate: data.meetingDate,
        platform: data.platform as any,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          setResponseModal({
            visible: true,
            message: "Meeting Scheduled Successfully",
            buttonText: "OK",
          });
          scheduleMeetingBottomSheetRef.current?.dismiss();
        },
        onError: (error: any) => {
          console.error("Error scheduling meeting:", error);
          Alert.alert("Error", "Failed to schedule meeting. Please try again.");
        },
      },
    );
  };

  const handleNewMeeting = () => {
    scheduleMeetingBottomSheetRef.current?.present();
  };

  const handleTabPress = (tab: "appointments" | "availability" | "meeting") => {
    setActiveTab(tab);
    if (tab === "availability") {
      router.push("/(director)/(tabs)/appointments/availability");
    }
  };

  const renderAppointment = ({item}: {item: Appointment}) => {
    const mentor = allUsers.find((m: any) => m.id === item.mentorId);
    const date = new Date(item.meetingDate);
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const menuItems: MenuItem[] = [
      {
        key: "reschedule",
        title: "Reschedule",
        onSelect: () => handleReschedule(item),
        icon: {ios: "calendar", android: "ic_menu_today"},
      },
      {
        key: "cancel",
        title: "Cancel Meeting",
        destructive: true,
        onSelect: () => handleCancelPress(item),
        icon: {ios: "trash", android: "ic_menu_delete"},
      },
    ];

    return (
      <AppointmentCard
        date={date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
        time={timeStr}
        tz="IST"
        person={
          mentor ? `${mentor.firstName} ${mentor.lastName || ""}` : "Unknown"
        }
        role={mentor?.role}
        mode={item.platform === "zoom" ? "Zoom Meeting" : "Google Meet"}
        platformIcon={
          item.platform === "zoom" ? icons.duoMeet : icons.googleMeet
        }
        menuItems={menuItems}
        onPressMenu={() => {
          setSelectedAppointment(item);
          setShowOptionsModal(true);
        }}
      />
    );
  };

  return (
    <BottomSheetModalProvider>
      <LinearGradient colors={["#1E3A6F", "#176192"]} style={{flex: 1}}>
        <View style={styles.topBarContainer}>
          <TopBar notifications={3} showUserName showNotifications />
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerRow}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Schedule</Text>
        </TouchableOpacity>

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
          <Pressable
            style={[
              styles.tab,
              // activeTab === 'meeting' && styles.activeTab,
            ]}
            onPress={() => {
              // handleTabPress('meeting');
              handleNewMeeting();
            }}
          >
            <Text
              style={[
                styles.tabText,
                // activeTab === 'meeting' && styles.activeTabText,
              ]}
            >
              New Meeting
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{paddingBottom: bottom + 20}}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchContainer}>
            <SearchBar
              backgroundColor="transparent"
              value={searchQuery}
              onChangeValue={setSearchQuery}
              placeholder="Enter a date (dd-mm-yyyy)"
            />
          </View>

          <View style={styles.calendarSection}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#FFFFFF"
                style={{marginRight: 8}}
              />
              <Text style={styles.sectionTitle}>Monthly Meeting Calendar</Text>
            </View>

            <View style={styles.calendarWrapper}>
              <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                showHeader={false}
                markToday={false}
              />
            </View>
          </View>

          <View style={styles.summaryContainer}>
            {selectedDate === today && (
              <Text style={styles.summaryText}>
                You have{" "}
                <Text style={styles.summaryTextHighlight}>
                  {filteredAppointments.length}
                </Text>{" "}
                Appointments Today
              </Text>
            )}
            {selectedDate !== today && filteredAppointments.length > 0 && (
              <Text style={styles.summaryText}>
                You{" "}
                {`${new Date(selectedDate) < new Date(today) ? "had" : "have"}`}
                <Text style={styles.summaryTextHighlight}>
                  {" "}
                  {filteredAppointments.length}{" "}
                </Text>
                Appointments on{" "}
                {`${new Date(selectedDate).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "2-digit"})}`}
              </Text>
            )}
            {selectedDate !== today && filteredAppointments.length == 0 && (
              <Text
                style={styles.summaryText}
              >{`No appointments on ${new Date(selectedDate).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "2-digit"})}`}</Text>
            )}
          </View>

          {/* <View style={styles.searchSection}>
                        <SearchBar
                            value={searchQuery}
                            onChangeValue={setSearchQuery}
                            placeholder="Search Meetings"
                        />
                    </View> */}

          <View style={styles.appointmentsList}>
            {isLoadingAppointments ? (
              <ActivityIndicator color="#FFFFFF" style={{marginVertical: 20}} />
            ) : (
              <FlatList
                data={filteredAppointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No meetings scheduled for this date
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          {/* Next Appointment Section */}
          <View style={styles.nextAppointmentSection}>
            <Text style={[styles.summaryText, {marginBottom: 15}]}>Next Appointment</Text>
            {/* {renderAppointment({item: appointments[0]})} */}
            {isLoadingAppointments ? (
              <ActivityIndicator color="#FFFFFF" style={{marginVertical: 20}} />
            ) : (
              <FlatList
                data={appointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No next meeting scheduled
                    </Text>
                  </View>
                }
              />
            )}
          </View>

          {/* <View style={styles.footer}>
                        <Text style={styles.footerInfo}>
                            Schedule meetings with your Mentors / Field Mentors.
                        </Text>
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={[styles.tab, { backgroundColor: '#FFFFFF', width: '100%' }]}
                                onPress={() => scheduleMeetingBottomSheetRef.current?.present()}
                            >
                                <Text style={[styles.tabText, { color: '#1E3A6F' }]}>New Meeting</Text>
                            </Pressable>
                        </View>
                    </View> */}
        </ScrollView>

        <ScheduleMeetingBottomSheet
          ref={scheduleMeetingBottomSheetRef}
          onClose={() => scheduleMeetingBottomSheetRef.current?.dismiss()}
          onSchedule={handleScheduleMeeting}
        />

        <SimpleSuccessModal
          visible={responseModal.visible}
          onClose={() =>
            setResponseModal((prev) => ({...prev, visible: false}))
          }
          title={responseModal.message}
        />

        <MeetingOptionModal
          visible={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          onReschedule={() => {
            if (selectedAppointment) handleReschedule(selectedAppointment);
          }}
          onCancel={() => {
            if (selectedAppointment) setShowCancelConfirmModal(true);
          }}
        />

        <CancelConfirmationModal
          visible={showCancelConfirmModal}
          onClose={() => setShowCancelConfirmModal(false)}
          onConfirm={handleConfirmCancel}
          loading={cancelLoading}
        />
      </LinearGradient>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  backText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  topBarContainer: {
    width: "100%",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 5,
    gap: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(20, 81, 125, 1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 1)",
  },
  activeTabText: {
    color: "rgba(0, 31, 193, 1)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginVertical: 10,
  },
  calendarSection: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  calendarWrapper: {
    width: "100%",
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 1)",
  },
  summaryTextHighlight: {
    color: "#FFEA00",
  },
  searchSection: {
    marginBottom: 16,
  },
  appointmentsList: {
    marginBottom: 20,
  },
  nextAppointmentSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  nextAppointmentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 15,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerInfo: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {fontSize: 20, color: "#fff", fontWeight: "700"},
});

export default Appointments;
