import { Appointment, TimeSlot as APITimeSlot } from '@/types/appointment.types';
import { Mentor, Mentee } from '@/types/user.types';
import {
    getDeviceType,
    getFontSize,
    getIconSize,
    getSpacing,
    isAndroid,
    isSmallDevice
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatTimeSlot, useMonthlyAvailability } from '@/hooks/useMentorsAvailability';
import GradientCalendar from '../Appointments/calendar';
import SimpleSuccessModal from '../Appointments/SimpleSuccessModal';
import SearchBar from '../Header/SearchBar';
import { useMentors } from '@/hooks/useMentors';
import { useMentees } from '@/hooks/useMentees';

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    label: string;
    apiSlot: APITimeSlot;
}

export interface ScheduleMeetingBottomSheetProps {
    mentors: Mentor[];
    onClose: () => void;
    onSchedule: (data: {
        mentorId: string;
        meetingDate: string;
        platform: string;
        meetingLink?: string;
        notes?: string;
        // Optional fields for rescheduling (not required for initial schedule)
        startTime?: string;
        startPeriod?: 'AM' | 'PM' | string;
    }) => void;
    mode?: 'schedule' | 'reschedule';
    existingAppointment?: Appointment | null;
    colorScheme?: {
        background?: string;
        text?: string;
        accent?: string;
        cardBackground?: string;
    };
    disableOutsideClose?: boolean;
    showCancelButton?: boolean;
    onScheduleComplete?: () => void;
}
const ScheduleMeetingBottomSheet = forwardRef<BottomSheetModal, ScheduleMeetingBottomSheetProps>(
    (
        {
            mentors,
            onClose,
            onSchedule,
            mode = 'schedule',
            existingAppointment,
            colorScheme = {
                background: '#1E3A6F',
                text: '#FFFFFF',
                accent: '#FFC107',
                cardBackground: 'rgba(255, 255, 255, 0.1)',
            },
            disableOutsideClose = false,
            showCancelButton = true,
            onScheduleComplete,
        },
        ref
    ) => {
        const { bottom } = useSafeAreaInsets();
        const deviceType = getDeviceType();
        const snapPoints = useMemo(() => ['85%'], []);

        // ✅ Initialize mentor BEFORE using it
        const initialMentor = useMemo(() => {
            if (mode === 'reschedule' && existingAppointment) {
                return mentors.find(m => m.id === existingAppointment.mentorId) || null;
            }
            return null;
        }, [mode, existingAppointment, mentors]);

        // Initialize state
        const [currentStep, setCurrentStep] = useState<1 | 2>(mode === 'reschedule' ? 2 : 1);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(initialMentor);
        const [selectedDate, setSelectedDate] = useState<string>(
            mode === 'reschedule' && existingAppointment
                ? existingAppointment.meetingDate.split('T')[0]
                : ''
        );
        const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
        const [selectedRole, setSelectedRole] = useState<'mentor' | 'field_mentor' | 'mentee'>('mentor');
        const [meetingOption, setMeetingOption] = useState('Zoom Meeting');
        const [showMeetingOptions, setShowMeetingOptions] = useState(false);
        const [showSuccessModal, setShowSuccessModal] = useState(false);

        // Infinite scroll hooks
        const {
            data: mentorsData,
            fetchNextPage: fetchNextMentorsPage,
            hasNextPage: hasNextMentorsPage,
            isFetchingNextPage: isFetchingNextMentorsPage
        } = useMentors(20);

        const {
            data: menteesData,
            fetchNextPage: fetchNextMenteesPage,
            hasNextPage: hasNextMenteesPage,
            isFetchingNextPage: isFetchingNextMenteesPage
        } = useMentees(20);

        const allMentors = useMemo(() => mentorsData?.pages.flatMap((page: any) => page.mentors) || [], [mentorsData]);
        const allMentees = useMemo(() => menteesData?.pages.flatMap((page: any) => page.mentees) || [], [menteesData]);

        // Combined data for Step 1
        const mentorListStep1 = useMemo(() => {
            if (selectedRole === 'mentee') return allMentees;
            // For mentor and field_mentor, we currently filter from the same mentor list
            return allMentors;
        }, [selectedRole, allMentors, allMentees]);

        // Get current month and year for availability
        const currentDate = new Date();
        const [currentMonth] = useState(currentDate.getMonth() + 1);
        const [currentYear] = useState(currentDate.getFullYear());

        // ✅ Fix: Make sure selectedMentor is set before fetching availability
        const mentorIdForAvailability = useMemo(() => {
            if (selectedMentor?.id) {
                return selectedMentor.id;
            }
            // In reschedule mode, use the appointment's mentor ID
            if (mode === 'reschedule' && existingAppointment) {
                return existingAppointment.mentorId;
            }
            return null;
        }, [selectedMentor, mode, existingAppointment]);

        // Fetch availability for selected mentor
        const {
            availability: monthlyAvailability,
            isLoading: isLoadingAvailability,
        } = useMonthlyAvailability({
            mentorId: mentorIdForAvailability,
            month: currentMonth,
            year: currentYear,
        });

        // Transform API availability to available dates
        const availableDates = useMemo(() => {
            if (!monthlyAvailability) {
                return [];
            }
            return monthlyAvailability
                .filter(day => day.slots.length > 0)
                .map(day => day.date);
        }, [monthlyAvailability]);

        // Get days of week that have availability
        const availableDaysOfWeek = useMemo(() => {
            if (!monthlyAvailability) return [];
            const daysSet = new Set(
                monthlyAvailability
                    .filter(day => day.slots.length > 0)
                    .map(day => day.day)
            );
            return Array.from(daysSet);
        }, [monthlyAvailability]);

        // Transform API slots for selected date
        const getTimeSlotsForDate = useCallback((dateString: string): TimeSlot[] => {
            if (!dateString || !monthlyAvailability) return [];

            const dayData = monthlyAvailability.find(day => day.date === dateString);
            if (!dayData || dayData.slots.length === 0) return [];

            return dayData.slots.map((slot, index) => ({
                id: slot._id || `${dateString}-${index}`,
                startTime: `${slot.startTime} ${slot.startPeriod}`,
                endTime: `${slot.endTime} ${slot.endPeriod}`,
                label: formatTimeSlot(slot),
                apiSlot: slot,
            }));
        }, [monthlyAvailability]);

        const timeSlots = useMemo(() =>
            getTimeSlotsForDate(selectedDate),
            [selectedDate, getTimeSlotsForDate]
        );

        const meetingOptions = [
            { id: 'zoom', label: 'Zoom', icon: 'videocam-outline' },
            { id: 'google_meet', label: 'Google Meet', icon: 'videocam-outline' },
            { id: 'teams', label: 'Microsoft Teams', icon: 'videocam-outline' },
            { id: 'phone', label: 'Phone Call', icon: 'call-outline' },
            { id: 'in_person', label: 'In-Person Meeting', icon: 'people-outline' },
        ];

        const filteredMentors = useMemo(() => {
            let list = mentorListStep1;

            if (selectedRole === 'mentor') {
                list = allMentors.filter(m => m.role?.toLowerCase() === 'mentor');
            } else if (selectedRole === 'field_mentor') {
                list = allMentors.filter(m => m.role?.toLowerCase() === 'field_mentor');
            } else if (selectedRole === 'mentee') {
                list = allMentees;
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                list = list.filter(mentor =>
                    mentor.firstName.toLowerCase().includes(query) ||
                    (mentor.lastName || '').toLowerCase().includes(query)
                );
            }

            return list;
        }, [mentorListStep1, allMentors, allMentees, selectedRole, searchQuery]);

        const handleLoadMore = () => {
            if (selectedRole === 'mentee') {
                if (hasNextMenteesPage && !isFetchingNextMenteesPage) {
                    fetchNextMenteesPage();
                }
            } else {
                if (hasNextMentorsPage && !isFetchingNextMentorsPage) {
                    fetchNextMentorsPage();
                }
            }
        };

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                    pressBehavior={disableOutsideClose ? 'none' : 'close'}
                />
            ),
            [disableOutsideClose]
        );

        const handleNext = () => {
            if (currentStep === 1 && selectedMentor) {
                setCurrentStep(2);
            }
        };

        const handleBack = () => {
            if (mode === 'reschedule') {
                handleClose();
            } else if (currentStep === 2) {
                setCurrentStep(1);
            }
        };

        const handleSchedule = () => {
            if (selectedMentor && selectedDate && selectedTime) {
                // Build meeting date in ISO format
                const [year, month, day] = selectedDate.split('-').map(Number);
                let hour = parseInt(selectedTime.apiSlot.startTime, 10);
                if (selectedTime.apiSlot.startPeriod === 'PM' && hour !== 12) {
                    hour += 12;
                } else if (selectedTime.apiSlot.startPeriod === 'AM' && hour === 12) {
                    hour = 0;
                }

                const istDate = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0));
                const utcTimestamp = istDate.getTime() - (5.5 * 60 * 60 * 1000);
                const meetingDate = new Date(utcTimestamp).toISOString();

                // Map platform
                const platformMap: Record<string, string> = {
                    'Zoom': 'zoom',
                    'Google Meet': 'google_meet',
                    'Microsoft Teams': 'teams',
                    'Phone Call': 'phone',
                    'In-Person Meeting': 'in_person',
                };
                const platform = meetingOption.toLowerCase().replace(' ', '_');

                onSchedule({
                    mentorId: selectedMentor.id,
                    meetingDate,
                    platform,
                    meetingLink: platform === 'zoom' ? 'https://zoom.us/j/123456789' : undefined,
                    notes: `Meeting with ${selectedMentor.firstName} ${selectedMentor.lastName || ''}`,
                    ...(mode === 'reschedule' && {
                        startTime: selectedTime.apiSlot.startTime,
                        startPeriod: selectedTime.apiSlot.startPeriod,
                    }),
                });

                if (onScheduleComplete) {
                    onScheduleComplete();
                }

                setShowSuccessModal(true);

                setTimeout(() => {
                    onClose();
                    resetForm();
                }, 2000);
            }
        };

        const resetForm = () => {
            setCurrentStep(mode === 'reschedule' ? 2 : 1);
            setSelectedMentor(initialMentor);
            setSelectedDate('');
            setSelectedTime(null);
            setSearchQuery('');
            setMeetingOption('Zoom');
            setShowMeetingOptions(false);
            setShowSuccessModal(false);
        };

        const handleClose = () => {
            if (!disableOutsideClose) {
                onClose();
                setTimeout(() => {
                    resetForm();
                }, 300);
            }
        };

        const isStep1Valid = selectedMentor !== null;
        const isStep2Valid = selectedDate && selectedTime;

        const showMentorSelection = mode === 'schedule' && currentStep === 1;
        const showDateTimeSelection = mode === 'reschedule' || currentStep === 2;

        return (
            <>
                <BottomSheetModal
                    ref={ref}
                    snapPoints={snapPoints}
                    enablePanDownToClose={!disableOutsideClose}
                    backgroundComponent={() => null}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={styles.handleIndicator}
                    onDismiss={handleClose}
                >
                    <LinearGradient
                        colors={['#264387', '#1D548D', '#176192']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 }}
                    >
                        <View style={styles.contentContainer}>
                            {showMentorSelection ? (
                                <View style={{ flex: 1 }}>
                                    <View style={styles.stepContentNoScroll}>
                                        <View style={[styles.titleContainer, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                            <Text style={[styles.stepTitleLarge, { color: colorScheme.text }]}>
                                                Select for the Meeting
                                            </Text>
                                        </View>

                                        <View style={styles.roleSelectorContainer}>
                                            <Pressable
                                                style={[styles.roleTab, selectedRole === 'mentor' && styles.activeRoleTab]}
                                                onPress={() => setSelectedRole('mentor')}
                                            >
                                                <Text style={[styles.roleTabText, selectedRole === 'mentor' && styles.activeRoleTabText]}>Mentor</Text>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.roleTab, selectedRole === 'field_mentor' && styles.activeRoleTab]}
                                                onPress={() => setSelectedRole('field_mentor')}
                                            >
                                                <Text style={[styles.roleTabText, selectedRole === 'field_mentor' && styles.activeRoleTabText]}>Field Mentor</Text>
                                            </Pressable>
                                            <Pressable
                                                style={[styles.roleTab, selectedRole === 'mentee' && styles.activeRoleTab]}
                                                onPress={() => setSelectedRole('mentee')}
                                            >
                                                <Text style={[styles.roleTabText, selectedRole === 'mentee' && styles.activeRoleTabText]}>Mentee</Text>
                                            </Pressable>
                                        </View>

                                        <View style={styles.searchBarContainer}>
                                            <SearchBar
                                                backgroundColor='transparent'
                                                placeholder='Search'
                                                value={searchQuery}
                                                onChangeValue={setSearchQuery}
                                            />
                                        </View>
                                    </View>

                                    <View style={[styles.mentorListContainer, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
                                        {filteredMentors.length > 0 ? (
                                            <BottomSheetFlatList
                                                data={filteredMentors}
                                                renderItem={({ item: mentor }: { item: Mentor }) => (
                                                    <Pressable
                                                        style={styles.mentorItemStep1}
                                                        onPress={() => setSelectedMentor(mentor)}
                                                    >
                                                        <View style={[
                                                            styles.radioButtonStep1,
                                                            {
                                                                borderColor: 'rgba(255, 255, 255, 0.6)',
                                                                backgroundColor: selectedMentor?.id === mentor.id ? '#FFFFFF' : 'transparent'
                                                            }
                                                        ]}>
                                                            {selectedMentor?.id === mentor.id && (
                                                                <View style={styles.radioInner} />
                                                            )}
                                                        </View>

                                                        {mentor.profilePicture ? (
                                                            <Image
                                                                source={{ uri: mentor.profilePicture }}
                                                                style={styles.mentorImageStep1}
                                                            />
                                                        ) : (
                                                            <View style={[styles.mentorImagePlaceholderStep1, { backgroundColor: colorScheme.cardBackground }]}>
                                                                <Ionicons name="person" size={getIconSize(18)} color={colorScheme.text} />
                                                            </View>
                                                        )}

                                                        <View style={{ flex: 1 }}>
                                                            <Text style={[styles.mentorNameStep1, { color: colorScheme.text }]}>
                                                                {mentor.firstName} {mentor.lastName || ''}
                                                            </Text>
                                                            <Text style={[styles.mentorRoleStep1, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                                                                {mentor.role}
                                                            </Text>
                                                        </View>
                                                    </Pressable>
                                                )}
                                                keyExtractor={(item: Mentor) => item.id}
                                                showsVerticalScrollIndicator={false}
                                                onEndReached={handleLoadMore}
                                                onEndReachedThreshold={0.5}
                                                contentContainerStyle={{ paddingBottom: getSpacing(20) }}
                                                ListFooterComponent={
                                                    (isFetchingNextMentorsPage || isFetchingNextMenteesPage) ? (
                                                        <View style={{ paddingVertical: 20 }}>
                                                            <ActivityIndicator color={colorScheme.text} />
                                                        </View>
                                                    ) : null
                                                }
                                            />
                                        ) : (
                                            <View style={styles.emptyStateContainer}>
                                                <Text style={[styles.emptyStateText, { color: 'rgba(255, 255, 255, 0.6)' }]}>
                                                    No {selectedRole === 'mentor' ? 'mentors' : selectedRole === 'field_mentor' ? 'field mentors' : 'mentees'} found
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={[styles.step1Footer, { paddingBottom: bottom + getSpacing(12) }]}>
                                        {showCancelButton && (
                                            <Pressable
                                                style={[styles.cancelButton, { borderColor: 'rgba(255, 255, 255, 0.5)', backgroundColor: '#FFFFFF' }]}
                                                onPress={handleClose}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: '#4A5BCC' }]}>
                                                    Cancel
                                                </Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            style={[
                                                styles.nextButton,
                                                {
                                                    backgroundColor: 'rgba(30, 54, 111, 1)',
                                                    borderWidth: 1,
                                                    borderColor: isStep1Valid ? '#fff' : 'rgba(74, 91, 204, 0.5)',
                                                    flex: showCancelButton ? undefined : 1,
                                                }
                                            ]}
                                            onPress={handleNext}
                                            disabled={!isStep1Valid}
                                        >
                                            <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>
                                                Next
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ) : showDateTimeSelection ? (
                                <BottomSheetScrollView 
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: bottom + getSpacing(24) }}
                                >
                                    <View style={styles.stepContent}>
                                        {mode === 'reschedule' && selectedMentor && (
                                            <View style={[styles.titleContainer, { borderColor: 'rgba(255, 255, 255, 0.3)', marginBottom: 16 }]}>
                                                <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                                                    Rescheduling with {selectedMentor.firstName} {selectedMentor.lastName || ''}
                                                </Text>
                                            </View>
                                        )}

                                        <Text style={[styles.stepTitle, { color: colorScheme.text }]}>
                                            Select Available Date
                                        </Text>

                                        <View style={styles.calendarContainer}>
                                            <GradientCalendar
                                                selected={selectedDate}
                                                setSelected={setSelectedDate}
                                                recurringAvailability={{
                                                    type: 'weekly',
                                                    daysOfWeek: availableDaysOfWeek,
                                                }}
                                                availableDates={availableDates}
                                                showHeader={true}
                                                disablePastDates={true}
                                                markToday={true}
                                            />
                                        </View>

                                        {selectedDate && (
                                            <>
                                                <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                                                    Select a Time
                                                </Text>

                                                {isLoadingAvailability ? (
                                                    <View style={styles.noTimeSlotsContainer}>
                                                        <Text style={[styles.noTimeSlotsText, { color: `${colorScheme.text}80` }]}>
                                                            Loading available slots...
                                                        </Text>
                                                    </View>
                                                ) : timeSlots.length > 0 ? (
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        style={styles.timeSlotContainer}
                                                    >
                                                        {timeSlots.map((slot) => (
                                                            <Pressable
                                                                key={slot.id}
                                                                style={[
                                                                    styles.timeSlot,
                                                                    {
                                                                        backgroundColor: selectedTime?.id === slot.id
                                                                            ? '#FFFFFF'
                                                                            : 'transparent',
                                                                        borderColor: selectedTime?.id === slot.id
                                                                            ? '#FFFFFF'
                                                                            : `${colorScheme.text}50`,
                                                                    }
                                                                ]}
                                                                onPress={() => setSelectedTime(slot)}
                                                            >
                                                                <Text style={[
                                                                    styles.timeSlotText,
                                                                    {
                                                                        color: selectedTime?.id === slot.id
                                                                            ? colorScheme.background
                                                                            : colorScheme.text
                                                                    }
                                                                ]}>
                                                                    {slot.label}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </ScrollView>
                                                ) : (
                                                    <View style={styles.noTimeSlotsContainer}>
                                                        <Text style={[styles.noTimeSlotsText, { color: `${colorScheme.text}80` }]}>
                                                            No available time slots for this date
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        )}

                                        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                                            Preferred Meeting Option
                                        </Text>

                                        <Pressable
                                            style={[
                                                styles.dropdownButton,
                                                {
                                                    backgroundColor: 'transparent',
                                                    borderColor: `${colorScheme.text}50`
                                                }
                                            ]}
                                            onPress={() => setShowMeetingOptions(!showMeetingOptions)}
                                        >
                                            <Text style={[styles.dropdownText, { color: colorScheme.text }]}>
                                                {meetingOption}
                                            </Text>
                                            <Ionicons
                                                name={showMeetingOptions ? "chevron-up" : "chevron-down"}
                                                size={getIconSize(16)}
                                                color={colorScheme.text}
                                            />
                                        </Pressable>

                                        {showMeetingOptions && (
                                            <View style={[styles.dropdownOptions, { backgroundColor: 'transparent', borderColor: `${colorScheme.text}30` }]}>
                                                {meetingOptions.map((option) => (
                                                    <Pressable
                                                        key={option.id}
                                                        style={styles.dropdownOption}
                                                        onPress={() => {
                                                            setMeetingOption(option.label);
                                                            setShowMeetingOptions(false);
                                                        }}
                                                    >
                                                        <Ionicons name={option.icon as any} size={getIconSize(16)} color={colorScheme.text} />
                                                        <Text style={[styles.dropdownOptionText, { color: colorScheme.text }]}>
                                                            {option.label}
                                                        </Text>
                                                        {meetingOption === option.label && (
                                                            <Ionicons name="checkmark" size={getIconSize(14)} color={colorScheme.accent} />
                                                        )}
                                                    </Pressable>
                                                ))}
                                            </View>
                                        )}

                                        <View style={styles.step2Footer}>
                                            <Pressable
                                                style={[styles.cancelButton, { borderColor: `${colorScheme.text}80`, backgroundColor: '#FFFFFF' }]}
                                                onPress={handleBack}
                                            >
                                                <Text style={[styles.cancelButtonText, { color: '#4A5BCC' }]}>
                                                    {mode === 'reschedule' ? 'Cancel' : 'Back'}
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={[
                                                    styles.scheduleButton,
                                                    {
                                                        backgroundColor: 'rgba(30, 54, 111, 1)',
                                                        borderWidth: 1,
                                                        borderColor: isStep2Valid ? '#fff' : 'rgba(74, 91, 204, 0.5)',
                                                    }
                                                ]}
                                                onPress={handleSchedule}
                                                disabled={!isStep2Valid}
                                            >
                                                <Text style={[styles.scheduleButtonText, { color: '#FFFFFF' }]}>
                                                    {mode === 'reschedule' ? 'Reschedule' : 'Schedule'}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </BottomSheetScrollView>
                            ) : null}
                        </View>
                    </LinearGradient>
                </BottomSheetModal>

                <SimpleSuccessModal
                    visible={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title={mode === 'reschedule' ? 'Appointment has been Rescheduled' : 'Appointment has been Scheduled'}
                />
            </>
        );
    }
);

const styles = StyleSheet.create({
    handleIndicator: {
        display: 'none',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: getSpacing(16),
    },
    stepContent: {
        flexGrow: 1,
    },
    stepContentNoScroll: {
        flexShrink: 0,
    },
    mentorListContainer: {
        flex: 1,
        borderWidth: 1.5,
        borderRadius: getSpacing(12),
        padding: getSpacing(isSmallDevice ? 14 : 16),
        marginBottom: getSpacing(isSmallDevice ? 8 : 12),
        overflow: 'hidden',
    },
    stepTitle: {
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        fontWeight: '600',
        marginBottom: getSpacing(isSmallDevice ? 16 : 18),
        textAlign: 'center',
    },
    titleContainer: {
        borderWidth: 1.5,
        borderRadius: getSpacing(12),
        paddingVertical: getSpacing(isSmallDevice ? 12 : 14),
        paddingHorizontal: getSpacing(isSmallDevice ? 14 : 16),
        marginBottom: getSpacing(isSmallDevice ? 10 : 12),
        alignItems: 'center',
    },
    stepTitleLarge: {
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    roleSelectorContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
        padding: 4,
        marginBottom: getSpacing(12),
    },
    roleTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeRoleTab: {
        backgroundColor: '#FFFFFF',
    },
    roleTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    activeRoleTabText: {
        color: '#1E3A6F',
    },
    searchBarContainer: {
        marginBottom: getSpacing(isSmallDevice ? 10 : 12),
    },
    mentorListStep1: {
        borderWidth: 1.5,
        borderRadius: getSpacing(12),
        padding: getSpacing(isSmallDevice ? 14 : 16),
        marginBottom: getSpacing(isSmallDevice ? 16 : 18),
    },
    mentorItemStep1: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(isSmallDevice ? 8 : 10),
    },
    radioButtonStep1: {
        width: getSpacing(isSmallDevice ? 18 : 20),
        height: getSpacing(isSmallDevice ? 18 : 20),
        borderRadius: getSpacing(isSmallDevice ? 9 : 10),
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getSpacing(isSmallDevice ? 10 : 12),
    },
    radioInner: {
        width: getSpacing(isSmallDevice ? 7 : 8),
        height: getSpacing(isSmallDevice ? 7 : 8),
        borderRadius: getSpacing(isSmallDevice ? 3.5 : 4),
        backgroundColor: '#4A5BCC',
    },
    mentorImageStep1: {
        width: getSpacing(isSmallDevice ? 28 : 32),
        height: getSpacing(isSmallDevice ? 28 : 32),
        borderRadius: getSpacing(isSmallDevice ? 14 : 16),
        marginRight: getSpacing(isSmallDevice ? 8 : 10),
    },
    mentorImagePlaceholderStep1: {
        width: getSpacing(isSmallDevice ? 28 : 32),
        height: getSpacing(isSmallDevice ? 28 : 32),
        borderRadius: getSpacing(isSmallDevice ? 14 : 16),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getSpacing(isSmallDevice ? 8 : 10),
    },
    mentorNameStep1: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    mentorRoleStep1: {
        fontSize: getFontSize(isSmallDevice ? 10 : 11),
        marginTop: 2,
        textTransform: 'capitalize',
    },
    loadMoreButton: {
        paddingVertical: getSpacing(12),
        alignItems: 'center',
        marginTop: getSpacing(8),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    loadMoreText: {
        color: '#FFFFFF',
        fontSize: getFontSize(13),
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    emptyStateContainer: {
        paddingVertical: getSpacing(20),
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: getFontSize(13),
        fontStyle: 'italic',
    },
    step1Footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: getSpacing(isSmallDevice ? 8 : 12),
        marginTop: getSpacing(isSmallDevice ? 16 : 18),
        marginBottom: getSpacing(6),
        width: '100%',
        paddingHorizontal: getSpacing(isSmallDevice ? 6 : 12),
    },
    cancelButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    scheduleButton: {
        minWidth: 110,
        flexGrow: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    nextButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    scheduleButtonText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        fontWeight: '600',
    },
    step2Footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: getSpacing(isSmallDevice ? 8 : 12),
        marginTop: getSpacing(isSmallDevice ? 18 : 20),
        width: '100%',
        paddingHorizontal: getSpacing(isSmallDevice ? 6 : 12),
    },
    sectionTitle: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        marginBottom: getSpacing(12),
        marginTop: getSpacing(16),
    },
    calendarContainer: {
        borderRadius: getSpacing(12),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    timeSlotContainer: {
        marginTop: getSpacing(8),
        marginBottom: getSpacing(16),
    },
    timeSlot: {
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(10),
        borderRadius: getSpacing(20),
        borderWidth: 1,
        marginRight: getSpacing(10),
        minWidth: getSpacing(100),
        alignItems: 'center',
    },
    timeSlotText: {
        fontSize: getFontSize(13),
        fontWeight: '600',
    },
    noTimeSlotsContainer: {
        paddingVertical: getSpacing(20),
        alignItems: 'center',
    },
    noTimeSlotsText: {
        fontSize: getFontSize(13),
        fontStyle: 'italic',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(12),
        borderRadius: getSpacing(10),
        borderWidth: 1,
        marginBottom: getSpacing(8),
    },
    dropdownText: {
        fontSize: getFontSize(14),
        fontWeight: '500',
    },
    dropdownOptions: {
        borderRadius: getSpacing(10),
        borderWidth: 1,
        marginTop: getSpacing(-4),
        marginBottom: getSpacing(16),
        overflow: 'hidden',
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(12),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dropdownOptionText: {
        fontSize: getFontSize(14),
        fontWeight: '500',
        marginLeft: getSpacing(12),
        flex: 1,
    },
});

export default ScheduleMeetingBottomSheet;
