import { CommonCard, HomeCardHeader, useHomeGridLayout } from '../ui/design-system';
import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    ScrollView,
    TextInput,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MeetingOptionModal from "@/components/Modals/MeetingOptionModal";
import {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useInterests } from '@/hooks/useInterest';
import AppointmentCard, { MenuItem } from '../Cards/AppointmentCard';
import CancelConfirmationModal from "@/components/Modals/CancelConfirmationModal";
import { icons } from '@/constants';
import { useCancelAppointment,useUpcomingAppointment } from '@/hooks/useAppointments';
import MeetingDetailsModal from '../Modals/MeetingDetailsModal';
import { isSmallDevice } from '@/utils/responsive';
import { openScheduleMeeting } from '@/lib/scheduling/scheduleMeetingNavigation';
import { useAuthStore } from '@/stores/auth.store';
type Props = {}

const GlanceSection = (props: Props) => {
    const GLANCE_TILE_COUNT = 3;
    const { gridStyle, onGridLayout, getTileStyle } = useHomeGridLayout(
        GLANCE_TILE_COUNT,
        3,
    );
    const today = new Date().toISOString().split('T')[0];

    const [selectedDate] = useState<string>(today);

    const [searchQuery, setSearchQuery] = useState('');

    const [selectedStatus, setSelectedStatus] = useState('All');

    const appointmentSheetRef = useRef<BottomSheetModal>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
const [showViewModal, setShowViewModal] = useState(false);

const { mutate: cancelAppointment, isPending: cancelLoading } =
    useCancelAppointment();
const [showCancelConfirmModal, setShowCancelConfirmModal] =
    useState(false);
    const snapPoints = useMemo(() => ['75%', '92%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    const { data: appointments = [] } = useUpcomingAppointment();

    const { data: interestsData } = useInterests();

    const newInterestsCount =
        interestsData?.filter((item: any) => item?.status === 'new')?.length || 0;


        console.log("appointments",appointments);
    const filteredAppointments = useMemo(() => {

        return appointments
            ?.filter(
                (app: any) =>
                    app?.meetingDate?.split('T')[0] === selectedDate &&
                    (
                        (app?.notes || '')
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||

                        `${app?.mentor?.firstName || ''} ${app?.mentor?.lastName || ''}`
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||

                        `${app?.user?.firstName || ''} ${app?.user?.lastName || ''}`
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                    )
            )
            ?.filter((app: any) =>
                selectedStatus === 'All'
                    ? true
                    : app?.status === selectedStatus
            );

    }, [
        appointments,
        selectedDate,
        searchQuery,
        selectedStatus,
    ]); 
  console.log("filteredAppointments",filteredAppointments);

    const glanceCards = [
        {
            id: '1',
            icon: 'people-sharp',
            iconColor: 'white',
            bagde: newInterestsCount,
            title: 'New Interests',
            subTitle: '(Mentors/Mentees)',
            route: '/(director)/(tabs)/new-interests',
        },

        {
            id: '2',
            icon: 'today-sharp',
            iconColor: 'white',
            bagde: filteredAppointments?.length || 0,
            title: "Today's Appointments",
        },
    ];
const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowOptionsModal(false);
    appointmentSheetRef.current?.dismiss();
    const role = useAuthStore.getState().user?.role;
    openScheduleMeeting(router, role, {
        mode: 'reschedule',
        appointmentId: String(appointment?.id ?? ''),
    });
};

const handleCancelPress = (appointment: any) => {
    setSelectedAppointment(appointment);

    setShowOptionsModal(false);

    setShowCancelConfirmModal(true);
};
const handleViewMeeting = (appointment: any) => {
    setSelectedAppointment(appointment);

    setShowOptionsModal(false);

    setShowViewModal(true);
};
const handleConfirmCancel = () => {

    if (!selectedAppointment?.id) return;

    cancelAppointment(
        {
            meetingId: selectedAppointment.id,
        },
        {
            onSuccess: () => {

                setShowCancelConfirmModal(false);

                setSelectedAppointment(null);

                console.log('Appointment cancelled');
            },

            onError: (error: any) => {

                console.log('Cancel error:', error);
            },
        }
    );
};
    const renderAppointmentCard = ({ item }: any) => {

        const meetingDate = new Date(item?.meetingDate);

        const menuItems: MenuItem[] = [
            {
                key: 'view',
                title: 'View Details',
                onSelect: () => { },
                icon: {
                    ios: 'eye',
                    android: 'ic_menu_view',
                },
            },

            {
                key: 'join',
                title: 'Join Meeting',
                onSelect: () => { },
                icon: {
                    ios: 'videocam',
                    android: 'ic_menu_call',
                },
            },
        ];

        return (
            <AppointmentCard
                date={meetingDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}
                time={meetingDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                })}
                tz="IST"
                person={
                    item?.user
                        ? `${item?.user?.firstName} ${item?.user?.lastName}`
                        : `${item?.mentor?.firstName} ${item?.mentor?.lastName}`
                }
                role={item?.mentor?.role}
                mode={
                    item?.platform === 'zoom'
                        ? 'Zoom Meeting'
                        : 'Google Meet'
                }
                platformIcon={
                    item?.platform === 'zoom'
                        ? icons.duoMeet
                        : icons.googleMeet
                }
                avatar={
                    item?.user?.profilePicture
                        ? { uri: item?.user?.profilePicture }
                        : item?.mentor?.profilePicture
                            ? { uri: item?.mentor?.profilePicture }
                            : undefined
                }
                menuItems={menuItems}
           onPressMenu={() => {
    setSelectedAppointment(item);

    setShowOptionsModal(true);
    
}}
                onCall={() => { }}
                onChat={() => { }}
                onMail={() => { }}
                onJoinMeeting={() => {
    if (item?.meetingLink) {
        Linking.openURL(item.meetingLink);
    }
}}
            />
        );
    };

    return (
        <>

            <CommonCard>

                <HomeCardHeader title="At a Glance" subtitle="Your dashboard overview" iconName="flash-outline" iconColor="#77C2F0" />

                <View style={gridStyle} onLayout={onGridLayout}>

                    {glanceCards.map((item, index) => (

                        <TouchableOpacity
                            key={item.id}
                            style={[getTileStyle(index), styles.glanceTile]}
                            onPress={() => {
                                if (item.title.includes('Appointments')) {
                                    appointmentSheetRef.current?.present();
                                    return;
                                }
                                if (item?.route) {
                                    router.push(item.route as any);
                                }
                            }}
                        >
                            <View style={styles.iconBadgeRow}>
                                <View style={styles.iconWrapper}>
                                    <Ionicons name={item.icon as any} size={20} color="white" />
                                </View>
                                {item.bagde > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {item.bagde > 99 ? '99+' : item.bagde}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.itemText}>{item.title}</Text>
                            {!!item.subTitle && (
                                <Text style={styles.itemSubText}>{item.subTitle}</Text>
                            )}
                        </TouchableOpacity>

                    ))}

                    <TouchableOpacity
                        onPress={() => router.push('/(director)/(tabs)/appointments')}
                        style={[getTileStyle(2), styles.glanceTile, styles.calendarTile]}
                    >
                        <View style={styles.iconBadgeRow}>
                            <View style={styles.iconWrapper}>
                                <Ionicons name="calendar-sharp" size={20} color="white" />
                            </View>
                        </View>
                        <Text style={styles.itemText}>My Calendar</Text>
                    </TouchableOpacity>

                </View>

            </CommonCard>

            <BottomSheetModal
                ref={appointmentSheetRef}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                enableDynamicSizing={false}
                handleIndicatorStyle={{
                    backgroundColor: '#FFFFFF',
                    width: 70,
                }}
                backgroundStyle={{
                    backgroundColor: '#176192',
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                }}
            >

                <BottomSheetView style={styles.bottomSheetContainer}>

                    <View style={styles.modalHeader}>

                        <Text style={styles.modalTitle}>
                            {"Today's Appointments"}
                        </Text>

                        <Pressable
                            onPress={() =>
                                appointmentSheetRef.current?.dismiss()
                            }
                        >

                            <Ionicons
                                name="close"
                                size={24}
                                color="#fff"
                            />

                        </Pressable>

                    </View>

                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search appointments"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={styles.searchInput}
                    />

                    {/* <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 14 }}
                    >

                        {[
                            'All',
                            'scheduled',
                            'completed',
                            'cancelled',
                        ].map(status => (

                            <Pressable
                                key={status}
                                onPress={() => setSelectedStatus(status)}
                                style={[
                                    styles.filterButton,
                                    selectedStatus === status &&
                                    styles.activeFilterButton,
                                ]}
                            >

                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        selectedStatus === status &&
                                        styles.activeText,
                                    ]}
                                >
                                    {status}
                                </Text>

                            </Pressable>

                        ))}

                    </ScrollView> */}

                    <BottomSheetFlatList
                        data={filteredAppointments?.slice(0, 5)}
                        renderItem={renderAppointmentCard}
                        keyExtractor={(item: any) => item?.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 20,
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>

                                <Ionicons
                                    name="calendar-clear-outline"
                                    size={45}
                                    color="rgba(255,255,255,0.5)"
                                />

                                <Text style={styles.noAppointmentsText}>
                                    No appointments found
                                </Text>

                            </View>
                        }
                    />

           

                </BottomSheetView>
         {/* {filteredAppointments?.length > 5 && ( */}

                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => {

                                appointmentSheetRef.current?.dismiss();

                                router.push(
                                    '/(director)/(tabs)/appointments'
                                );

                            }}
                        >

                            <Text style={styles.viewAllButtonText}>
                                View All
                            </Text>

                        </TouchableOpacity>

                    {/* )} */}
