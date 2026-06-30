import MenteeProgressCard from '@/components/Cards/MenteeCard/MenteeProgressCard';
import MentorCard from '@/components/Cards/MentorCard';
import RoadmapCard from '@/components/Cards/RoadmapCard';
import RoadmapHeader from '@/components/Header/RoadmapHeader';
import SearchBar from '@/components/Header/SearchBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import TopBar from '@/components/Header/TopBar';
import FilterModal, { FilterOption } from '@/components/Modals/FilterModal';
import ProfileSwiper, { ProfileItem } from '@/components/ProfileSection/ProfileSwiper';
import ActionBottomSheet, { ActionItem } from '@/components/Sheets/ActionBottomSheet';
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
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    InteractionManager,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoadmapCardData } from '@/types/roadmap.types';
import {
    dialPhone,
    openSMS,
    openWhatsApp,
    sendEmail,
} from '@/utils/contactActions';
import { appendReturnTo, buildReturnTo } from '@/utils/navigation';

// const STATES = ['North American', 'Canada', 'Mexico', 'Brazil'];

export default function RevitalizationRoadmap() {
    const router = useRouter();
    const pathname = usePathname();

    const [search, setSearch] = useState('');
    // const [activeTab, setActiveTab] = useState<'roadmap-library' | 'mentors' | 'mentees'>('roadmap-library');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapCardData | null>(null);
    const [roadmapSelectionMode, setRoadmapSelectionMode] = useState(false);
    const [selectedRoadmapIds, setSelectedRoadmapIds] = useState<Set<string>>(new Set());

    const params = useLocalSearchParams();
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
        }
    }, [params?.tab]);

    const roadmapsMenteesReturnTo = useMemo(
        () => buildReturnTo(pathname, { tab: 'mentees' }),
        [pathname],
    );
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
                label: 'Sort By',
                options: ['Name A-Z', 'Name Z-A'],
                isExpandable: true,
            },
            // {
            //     label: 'Roadmap Completion Rate',
            //     options: ['Lowest', 'Highest'],
            //     isExpandable: true,
            // },
            // {
            //     label: 'State',
            //     options: STATES,
            //     isExpandable: true,
            // },
            // {
            //     label: 'Conference',
            //     isExpandable: true,
            // },
        ];
    };

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const createRoadmapModalRef = useRef<BottomSheetModal>(null);
    const [createSheetKey, setCreateSheetKey] = useState(0);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setSelectedMentee(null);
        setSelectedMentor(null);
        setSelectedRoadmap(null);
    }, []);

    const buildRoadmapMenuItems = useCallback(
        (roadmapCard: RoadmapCardData): ActionItem[] => {
            const roadmap = roadmaps.find((r) => r._id === roadmapCard._id);
            const roadmapId = roadmap?._id ?? roadmapCard._id;
            const afterClose = (action: () => void) => {
                handleCloseModal();
                setTimeout(action, 200);
            };

            return [
                {
                    icon: 'person-add-outline',
                    label: 'Assign to',
                    onPress: () => {
                        if (!roadmapId) return;
                        afterClose(() =>
                            router.push({
                                pathname: '/(director)/(tabs)/roadmaps/assign-roadmaps',
                                params: { roadmapIds: JSON.stringify([roadmapId]) },
                            }),
                        );
                    },
                },
                {
                    icon: 'create-outline',
                    label: 'Edit Roadmap',
                    onPress: () => {
                        if (!roadmapId) return;
                        afterClose(() => {
                            router.push({
                                pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-edit',
                                params: {
                                    isEditMode: 'true',
                                    roadmapId,
                                },
                            });
                        });
                    },
                },
                {
                    icon: 'trash-outline',
                    label: 'Delete Roadmap',
                    onPress: () => {
                        if (!roadmapId) return;
                        const roadmapName = roadmapCard.title || 'this roadmap';
                        handleCloseModal();
                        Alert.alert(
                            'Delete Roadmap',
                            `Are you sure you want to delete "${roadmapName}"?`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await deleteRoadmapMutation.mutateAsync(roadmapId);
                                            Alert.alert('Success', 'Roadmap deleted successfully.');
                                        } catch {
                                            Alert.alert('Error', 'Failed to delete roadmap. Please try again.');
                                        }
                                    },
                                },
                            ],
                        );
                    },
                },
            ];
        },
        [deleteRoadmapMutation, handleCloseModal, roadmaps, router],
    );

    /** Roadmaps mentors/mentees tab — only Schedule a Meeting (full menus live on sidebar screens). */
    const buildMentorMenuItems = useCallback(
        (_mentor: Mentor): ActionItem[] => {
            const afterClose = (action: () => void) => {
                handleCloseModal();
                setTimeout(action, 200);
            };

            return [
                {
                    icon: 'calendar-outline',
                    label: 'Schedule a Meeting',
                    onPress: () =>
                        afterClose(() => router.push('/(director)/(tabs)/appointments')),
                },
            ];
        },
        [handleCloseModal, router],
    );

    const buildMenteeMenuItems = useCallback(
        (_mentee: Mentee): ActionItem[] => {
            const afterClose = (action: () => void) => {
                handleCloseModal();
                setTimeout(action, 200);
            };

            return [
                {
                    icon: 'calendar-outline',
                    label: 'Schedule a Meeting',
                    onPress: () =>
                        afterClose(() => router.push('/(director)/(tabs)/appointments')),
                },
            ];
        },
        [handleCloseModal, router],
    );

    const sheetActions = useMemo((): ActionItem[] => {
        if (selectedRoadmap) return buildRoadmapMenuItems(selectedRoadmap);
        if (selectedMentor) return buildMentorMenuItems(selectedMentor);
        if (selectedMentee) return buildMenteeMenuItems(selectedMentee);
        return [];
    }, [
        buildMenteeMenuItems,
        buildMentorMenuItems,
        buildRoadmapMenuItems,
        selectedMentee,
        selectedMentor,
        selectedRoadmap,
    ]);

    const sheetMenuKey = selectedRoadmap?._id ?? selectedMentor?.id ?? selectedMentee?.id ?? null;

    useEffect(() => {
        if (!sheetMenuKey) return;
        const task = InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                bottomSheetModalRef.current?.present();
            });
        });
        return () => task.cancel();
    }, [sheetMenuKey]);

    const handleMenuPress = useCallback((mentee: Mentee) => {
        setSelectedMentee(mentee);
        setSelectedMentor(null);
        setSelectedRoadmap(null);
    }, []);

    const handleMentorMenuPress = useCallback((mentor: Mentor) => {
        setSelectedMentor(mentor);
        setSelectedMentee(null);
        setSelectedRoadmap(null);
    }, []);

    const handleRoadmapMenuPress = useCallback((roadmap: RoadmapCardData) => {
        setSelectedRoadmap(roadmap);
        setSelectedMentee(null);
        setSelectedMentor(null);
    }, []);

    const handleOpenCreateRoadmapModal = useCallback(() => {
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                createRoadmapModalRef.current?.present();
            });
        });
    }, []);

    const handleCloseCreateRoadmapModal = useCallback(() => {
        createRoadmapModalRef.current?.dismiss();
    }, []);

    const handleCreateSheetDismissed = useCallback(() => {
        setCreateSheetKey((key) => key + 1);
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
        setRoadmapSelectionMode(false);
        setSelectedRoadmapIds(new Set());
        router.setParams({ tab });
    };

    const handleToggleRoadmapSelectionMode = useCallback(() => {
        setRoadmapSelectionMode((prev) => {
            if (prev) {
                setSelectedRoadmapIds(new Set());
            }
            return !prev;
        });
    }, []);

    const handleToggleRoadmapSelect = useCallback((roadmapId: string) => {
        if (!roadmapId) return;
        setSelectedRoadmapIds((prev) => {
            const next = new Set(prev);
            if (next.has(roadmapId)) {
                next.delete(roadmapId);
            } else {
                next.add(roadmapId);
            }
            return next;
        });
    }, []);

    const handleAssignSelectedRoadmaps = useCallback(() => {
        if (selectedRoadmapIds.size === 0) {
            Alert.alert('No Selection', 'Please select at least one roadmap.');
            return;
        }
        router.push({
            pathname: '/(director)/(tabs)/roadmaps/assign-roadmaps',
            params: { roadmapIds: JSON.stringify(Array.from(selectedRoadmapIds)) },
        });
    }, [router, selectedRoadmapIds]);

    const handleDeleteSelectedRoadmaps = useCallback(() => {
        if (selectedRoadmapIds.size === 0) {
            Alert.alert('No Selection', 'Please select at least one roadmap.');
            return;
        }
        const count = selectedRoadmapIds.size;
        Alert.alert(
            'Delete Roadmaps',
            `Are you sure you want to delete ${count} roadmap${count > 1 ? 's' : ''}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await Promise.all(
                                Array.from(selectedRoadmapIds).map((id) =>
                                    deleteRoadmapMutation.mutateAsync(id),
                                ),
                            );
                            setSelectedRoadmapIds(new Set());
                            setRoadmapSelectionMode(false);
                            Alert.alert('Success', 'Roadmap(s) deleted successfully.');
                        } catch {
                            Alert.alert('Error', 'Failed to delete roadmap(s). Please try again.');
                        }
                    },
                },
            ],
        );
    }, [deleteRoadmapMutation, selectedRoadmapIds]);

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
                    params: appendReturnTo(
                        {
                            isEditMode: 'true',
                            roadmapId: roadmap._id,
                            type: 'single',
                            name: roadmap.name || '',
                            subheading: roadmap.roadMapDetails || roadmap.description || '',
                            completionTime: roadmap.duration || '',
                            bannerImage: roadmap.imageUrl || '',
                        },
                        buildReturnTo(pathname, params),
                    ),
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
        [params, pathname, roadmaps, router]
    );

    const getFilterDisplayText = () => {
        if (selectedFilter === 'All') {
            return 'Default';
        }
        return selectedFilter;
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

        if (selectedFilter === 'Name Z-A') {
            filtered = [...filtered].sort((a, b) => {
                const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
                const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
                return nameB.localeCompare(nameA);
            });
        } else if (selectedFilter === 'Name A-Z') {
            filtered = [...filtered].sort((a, b) => {
                const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
                const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
                return nameA.localeCompare(nameB);
            });
        }

        return filtered;
    }, [mentors, search, selectedFilter]);

    const filteredMentees: Mentee[] = useMemo(() => {
        const allMentees = menteesData?.pages.flatMap(page => page.mentees) ?? [];
        let filtered = allMentees;

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(m =>
                `${m.firstName} ${m.lastName ?? ''}`.toLowerCase().includes(q)
            );
        }

        if (selectedFilter === 'Name Z-A') {
            filtered = [...filtered].sort((a, b) => {
                const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
                const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
                return nameB.localeCompare(nameA);
            });
        } else if (selectedFilter === 'Name A-Z') {
            filtered = [...filtered].sort((a, b) => {
                const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
                const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
                return nameA.localeCompare(nameB);
            });
        }

        return filtered;
    }, [menteesData, search, selectedFilter]);

    useEffect(() => {
        if (activeTab !== 'mentees') return;
        console.log('[Roadmaps / Mentees tab] raw API pages:', menteesData?.pages);
        console.log('[Roadmaps / Mentees tab] filtered list:', filteredMentees);
    }, [activeTab, filteredMentees, menteesData?.pages]);

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

    const handleSelectAllRoadmaps = useCallback(() => {
        const allIds = filteredRoadmaps
            .map((r) => r._id)
            .filter((id): id is string => Boolean(id));
        setSelectedRoadmapIds((prev) => {
            if (prev.size === allIds.length && allIds.length > 0) {
                return new Set();
            }
            return new Set(allIds);
        });
    }, [filteredRoadmaps]);

    const allRoadmapsSelected =
        filteredRoadmaps.length > 0 &&
        selectedRoadmapIds.size === filteredRoadmaps.length;

    useEffect(() => {
        if (activeTab !== 'roadmap-library') return;
        console.log(
            '[Roadmaps / Roadmap Library tab] data source: useAllRoadmaps() → roadmapService.getAllRoadmaps() → GET /roadmaps',
        );
        console.log('[Roadmaps / Roadmap Library tab] raw API data (roadmaps):', roadmaps);
        console.log(
            '[Roadmaps / Roadmap Library tab] transformed via getRoadmapCard (roadmapLibrary):',
            roadmapLibrary,
        );
        console.log('[Roadmaps / Roadmap Library tab] filtered list (FlatList):', filteredRoadmaps);
        console.log('[Roadmaps / Roadmap Library tab] loading:', isLoadingRoadmaps, 'error:', roadmapsError);
    }, [
        activeTab,
        roadmaps,
        roadmapLibrary,
        filteredRoadmaps,
        isLoadingRoadmaps,
        roadmapsError,
    ]);

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
                                router.push({
                                    pathname: '/(director)/(tabs)/roadmaps/roadmap-paths',
                                    params: appendReturnTo(
                                        { id: profile.id },
                                        roadmapsMenteesReturnTo,
                                    ),
                                } as never);
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

            {activeTab === 'roadmap-library' && roadmapSelectionMode ? (
                <View style={styles.selectAllContainer}>
                    <Text style={styles.selectionCountText}>
                        {selectedRoadmapIds.size} selected
                    </Text>
                    <TouchableOpacity onPress={handleSelectAllRoadmaps}>
                        <Text style={styles.selectAllText}>
                            {allRoadmapsSelected ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}
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
            const roadmapId = roadmap._id ?? '';
            return (
                <View style={styles.cardWrapper}>
                    <RoadmapCard
                        data={roadmap}
                        showMenu={!roadmapSelectionMode}
                        onMenuPress={() => handleRoadmapMenuPress(roadmap)}
                        onPress={() => handlePhasePress(roadmap)}
                        selectionMode={roadmapSelectionMode}
                        isSelected={roadmapId ? selectedRoadmapIds.has(roadmapId) : false}
                        onToggleSelection={() => handleToggleRoadmapSelect(roadmapId)}
                        paramsData={params?.tab}
                    />
                </View>
            );
        } else if (activeTab === 'mentors') {
            const mentor = item as Mentor;
            return (
                <View style={styles.cardWrapper}>
                    <MentorCard
                        onPress={() => {
                            router.push({
                                pathname: `/(director)/(tabs)/mentors/${mentor.id}` as any,
                                params: { email: mentor.email },
                            });
                        }}
                        showMenu
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
                        onChat={() => openSMS(mentor.phoneNumber)}
                        onMail={() => sendEmail(mentor.email)}
                        onWhatsApp={() => openWhatsApp(mentor.phoneNumber)}
                        onMenu={() => handleMentorMenuPress(mentor)}
                    />
                </View>
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
                                pathname: '/(director)/(tabs)/roadmaps/roadmap-paths',
                                params: appendReturnTo(
                                    { id: mentee.id },
                                    roadmapsMenteesReturnTo,
                                ),
                            } as never)
                        }
                        onCall={() => dialPhone(mentee.phoneNumber)}
                        onChat={() => openSMS(mentee.phoneNumber)}
                        onMail={() => sendEmail(mentee.email)}
                        onWhatsApp={() => openWhatsApp(mentee.phoneNumber)}
                        onMenuPress={() => handleMenuPress(mentee)}
                        paramsData={activeTab === 'mentees' ? 'mentees' : params?.tab}
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
                <TopBar showUserName={true} showNotifications={true} />
                <RoadmapHeader
                    handleOpenCreateRoadmapModal={handleOpenCreateRoadmapModal}
                    activeTab={activeTab}
                    selectionMode={roadmapSelectionMode}
                    onToggleSelectionMode={handleToggleRoadmapSelectionMode}
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
                        contentContainerStyle={[
                            styles.listContent,
                            roadmapSelectionMode && activeTab === 'roadmap-library'
                                ? { paddingBottom: bottom + 88 }
                                : null,
                        ]}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {(selectedRoadmap || selectedMentor || selectedMentee) ? (
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
                        actions={sheetActions}
                        onClose={handleCloseModal}
                    />
                ) : null}

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
                    key={createSheetKey}
                    ref={createRoadmapModalRef}
                    onClose={handleCloseCreateRoadmapModal}
                    onCancel={handleCreateRoadmapCancel}
                    onDismissed={handleCreateSheetDismissed}
                    mode="create"
                />

                {roadmapSelectionMode && activeTab === 'roadmap-library' ? (
                    <View style={[styles.selectionActionBar, { paddingBottom: bottom + 12 }]}>
                        <TouchableOpacity
                            style={[
                                styles.selectionActionButton,
                                styles.assignButton,
                                selectedRoadmapIds.size === 0 && styles.selectionActionButtonDisabled,
                            ]}
                            onPress={handleAssignSelectedRoadmaps}
                            disabled={selectedRoadmapIds.size === 0}
                        >
                            <Ionicons name="person-add-outline" size={18} color="#0E5A62" />
                            <Text style={styles.assignButtonText}>Assign Selected</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.selectionActionButton,
                                styles.deleteButton,
                                selectedRoadmapIds.size === 0 && styles.selectionActionButtonDisabled,
                            ]}
                            onPress={handleDeleteSelectedRoadmaps}
                            disabled={selectedRoadmapIds.size === 0}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                            <Text style={styles.deleteButtonText}>Delete Selected</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
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
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    selectionCountText: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        fontWeight: '500',
    },
    selectAllText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    selectionActionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 14,
        backgroundColor: 'rgba(15,59,92,0.97)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.12)',
    },
    selectionActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    assignButton: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderColor: 'rgba(255,255,255,0.18)',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 107, 107, 0.12)',
        borderColor: 'rgba(255, 107, 107, 0.35)',
    },
    selectionActionButtonDisabled: {
        opacity: 0.4,
    },
    assignButtonText: {
        color: '#0E5A62',
        fontSize: 14,
        fontWeight: '700',
    },
    deleteButtonText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '700',
    },
});
