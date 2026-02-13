import MenteeCard from '@/components/Cards/MenteeCard';
import MentorCard from '@/components/Cards/MentorCard';
import RoadmapCard from '@/components/Cards/RoadmapCard';
import RoadmapHeader from '@/components/Header/RoadmapHeader';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ProfileSwiper, { ProfileItem } from '@/components/ProfileSection/ProfileSwiper';
import ActionBottomSheet from '@/components/Sheets/ActionBottomSheet';
import CreateRoadmapSheet, { RoadmapFormData } from '@/components/Sheets/CreateRoadmapSheet';
import { useMentees } from '@/hooks/useMentees';
import { useMentors } from '@/hooks/useMentors';
import { useAllRoadmaps, useDeleteRoadmap } from '@/hooks/roadmap/useRoadmaps';
import { Mentee, Mentor } from '@/types/user.types';
import { getRoadmapCard } from '@/utils/roadmapMapper';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoadmapCardData } from '@/types/roadmap.types';

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

export default function RevitalizationRoadmap() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'roadmap-library' | 'mentors' | 'mentees'>('roadmap-library');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapCardData | null>(null);

    // ✅ Use the new hook for fetching all roadmaps (Director)
    const {
        data: roadmaps = [],
        isLoading: isLoadingRoadmaps,
        error: roadmapsError,
        refetch: refetchRoadmaps,
    } = useAllRoadmaps();

    const deleteRoadmapMutation = useDeleteRoadmap();

    // ✅ Destructure pagination methods for mentors
    const {
        data: mentors,
        isLoading: mentorsLoading,
        fetchNextPage: fetchNextMentors,
        hasNextPage: hasNextMentors,
        isFetchingNextPage: isFetchingNextMentors,
    } = useMentors();

    // ✅ Destructure pagination methods for mentees
    const {
        data: menteesData,
        isLoading: menteesLoading,
        fetchNextPage: fetchNextMentees,
        hasNextPage: hasNextMentees,
        isFetchingNextPage: isFetchingNextMentees,
    } = useMentees();

    // Flatten data for lists
    // const mentees: Mentee[] = menteesData?.pages.flatMap(page => page.mentees) ?? [];

    // ✅ Transform roadmaps to RoadmapCardData
    const roadmapLibrary: RoadmapCardData[] = useMemo(() => {
        return roadmaps
            .filter(roadmap => roadmap != null)
            .map(roadmap => {
                try {
                    return getRoadmapCard(roadmap);
                } catch (error) {
                    console.error('❌ Error transforming roadmap:', roadmap?._id, error);
                    return null;
                }
            })
            .filter(card => card != null) as RoadmapCardData[];
    }, [roadmaps]);

    const getFilterOptions = (): FilterOption[] => {
        return [
            {
                label: 'Course Completion',
                options: ['Latest', 'Oldest'],
                isExpandable: true,
            },
            {
                label: 'State',
                options: STATES,
                isExpandable: true,
            },
            {
                label: 'Conference',
                isExpandable: true,
            },
        ];
    };

    // Menu items for mentees
    const menteeMenuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/mentors/mentor-mentees');
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({ pathname: '/mentees/assign-mentors' as any, params: { id: selectedMentee?.id } });
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({ pathname: '/mentees/remove-mentors' as any, params: { id: selectedMentee?.id } });
                }, 300);
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assessments',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({ pathname: '/(director)/(tabs)/assessments' as any, params: { id: selectedMentee?.id } });
                }, 300);
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Assignments',
            onPress: () => console.log('Assignments'),
        },
        {
            icon: 'clipboard-outline',
            label: 'Roadmaps of Mentees',
            onPress: () => console.log('Roadmaps of Mentees'),
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Mentor Notes',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push({ pathname: `/mentees/notes` as any, params: { id: selectedMentee?.id } });
                }, 300);
            },
        },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => router.push({ pathname: `/mentees/${selectedMentee?.id}/progress` as any, params: { id: selectedMentee?.id } }),
        },
        {
            icon: 'stats-chart-outline',
            label: 'Micro Grant',
            onPress: () => console.log('Progress of Mentees'),
        },
        {
            icon: 'calendar-outline',
            label: 'Product and Services',
            onPress: () => console.log('Schedule a Meeting'),
        },
    ];

    // Menu items for mentors
    const mentorMenuItems = [
        {
            icon: 'people-outline',
            label: 'List of Mentees',
            onPress: () => {
                console.log('List of Mentees: ', selectedMentor?.id);
                router.push({ pathname: '/mentors/mentor-mentees' as any, params: { id: selectedMentor?.id } })
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign New Mentee',
            onPress: () => {
                console.log('Assign New Mentee: ', selectedMentor?.id);
                router.push({ pathname: '/mentors/assign-mentees' as any, params: { id: selectedMentor?.id } })
            },
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove a Mentee',
            onPress: () => router.push({ pathname: '/mentors/remove-mentee' as any, params: { id: selectedMentor?.id } }),
        },
        {
            icon: 'clipboard-outline',
            label: 'Roadmaps of Mentees',
            onPress: () => router.push({ pathname: '/mentors/roadmaps-of-mentees' as any, params: { id: selectedMentor?.id } }),
        },
        {
            icon: 'checkmark-done-outline',
            label: 'Assessments of Mentees',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/assessments');
                }, 300);
            },
        },
        {
            icon: 'book-outline',
            label: 'Assignments of Mentees',
            onPress: () => console.log('Assignments of Mentees'),
        },
        {
            icon: 'stats-chart-outline',
            label: 'Progress of Mentees',
            onPress: () => router.push({ pathname: "/mentors/progress" as any, params: { id: selectedMentor?.id } }),
        },
        {
            icon: 'calendar-outline',
            label: 'Schedule a Meeting',
            onPress: () => console.log("Schedule a Meeting"),
            // onPress: () => router.push({ pathname: "/mentors/meeting" as any, params: { id: selectedMentor?.id } }),
        },
        {
            icon: 'create-outline',
            label: 'Edit Profile',
            onPress: () => router.push({ pathname: `/mentors/${selectedMentor?.id}` as any, params: { id: selectedMentor?.id } }),
        },
    ];

    const fieldMentorMenuItems = [
        {
            icon: 'people-outline',
            label: 'List of Mentees',
            onPress: () => router.push('/mentors/mentor-mentees'),
        },
        {
            icon: 'person-add-outline',
            label: 'Assign New Mentee',
            onPress: () => router.push('/mentors/assign-mentees'),
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove a Mentee',
            onPress: () => router.push('/mentors/remove-mentee'),
        },
        {
            icon: 'calendar-outline',
            label: 'Schedule a Meeting',
            onPress: () => router.push({ pathname: "/mentors/meeting" as any, params: { id: selectedMentor?.id } }),
        },
        {
            icon: 'create-outline',
            label: 'Edit Profile',
            onPress: () => router.push({ pathname: "/mentors/" as any, params: { id: selectedMentor?.id } }),
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove as Field Mentor',
            onPress: () => router.push({ pathname: "/mentors/remove-mentee" as any, params: { id: selectedMentor?.id } }),
        },
    ];

    // ✅ Updated roadmap menu items
    const roadmapMenuItems = [
        {
            icon: 'person-add-outline',
            label: 'Assign to',
            onPress: () => {
                if (!selectedRoadmap) return;
                const roadmap = roadmaps.find(r => r.name === selectedRoadmap.title);
                console.log("Roadmap:", roadmap);
                if (!roadmap) return;

                handleCloseModal();
                setTimeout(() => {
                    router.push({
                        pathname: '/(director)/(tabs)/roadmaps/assign-roadmaps',
                        params: { roadmapIds: JSON.stringify([roadmap._id]) },
                    });
                }, 300);
            },
        },
        {
            icon: 'create-outline',
            label: 'Edit Roadmap',
            onPress: () => {
                if (!selectedRoadmap) return;
                const roadmap = roadmaps.find(r => r.name === selectedRoadmap.title);
                if (!roadmap) return;

                handleCloseModal();

                // ✅ For phase roadmaps: Navigate to phase details page
                if (roadmap.type === 'phase' && roadmap.haveNextedRoadMaps) {
                    setTimeout(() => {
                        router.push({
                            pathname: `/(director)/(tabs)/roadmaps/phase-list`,
                            params: { roadmapId: roadmap._id },
                        });
                    }, 300);
                } else {
                    // ✅ For single roadmaps: Open roadmap form in edit mode
                    setTimeout(() => {
                        router.push({
                            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                            params: {
                                isEditMode: 'true',
                                roadmapId: roadmap._id,
                                type: 'single',
                                name: roadmap.name || '',
                                subheading: roadmap.roadMapDetails || roadmap.description || '',
                                completionTime: roadmap.duration || '',
                                bannerImage: roadmap.imageUrl || '',
                            },
                        });
                    }, 300);
                }
            },
        },
        {
            icon: 'trash-outline',
            label: 'Delete Roadmap',
            onPress: () => {
                if (!selectedRoadmap) return;
                const roadmap = roadmaps.find(r => r.name === selectedRoadmap.title);
                if (!roadmap) return;

                handleCloseModal();

                Alert.alert(
                    'Delete Roadmap',
                    `Are you sure you want to delete "${roadmap.name}"? This action cannot be undone.`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                                // TODO: Implement delete mutation
                                deleteRoadmapMutation.mutate(roadmap._id, {
                                    onSuccess: () => {
                                        console.log('✅ Roadmap deleted successfully');
                                        refetchRoadmaps();
                                    },
                                    onError: (error) => {
                                        console.error('❌ Error deleting roadmap:', error);
                                        Alert.alert(
                                            'Error',
                                            'Failed to delete roadmap. Please try again later.'
                                        );
                                    },
                                });
                            }
                        },
                    ]
                );
            },
        },
    ];

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const createRoadmapModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setSelectedMentor(null);
        setSelectedRoadmap(null);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleMentorMenuPress = useCallback((mentor: Mentor) => {
        setSelectedMentor(mentor);
        setSelectedMentee(null);
        setSelectedRoadmap(null);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleRoadmapMenuPress = useCallback((roadmap: RoadmapCardData) => {
        setSelectedRoadmap(roadmap);
        setSelectedMentee(null);
        setSelectedMentor(null);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedMentee(null);
            setSelectedMentor(null);
            setSelectedRoadmap(null);
        }, 300);
    }, []);

    const handleOpenCreateRoadmapModal = useCallback(() => {
        createRoadmapModalRef.current?.present();
    }, []);

    const handleCloseCreateRoadmapModal = useCallback(() => {
        createRoadmapModalRef.current?.dismiss();
    }, []);

    const handleCreateRoadmapNext = useCallback(
        (data: RoadmapFormData) => {
            console.log('Create Roadmap Data:', data);
            handleCloseCreateRoadmapModal();

            // TODO: Navigate to appropriate screen based on roadmap type
            // This will be handled by CreateRoadmapSheet
        },
        [handleCloseCreateRoadmapModal]
    );

    const handleCreateRoadmapCancel = useCallback(() => {
        handleCloseCreateRoadmapModal();
    }, [handleCloseCreateRoadmapModal]);

    const handleTabChange = (tab: 'roadmap-library' | 'mentors' | 'mentees') => {
        setActiveTab(tab);
    };

    // ✅ Updated handlePhasePress (for clicking roadmap cards)
    const handlePhasePress = useCallback(
        (roadmapData: RoadmapCardData) => {
            const roadmap = roadmaps.find(r => r.name === roadmapData.title);

            if (!roadmap) {
                Alert.alert('Error', 'Roadmap not found');
                return;
            }

            console.log('Selected Roadmap:', roadmap);
            console.log('Roadmap Type:', roadmap.type);
            console.log('Has Nested Roadmaps:', roadmap.haveNextedRoadMaps);
            // ✅ For single roadmaps: Open roadmap form in edit mode
            if (roadmap.type === 'single') {
                router.push({
                    pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                    params: {
                        isEditMode: 'true',
                        roadmapId: roadmap._id,
                        type: 'single',
                        name: roadmap.name || '',
                        subheading: roadmap.roadMapDetails || roadmap.description || '',
                        completionTime: roadmap.duration || '',
                        bannerImage: roadmap.imageUrl || '',
                    },
                });
                return;
            }


            // ✅ For phase roadmaps: Navigate to phase details page (shows list of nested roadmaps)
            if (roadmap.type === 'phase') {
                console.log('Routing to here : ')
                router.push({
                    pathname: `/(director)/(tabs)/roadmaps/phase-list`,
                    params: { roadmapId: roadmap._id },
                });
                return;
            }

            // Fallback
            router.push({
                pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                params: {
                    roadmapId: roadmap._id,
                }
            });
        },
        [roadmaps, router]
    );

    const getFilterDisplayText = () => {
        if (STATES.includes(selectedFilter)) {
            return `State: ${selectedFilter}`;
        }
        return selectedFilter || `Course Completion : ${selectedFilter}`;
    };

    const filterOptions = useMemo(() => getFilterOptions(), []);

    const filteredMentors = useMemo(() => {
        let filtered = mentors?.pages.flatMap(page => page.mentors) ?? [];

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(m =>
                `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [mentors, search]);

    const filteredMentees: Mentee[] = useMemo(() => {
        const allMentees = menteesData?.pages.flatMap(page => page.mentees) ?? [];
        let filtered = allMentees;

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(m =>
                `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [menteesData, search]);

    const filteredRoadmaps = useMemo(() => {
        let filtered = roadmapLibrary;

        if (search) {
            filtered = filtered.filter(
                (roadmap: RoadmapCardData) =>
                    roadmap.title.toLowerCase().includes(search.toLowerCase()) ||
                    roadmap.description?.toLowerCase().includes(search.toLowerCase())
            );
        }

        return filtered;
    }, [roadmapLibrary, search]);

    // Transform mentors to ProfileItem format
    const mentorProfiles: ProfileItem[] = useMemo(() => {
        return filteredMentors.map(m => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName ?? ''}`,
            image: m.profilePicture,
        }));
    }, [filteredMentors]);

    const tabData = [
        { key: 'roadmap-library', label: 'Roadmap Library' },
        { key: 'mentors', label: "Mentor's" },
        { key: 'mentees', label: 'Mentees' },
    ];

    // ✅ List Header Component
    const renderListHeader = () => (
        <View>
            {/* Profile Swiper */}
            <View style={styles.swiperContainer}>
                <ProfileSwiper
                    profiles={mentorProfiles}
                    onProfilePress={profile =>
                        router.push(`/mentors/${profile.id}`)
                    }
                />
            </View>

            {/* Tabs */}
            <TabSwitcher
                tabs={tabData}
                activeTab={activeTab}
                onChange={key =>
                    handleTabChange(key as 'roadmap-library' | 'mentors' | 'mentees')
                }
            />

            {/* Sort By */}
            <View style={styles.sortContainer}>
                <Text style={styles.sortByText}>Sort by</Text>
                <Pressable
                    onPress={() => setFilterModalVisible(true)}
                    style={styles.filterButton}
                >
                    <Text style={styles.filterButtonText} numberOfLines={1}>
                        {getFilterDisplayText()}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#fff" />
                </Pressable>
            </View>
        </View>
    );

    // ✅ List Footer Component for Pagination
    const renderListFooter = () => {
        const isFetching = activeTab === 'mentors' ? isFetchingNextMentors :
                           activeTab === 'mentees' ? isFetchingNextMentees : false;

        if (isFetching) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.loadingText}>Loading more...</Text>
                </View>
            );
        }
        return <View style={{ height: bottom + height * 0.05 }} />;
    };

    // ✅ Data Source based on Tab
    const getListData = (): any[] => {
        switch (activeTab) {
            case 'roadmap-library':
                return filteredRoadmaps;
            case 'mentors':
                return filteredMentors;
            case 'mentees':
                return filteredMentees;
            default:
                return [];
        }
    };

    // ✅ Render Item based on Tab
    const renderItem = ({ item }: { item: any }) => {
        if (activeTab === 'roadmap-library') {
            const roadmap = item as RoadmapCardData;
            return (
                <View style={styles.cardWrapper}>
                    <RoadmapCard
                        data={roadmap}
                        showMenu={true}
                        onMenuPress={() => handleRoadmapMenuPress(roadmap)}
                        onPress={() => handlePhasePress(roadmap)}
                    />
                </View>
            );
        } else if (activeTab === 'mentors') {
            const mentor = item as Mentor;
            return (
                <TouchableOpacity activeOpacity={0.8} style={styles.cardWrapper}>
                    <MentorCard
                        onPress={() => {
                            router.push({
                                pathname: `/(director)/(tabs)/mentors/${mentor.id}` as any,
                                params: { email: mentor.email },
                            })
                        }}
                        mentor={{
                            id: mentor.id,
                            name: `${mentor.firstName} ${mentor.lastName ?? ''}`,
                            role: mentor.role === 'field_mentor' ? 'Field Mentor' : 'Mentor',
                            menteesCount: mentor.assignedId?.length ?? 0,
                            description: mentor.profileInfo ?? '',
                            profilePicture: mentor.profilePicture,
                        }}
                        layout={viewMode}
                        onCall={() => console.log('Call', mentor.phoneNumber)}
                        onChat={() => console.log('Chat', mentor.id)}
                        onMail={() => console.log('Mail', mentor.email)}
                        onWhatsApp={() => console.log('WhatsApp', mentor.phoneNumber)}
                        onMenu={() => handleMentorMenuPress(mentor)}
                    />
                </TouchableOpacity>
            );
        } else if (activeTab === 'mentees') {
            const mentee = item as Mentee;
            return (
                 <View style={styles.cardWrapper}>
                    <MenteeCard
                        data={mentee}
                        layout={viewMode}
                        onPress={() =>
                            router.push({
                                pathname: `/(director)/(tabs)/roadmaps/roadmap-paths` as any,
                                params: { email: mentee.email },
                            })
                        }
                        onCall={() => console.log('Call', mentee.phoneNumber)}
                        onChat={() => console.log('Chat', mentee.id)}
                        onMail={() => console.log('Mail', mentee.email)}
                        onWhatsApp={() => console.log('WhatsApp', mentee.phoneNumber)}
                        onMenuPress={() => handleMenuPress(mentee)}
                        onMarkComplete={() => console.log('Mark complete', mentee.firstName)}
                        onIssueCertificate={() => console.log('Issue certificate', mentee.firstName)}
                        onInviteAsFieldMentor={() => console.log('Invite as field mentor', mentee.firstName)}
                    />
                </View>
            );
        }
        return null;
    };

    // ✅ On End Reached
    const handleEndReached = () => {
        if (activeTab === 'mentors' && hasNextMentors && !isFetchingNextMentors) {
            fetchNextMentors();
        } else if (activeTab === 'mentees' && hasNextMentees && !isFetchingNextMentees) {
            fetchNextMentees();
        }
    };


    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <View style={styles.flex1}>
                <TopBar notifications={3} showUserName={true} showNotifications={true} />
                <RoadmapHeader
                    handleOpenCreateRoadmapModal={handleOpenCreateRoadmapModal}
                    activeTab={activeTab}
                />
                <View style={styles.searchContainer}>
                    <SearchBar value={search} onChangeValue={setSearch} />
                </View>

                {/* ✅ Single Main FlatList */}
                {/* Check for empty state or loading for initial load if needed, but handled inside hooks */}
                {((activeTab === 'mentors' && mentorsLoading) || 
                  (activeTab === 'mentees' && menteesLoading) || 
                  (activeTab === 'roadmap-library' && isLoadingRoadmaps)) && !getListData().length ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={getListData()}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item.id || item._id || index.toString()}
                        ListHeaderComponent={renderListHeader}
                        ListFooterComponent={renderListFooter}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.5}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={
                        selectedMentee
                            ? `${selectedMentee.firstName} ${selectedMentee.lastName ?? ''}`
                            : selectedMentor
                                ? `${selectedMentor.firstName} ${selectedMentor.lastName ?? ''}`
                                : selectedRoadmap?.title || ''
                    }
                    subtitle={
                        selectedMentor
                            ? `${selectedMentor.assignedId?.length ?? 0} Mentees`
                            : selectedRoadmap
                                ? selectedRoadmap.completionTime
                                : undefined
                    }
                    image={selectedMentee?.profilePicture || selectedMentor?.profilePicture}
                    actions={
                        selectedRoadmap
                            ? roadmapMenuItems
                            : selectedMentor
                                ? selectedMentor.role === 'field_mentor'
                                    ? fieldMentorMenuItems
                                    : mentorMenuItems
                                : menteeMenuItems
                    }
                    onClose={handleCloseModal}
                />

                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedFilter}
                    onFilterSelect={filter => {
                        setSelectedFilter(filter);
                        setFilterModalVisible(false);
                    }}
                    filterOptions={filterOptions}
                />

                <CreateRoadmapSheet
                    ref={createRoadmapModalRef}
                    onClose={handleCloseCreateRoadmapModal}
                    onCancel={handleCreateRoadmapCancel}
                    mode="create"
                />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1 },
    searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
    swiperContainer: { marginBottom: 16 },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortByText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    filterButtonText: { color: '#fff', fontSize: 13, fontWeight: '500' },
    contentList: {
        // paddingBottom: 100, // Moved to ListFooterComponent
    },
    listContent: {
        paddingTop: 6,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
    errorContent: { alignItems: 'center', padding: 24, marginTop: 40 },
    errorTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 16 },
    errorMessage: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8, marginBottom: 24 },
    retryButton: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    retryButtonText: { color: '#176192', fontWeight: '600' },
    emptyIcon: { opacity: 0.5, marginBottom: 16 },
    emptyText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    emptySubtext: { color: 'rgba(255,255,255,0.7)', marginTop: 8 },
    cardWrapper: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
});