<MeetingOptionModal
    visible={showOptionsModal}
    onClose={() => setShowOptionsModal(false)}
    onReschedule={() => {
        if (selectedAppointment) {
            handleReschedule(selectedAppointment);
        }
    }}
    onCancel={() => {
        if (selectedAppointment) {
            handleCancelPress(selectedAppointment);
        }
    }} 
        onView={() => {
        if (selectedAppointment) {
            handleViewMeeting(selectedAppointment);
        }
    }}
/>
         <CancelConfirmationModal
    visible={showCancelConfirmModal}
    onClose={() => setShowCancelConfirmModal(false)}
onConfirm={handleConfirmCancel}
loading={cancelLoading}
/>
<MeetingDetailsModal
    visible={showViewModal}
    onClose={() => setShowViewModal(false)}
    meeting={selectedAppointment}
/>
            </BottomSheetModal>

        </>
    ); 
};

export default GlanceSection;

const styles = StyleSheet.create({

    glanceTile: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: isSmallDevice ? 6 : 8,
    },

    calendarTile: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconBadgeRow: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },

    iconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    badge: {
        position: 'absolute',
        top: -6,
        right: -8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FB7185',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },

    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '800',
        lineHeight: 12,
    },

    itemText: {
        color: 'white',
        fontSize: isSmallDevice ? 9 : 11,
        fontWeight: '600',
        marginTop: 6,
        lineHeight: 14,
        textAlign: 'center',
        width: '100%',
    },

    itemSubText: {
        color: 'white',
        fontSize: isSmallDevice ? 9 : 10,
        marginTop: 2,
        textAlign: 'center',
        width: '100%',
    },

    bottomSheetContainer: {
        flex: 1,
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingTop: 10,
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },

    modalTitle: {
        color: '#FFFFFF',
        fontSize: isSmallDevice ? 16 : 18,
        fontWeight: '700',
    },

    searchInput: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingVertical: isSmallDevice ? 11 : 13,
        color: '#fff',
        marginBottom: 16,
        fontSize: isSmallDevice ? 12 : 14,
    },

    filterButton: {
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingVertical: isSmallDevice ? 8 : 9,
        borderRadius: 12,
        backgroundColor: 'rgba(20, 81, 125, 1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        marginRight: 10,
    },

    activeFilterButton: {
        backgroundColor: '#FFFFFF',
    },

    filterButtonText: {
        color: '#FFFFFF',
        fontSize:isSmallDevice ? 11 : 13,
        fontWeight: '600',
        textTransform: 'capitalize',
    },

    activeText: {
        color: 'rgba(0, 31, 193, 1)',
    },

    viewAllButton: {
        width: '30%',
        alignSelf: 'flex-end',
        backgroundColor: '#FFFFFF',
        paddingVertical: isSmallDevice ? 5 : 6,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginRight:15
    },

    viewAllButtonText: {
        color: 'rgba(0, 31, 193, 1)',
        fontWeight: '700',
        fontSize: isSmallDevice ? 12 : 14,
    },

    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },

    noAppointmentsText: {
        color: 'rgba(255,255,255,0.75)',
        marginTop: 10,
        fontSize: isSmallDevice ? 12 : 14,
        fontWeight: '500',
    },

});



