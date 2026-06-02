import MenteeProgressCard from '@/components/Cards/MenteeCard/MenteeProgressCard';
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
import { useOverallProgressList } from '@/hooks/useProgress';
import { useAllRoadmaps, useDeleteRoadmap } from '@/hooks/roadmap/useRoadmaps';
import { Mentee, Mentor } from '@/types/user.types';
import { getRoadmapCard } from '@/utils/roadmapMapper';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GradientBackground } from '@/components/ui/design-system';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
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
import {
    chatNotAvailableYet,
    dialPhone,
    featureNotAvailableYet,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';
import { Routes } from '@/navigation/routes';

const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

export default function RevitalizationRoadmap() {
    const router = useRouter();

    const [search, setSearch] = useState('');
    // const [activeTab, setActiveTab] = useState<'roadmap-library' | 'mentors' | 'mentees'>('roadmap-library');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapCardData | null>(null);

    const params = useLocalSearchParams();
    console.log("params", params.tab);
    const validTabs = ['roadmap-library', 'mentors', 'mentees'] as const;

    type TabType = (typeof validTabs)[number];

    const initialTab: TabType =
        params?.tab && validTabs.includes(params.tab as TabType)
            ? (params.tab as TabType)
            : 'roadmap-library';

    const [activeTab, setActiveTab] = useState<
        'roadmap-library' | 'mentors' | 'mentees'
    >(initialTab);

    useEffect(() => {
        if (params?.tab && validTabs.includes(params.tab as TabType)) {
            setActiveTab(params.tab as TabType);
        } else {
            setActiveTab('roadmap-library');
        }
    }, [params?.tab]);
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
    } = useMentors(100);

    // ✅ Destructure pagination methods for mentees
    const {
        data: menteesData,
        isLoading: menteesLoading,
        fetchNextPage: fetchNextMentees,
        hasNextPage: hasNextMentees,
        isFetchingNextPage: isFetchingNextMentees,
    } = useMentees();

    const { data: pastorsOverview = [] } = useOverallProgressList(['pastor']);

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
                label: 'Roadmap Completion Rate',
                options: ['Lowest', 'Highest'],
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
                    router.push({
                        pathname: '/(director)/(tabs)/roadmaps',
                        params: { id: selectedMentee?.id ?? '' },
                    });
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
        // {
        //     icon: 'person-remove-outline',
        //     label: 'Assignments',
        //     onPress: () => {
        //         handleCloseModal();
        //         setTimeout(() => router.push('/(director)/(tabs)/assignments'), 300);
        //     },
        // },
        // {
        //     icon: 'clipboard-outline',
        //     label: 'Roadmaps of Mentees',
        //     onPress: () => {
        //         if (!selectedMentee?.id) return;
        //         handleCloseModal();
        //         setTimeout(
        //             () =>
        //                 router.push({
        //                     pathname: '/(director)/(tabs)/mentees/[id]/progress',
        //                     params: { id: selectedMentee.id },
        //                 } as any),
        //             300,
        //         );
        //     },
        // },
        // {
        //     icon: 'checkmark-done-outline',
        //     label: 'Mentor Notes',
        //     onPress: () => {
        //         handleCloseModal();
        //         setTimeout(() => {
        //             router.push({ pathname: `/mentees/notes` as any, params: { id: selectedMentee?.id } });
        //         }, 300);
        //     },
        // },
        {
            icon: 'book-outline',
            label: 'View Progress Report',
            onPress: () => router.push({ pathname: `/mentees/${selectedMentee?.id}/progress` as any, params: { id: selectedMentee?.id } }),
        },
        {
            icon: 'stats-chart-outline',
            label: 'Micro Grant',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/micro-grant'), 300);
            },
        },
        {
            icon: 'calendar-outline',
            label: 'Product and Services',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/product-and-services'), 300);
            },
        },
    ];

    // Menu items for mentors
    const mentorMenuItems = [
        {
            icon: 'people-outline',
            label: 'List of Mentees',
            onPress: () => {
                router.push({ pathname: '/mentors/mentor-mentees' as any, params: { id: selectedMentor?.id } })
            },
        },
        {
            icon: 'person-add-outline',
            label: 'Assign New Mentee',
            onPress: () => {
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
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push(Routes.roadmaps.mentorPastorsFor(selectedMentor.id));
                }
            },
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
            onPress: () => {
                handleCloseModal();
                setTimeout(() => router.push('/(director)/(tabs)/assignments'), 300);
            },
        },
        {
            icon: 'stats-chart-outline',
            label: 'Progress of Mentees',
            onPress: () => {
                if (!selectedMentor?.id) return;
                router.push(`/(director)/(tabs)/progress-tracker/mentors/${selectedMentor.id}` as any);
            },
        },
        {
            icon: 'calendar-outline',
            label: 'Schedule a Meeting',
            onPress: () => router.push('/(director)/(tabs)/appointments'),
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
            onPress: () =>
                router.push({
                    pathname: '/mentors/mentor-mentees' as any,
                    params: { id: selectedMentor?.id },
                }),
        },
        {
            icon: 'person-add-outline',
            label: 'Assign New Mentee',
            onPress: () =>
                router.push({
                    pathname: '/mentors/assign-mentees' as any,
                    params: { id: selectedMentor?.id },
                }),
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove a Mentee',
            onPress: () =>
                router.push({
                    pathname: '/mentors/remove-mentee' as any,
                    params: { id: selectedMentor?.id },
                }),
        },
        {
            icon: 'calendar-outline',
            label: 'Schedule a Meeting',
            onPress: () => router.push('/(director)/(tabs)/appointments'),
        },
        {
            icon: 'create-outline',
            label: 'Edit Profile',
            onPress: () =>
                router.push({
                    pathname: `/(director)/(tabs)/mentors/${selectedMentor?.id}` as any,
                    params: { id: selectedMentor?.id },
                }),
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove as Field Mentor',
            onPress: () => featureNotAvailableYet('Removing a field mentor'),
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
                // if (roadmap.type === 'phase' && roadmap.haveNextedRoadMaps) {
                //     setTimeout(() => {
                //         router.push({
                //             pathname: `/(director)/(tabs)/roadmaps/phase-list`,
                //             params: { roadmapId: roadmap._id },
                //         });
                //     }, 300);
                // } else {
                //     // ✅ For single roadmaps: Open roadmap form in edit mode
                //     setTimeout(() => {
                //         router.push({
                //             pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                //             params: {
                //                 isEditMode: 'true',
                //                 roadmapId: roadmap._id,
                //                 type: 'single',
                //                 name: roadmap.name || '',
                //                 subheading: roadmap.roadMapDetails || roadmap.description || '',
                //                 completionTime: roadmap.duration || '',
                //                 bannerImage: roadmap.imageUrl || '',
                //             },
                //         });
                //     }, 300);
                // }


                if (roadmap.type === 'phase' && roadmap.haveNextedRoadMaps) {
                    setTimeout(() => {
                        router.push({
                            // pathname: `/(director)/(tabs)/roadmaps/phase-list`,
                            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-edit',
                            params: {
                                isEditMode: 'true',
                                roadmapId: roadmap._id,
                                type: 'phase',
                                name: roadmap.name || '',
                                subheading: roadmap.roadMapDetails || roadmap.description || '',
                                completionTime: roadmap.duration || '',
                                bannerImage: roadmap.imageUrl || roadmap.roadmaps[0]?.imageUrl || '',
                            },
                        });
                    }, 300);
                } else {
                    // ✅ For single roadmaps: Open roadmap form in edit mode
                    setTimeout(() => {
                        router.push({
                            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-edit',
                            params: {
                                isEditMode: 'true',
                                roadmapId: roadmap._id,
                                type: 'single',
                                name: roadmap.name || '',
                                subheading: roadmap.roadMapDetails || roadmap.description || '',
                                completionTime: roadmap.duration || '',
                                bannerImage: roadmap.imageUrl || roadmap.roadmaps[0]?.imageUrl || '',
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
                console.log("roadmap",roadmap);
                deleteRoadmapMutation.mutate(roadmap._id, {});
                // handleCloseModal();

                // Alert.alert(
                //     'Delete Roadmap',
                //     `Are you sure you want to delete "${roadmap.name}"? This action cannot be undone.`,
                //     [
                //         { text: 'Cancel', style: 'cancel' },
                //         {
                //             text: 'Delete',
                //             style: 'destructive',
                //             onPress: () => {
                //                 // TODO: Implement delete mutation
                //                 deleteRoadmapMutation.mutate(roadmap._id, {
                //                     onSuccess: () => {
                //                         console.log('✅ Roadmap deleted successfully');
                //                         refetchRoadmaps();
                //                     },
                //                     onError: (error) => {
                //                         console.error('❌ Error deleting roadmap:', error);
                //                         Alert.alert(
                //                             'Error',
                //                             'Failed to delete roadmap. Please try again later.'
                //                         );
                //                     },
                //                 });
                //             }
                //         },
                //     ]
                // );
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
            void data;
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
        return selectedFilter || `Roadmap Completion Rate : ${selectedFilter}`;
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

    const mentorProfiles: ProfileItem[] = useMemo(() => {
        return filteredMentors.map(m => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName ?? ''}`.trim(),
            image: m.profilePicture,
        }));
    }, [filteredMentors]);

    const pastorProfiles: ProfileItem[] = useMemo(() => {
        let rows = pastorsOverview;
        if (search) {
            const q = search.toLowerCase();
            rows = rows.filter(p => {
                const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim().toLowerCase();
                const email = (p.email ?? '').toLowerCase();
                return name.includes(q) || email.includes(q);
            });
        }
        return rows.map((p, idx) => {
            const id = String(p.userId ?? p.id ?? p._id ?? idx);
            const name =
                `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() ||
                p.email ||
                'Pastor';
            return { id, name, image: p.profilePicture };
        });
    }, [pastorsOverview, search]);

    const swiperProfiles = useMemo((): ProfileItem[] => {
        switch (activeTab) {
            case 'mentors':
                return mentorProfiles;
            case 'mentees':
                return pastorProfiles;
            default:
                return [];
        }
    }, [activeTab, mentorProfiles, pastorProfiles]);

    const tabData = [
        { key: 'roadmap-library', label: 'Roadmap Library' },
        { key: 'mentors', label: "Mentor's" },
        { key: 'mentees', label: 'Mentees' },
    ];

    // ✅ List Header Component 
    const renderListHeader = () => (
        <View>
            {swiperProfiles.length > 0 ? (
                <View style={styles.swiperContainer}>
                    <ProfileSwiper
                        profiles={swiperProfiles}
                        onProfilePress={profile => {
                            if (activeTab === 'mentees') {
                                router.push(Routes.roadmaps.pathsForMentee(profile.id));
                            } else {
                                router.push(`/mentors/${profile.id}`);
                            }
                        }}
                    />
                </View>
            ) : null}

            {/* Tabs */}
            <TabSwitcher
                variant="frosted"
                tabs={tabData}
                activeTab={activeTab}
                onChange={key =>
                    handleTabChange(key as 'roadmap-library' | 'mentors' | 'mentees')
                }
            />

            {/* Sort By */}
            {((activeTab === 'mentors') || (activeTab === 'mentees')) && (
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
            )}
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
                        paramsData={params?.tab}
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
                        showMenu={false}
                        mentor={{
                            id: mentor.id,
                            name: `${mentor.firstName} ${mentor.lastName ?? ''}`,
                            role: mentor.role === 'field_mentor' ? 'Field Mentor' : 'Mentor',
                            menteesCount: mentor.assignedId?.length ?? 0,
                            description: mentor.profileInfo ?? '',
                            profilePicture: mentor.profilePicture,
                        }}
                        layout={viewMode}
                        onCall={() => dialPhone(mentor.phoneNumber)}
                        onChat={() => chatNotAvailableYet()}
                        onMail={() => sendEmail(mentor.email)}
                        onWhatsApp={() => openWhatsApp(mentor.phoneNumber)}
                        onMenu={() => handleMentorMenuPress(mentor)}
                    />
                </TouchableOpacity>
            );
        } else if (activeTab === 'mentees') {
            const mentee = item as Mentee;
            return (
                <View style={styles.cardWrapper}>
                    <MenteeProgressCard
                        data={mentee}
                        layout={viewMode}
                        showMenu={true}
                        onPress={() =>
                            router.push({
                                pathname: `/(director)/(tabs)/roadmaps/roadmap-paths` as any,
                                params: { id: mentee.id },
                            })
                        }
                        onCall={() => dialPhone(mentee.phoneNumber)}
                        onChat={() => chatNotAvailableYet()}
                        onMail={() => sendEmail(mentee.email)}
                        onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                        onMenuPress={() => handleMenuPress(mentee)}
                        onIssueCertificate={() => featureNotAvailableYet('Issuing a certificate')}
                        onInviteAsFieldMentor={() =>
                            router.push('/(director)/(tabs)/invite-field-mentor')
                        }
                        paramsData={params?.tab}
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
        <GradientBackground>
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
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
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
    sortByText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
    },
    filterButtonText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
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