// import { CommonCard } from '../ui/design-system';
// import React from 'react';
// import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useInterests } from '@/hooks/useInterest';
// import { useUpcomingAppointment } from '@/hooks/useAppointments';



// type Props = {}

//     //   <SearchBar 
//     //           backgroundColor="transparent"
//     //           value={searchQuery}
//     //           onChangeValue={setSearchQuery}
//     //           placeholder="Enter a date (dd-mm-yyyy)"
//     //         />

// const GlanceSection = (props: Props) => {

//       const today = new Date().toISOString().split("T")[0];
//       const [selectedDate, setSelectedDate] = React.useState<string>(today);
//         const [searchQuery, setSearchQuery] = React.useState<string>("");
//       const {data: appointments = [], isLoading: isLoadingAppointments} = useUpcomingAppointment();
    
//       const filteredAppointments = appointments.filter( 
//         (app) =>
//           app.meetingDate.split("T")[0] === selectedDate &&
//           (app.notes || "").toLowerCase().includes(searchQuery.toLowerCase()),
//       );
//     console.log("appoint ments: ", appointments);
//     console.log("filteredAppointments: ", filteredAppointments);

//     const { data: interestsData, isLoading, error, isRefetching, refetch } = useInterests();
//     const newInterestsCount = interestsData?.filter(item => item.status === 'new')?.length || 0;

//     const glanceCards = [
//         {
//             id: '1',
//             icon: 'people-outline',
//             iconColor: 'white',
//             bagde: newInterestsCount,
//             title: 'New Interests',
//             subTitle: '(Mentors/Mentees)',
//             route: '/(director)/(tabs)/new-interests',
//         },
//         {
//             id: '2',
//             icon: 'calendar-outline',
//             iconColor: 'white',
//             bagde: '6',
//             title: "Today's\nAppointments",
//              route: '/(director)/(tabs)/new-interests',
//         },


//     ];

//     return (
//         <CommonCard style={{ marginBottom: 8 }}>
//             <View style={styles.header}>
//                 <Text style={styles.glanceText}>
//                     At a Glance
//                 </Text>

//                 <View style={styles.viewAllContainer}>
//                     <Text style={styles.viewAllText}>
//                         View all
//                     </Text>

//                     <Ionicons
//                         name="chevron-forward"
//                         size={14}
//                         color="#EAF7FF"
//                     />
//                 </View>
//             </View>

//             <View style={styles.glanceItemMainContainer}>
//                 {glanceCards.map((item) => (
//                     <TouchableOpacity onPress={() => router.push(item?.route)}
//                         key={item.id}
//                         style={styles.glanceItemContainer}
//                     >
//                         <View style={styles.countContainer}>

//                             <View style={styles.iconWrapper}>
//                                 <Ionicons
//                                     name={item.icon as any}
//                                     size={24}
//                                     color={item.iconColor}
//                                 />
//                             </View>

//                             <View style={styles.countWrapper}>
//                                 {!!item.bagde && (
//                                     <Text style={styles.countText}>
//                                         {item.bagde ? item?.bagde : 0}
//                                     </Text>
//                                 )}
//                             </View>

//                         </View>

//                         <Text style={styles.itemText}>
//                             {item.title}
//                         </Text>

//                         {!!item.subTitle && (
//                             <Text style={styles.itemSubText}>
//                                 {item.subTitle}
//                             </Text>
//                         )}
//                     </TouchableOpacity>
//                 ))}

//                 <View

//                     style={[styles.glanceItemContainer, { justifyContent: "center", alignItems: "center" }]}
//                 >
//                     <View style={styles.countContainer}>

//                         <View style={styles.iconWrapper}>
//                             <Ionicons
//                                 name={'calendar-outline' as any}
//                                 size={24}
//                                 color={'white'}
//                             />
//                         </View>



//                     </View>

//                     <Text style={styles.itemText}>
//                         My Calendar
//                     </Text>


//                 </View>

//             </View>
//         </CommonCard>
//     );
// };

// export default GlanceSection;

// const styles = StyleSheet.create({
//     header: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },

//     glanceText: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "rgba(255,255,255,0.95)",
//     },

//     viewAllText: {
//         fontSize: 12,
//         fontWeight: "400",
//         color: "rgba(255,255,255,0.75)",
//     },

//     viewAllContainer: {
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 4,
//     },

//     glanceItemMainContainer: {
//         display: "flex",
//         flexDirection: "row",
//         flexWrap: "wrap",
//     },

//     glanceItemContainer: {
//         width: "31.5%",
//         marginRight: "1.8%",
//         minHeight: 100,
//         backgroundColor: "rgba(255,255,255,0.06)",
//         borderColor: "rgba(255,255,255,0.14)",
//         borderRadius: 12,
//         borderWidth: 1,
//         paddingVertical: 10,
//         justifyContent: "flex-start",
//         alignItems: "center",
//         marginBottom: 12,
//     },

//     countContainer: {
//         justifyContent: "center",
//         alignItems: "center",
//         width: "100%",
//     },

//     iconWrapper: {
//         height: 30,
//         justifyContent: "center",
//         alignItems: "center",
//     },

//     countWrapper: {
//         height: 24,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     countText: {
//         color: "white",
//         fontWeight: "600",
//         fontSize: 18,
//         width: "100%",
//         textAlign: "center",
//     },

//     itemText: {
//         color: "white",
//         fontSize: 11,
//         fontWeight: "600",
//         marginTop: 6,
//         lineHeight: 14,
//         textAlign: "center",
//         width: "100%",
//     },

//     itemSubText: {
//         color: "white",
//         fontSize: 10,
//         marginTop: 2,
//         textAlign: "center",
//         width: "100%",
//     },
// });





