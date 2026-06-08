import MentorCard from "@/components/Cards/MentorCard";
import { UserCardSkeleton } from "@/components/Cards/MentorCard/UserCardSkeleton";
import SearchBar from "@/components/Header/SearchBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import TopBar from "@/components/Header/TopBar";
import FilterModal, { FilterOption } from "@/components/Modals/FilterModal";
import ActionBottomSheet from "@/components/Sheets/ActionBottomSheet";
import { GradientBackground, ScreenBackHeader } from "@/components/ui/design-system";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { useMentors } from "@/hooks/useMentors";
import { Mentor } from "@/types/user.types";
import { useLocalSearchParams } from 'expo-router';

import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
    Linking
} from "react-native";
import {
    dialPhone,
    featureNotAvailableYet,
    openWhatsApp,
    sendEmail,
    openSMS
} from "@/utils/contactActions";

export default function Mentors() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] =
        useState<"all" | "mentor" | "field_mentor">("all");
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("");
    const [viewMode, setViewMode] = useState<"card" | "list">("list");
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const params = useLocalSearchParams();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const {
        data: mentorsData,
        isLoading,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMentors(10);
console.log("mentorsData",mentorsData);


    const mentorList = useMemo(() => {
        return mentorsData?.pages.flatMap(page => page.mentors) || [];
    }, [mentorsData]);

    console.log("mentorList",mentorList);
    const menuItemsMentor = [
        {
            icon: "people-outline",
            label: "List of Mentees",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/mentors/mentor-mentees",
                        params: { id: selectedMentor.id },
                    });
                }
            }
        }, 
        {
            icon: "person-add-outline",
            label: "Assign New Mentee",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/mentors/assign-mentees",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },
        {
            icon: "person-remove-outline",
            label: "Remove a Mentee", 
            onPress: () => { 
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/mentors/remove-mentee",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },
        {
            icon: "clipboard-outline",
            label: "Roadmaps of Mentees",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/mentors/mentor-mentees",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },
        {
            icon: "checkmark-done-outline",
            label: "Assessments of Mentees",
            onPress: () => router.push("/(director)/(tabs)/assessments"),
        },
        {
            icon: "book-outline",
            label: "Assignments of Mentees",
            onPress: () => router.push("/(director)/(tabs)/assignments"),
        },
        {
            icon: "stats-chart-outline",
            label: "Progress of Mentees",
            onPress: () => {
                if (selectedMentor?.id) {
                    bottomSheetRef.current?.dismiss();
                    router.push(`/(director)/(tabs)/progress-tracker/mentors/${selectedMentor.id}` as any);
                }
            },
        },
        {
            icon: "calendar-outline",
            label: "Schedule a Meeting",
            onPress: () => router.push("/(director)/(tabs)/appointments"),
        },
        {
            icon: "create-outline",
            label: "Edit Profile",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push(`/(director)/(tabs)/mentors/${selectedMentor.id}` as any);
                }
            },
        },
    ];



    const fromhomeScreenmenuItems = [

        {
            icon: "person-add-outline",
            label: "Assign New Mentee",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/mentors/assign-mentees",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },

    ];


    const menuItemsFieldMentor = [
        {
            icon: "people-outline",
            label: "List of Mentees",
            onPress: () =>
                router.push({
                    pathname: "/mentors/mentor-mentees",
                    params: { id: selectedMentor?.id ?? "" },
                }),
        },
        {
            icon: "person-add-outline",
            label: "Assign New Mentee",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/mentors/assign-mentees",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },
        {
            icon: "person-remove-outline",
            label: "Remove a Mentee",
            onPress: () =>
                router.push({
                    pathname: "/mentors/remove-mentee",
                    params: { id: selectedMentor?.id ?? "" },
                }),
        },
        {
            icon: "calendar-outline",
            label: "Schedule a Meeting",
            onPress: () => router.push("/(director)/(tabs)/appointments"),
        },
        {
            icon: "create-outline",
            label: "Edit Profile",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push(`/(director)/(tabs)/mentors/${selectedMentor.id}` as any);
                }
            },
        },
        {
            icon: "person-remove-outline",
            label: "Remove as Field Mentor",
            onPress: () => featureNotAvailableYet("Removing a field mentor"),
        },
    ];

    // const filterOptions: FilterOption[] = [
    //     { label: "Least number of Mentees" },
    // ];
    const filterOptions: FilterOption[] = [
    {
        label: "Sort By",
        options: [
            "Least Mentees",
            "Most Mentees",
            "Name A-Z",
            "Name Z-A",
            "Last Contacted",
        ],
        isExpandable: true,
    },
];

    // const filteredMentors = useMemo(() => {
    //     let list = mentorList;

    //     if (search.trim()) {
    //         const q = search.toLowerCase();
    //         list = list.filter(m =>
    //             m.firstName.toLowerCase().includes(q) ||
    //             (m.lastName ?? "").toLowerCase().includes(q) ||
    //             (m.username ?? "").toLowerCase().includes(q) ||
    //             m.role?.toLowerCase().includes(q) ||
    //             (m as any).profileInfo?.toLowerCase().includes(q)
    //         );
    //     }
    //     if (activeTab === "mentor") list = list.filter(m => m.role === "mentor");
    //     if (activeTab === "field_mentor")
    //         // list = list.filter(m => m.role === "field_mentor");
    //     list = list.filter(m => m.role === "field mentor");

    //     return list;
    // }, [mentorList, search, activeTab, selectedFilter]);

    const filteredMentors = useMemo(() => {
    let list = [...mentorList];

    // Search
    if (search.trim()) {
        const q = search.toLowerCase();

        list = list.filter(
            m =>
                m.firstName?.toLowerCase().includes(q) ||
                (m.lastName ?? "").toLowerCase().includes(q) ||
                (m.username ?? "").toLowerCase().includes(q) ||
                (m.role ?? "").toLowerCase().includes(q) ||
                (m.profileInfo ?? "").toLowerCase().includes(q)
        );
    }

    // Tabs
    if (activeTab === "mentor") {
        list = list.filter(
            m => m.role?.toLowerCase() === "mentor"
        );
    }

    if (activeTab === "field_mentor") {
        list = list.filter(
            m =>
                m.role?.toLowerCase() === "field mentor" ||
                m.role?.toLowerCase() === "field_mentor"
        );
    }

    // Sorting
    switch (selectedFilter) {
        case "Least Mentees":
            list.sort(
                (a, b) =>
                    (a.assignedId?.length ?? 0) -
                    (b.assignedId?.length ?? 0)
            );
            break;

        case "Most Mentees":
            list.sort(
                (a, b) =>
                    (b.assignedId?.length ?? 0) -
                    (a.assignedId?.length ?? 0)
            );
            break;

        case "Name A-Z":
            list.sort((a, b) => {
                const nameA =
                    `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
                const nameB =
                    `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim();

                return nameA.localeCompare(nameB);
            });
            break;

        case "Name Z-A":
            list.sort((a, b) => {
                const nameA =
                    `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
                const nameB =
                    `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim();

                return nameB.localeCompare(nameA);
            });
            break;

        case "Last Contacted":
            list.sort((a, b) => {
                const dateA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
                const dateB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();

                return dateB - dateA;
            });
            break;

        default:
            break;
    }

    return list;
}, [mentorList, search, activeTab, selectedFilter]);

    const openMenu = useCallback((mentor: Mentor) => {
        setSelectedMentor(mentor);
        setTimeout(() => bottomSheetRef.current?.present(), 10);
    }, []);


    const renderItem = ({ item }: { item: Mentor }) => (
        <MentorCard
            onPress={() =>
                router.push(`/(director)/(tabs)/mentors/${item.id}` as any)
            }
            showMenu={true}
            mentor={{
                id: item.id,
                name: `${item.firstName} ${item.lastName ?? ""}`,
                role: item.role === "field_mentor" ? "Field Mentor" : "Mentor",
                menteesCount: item.assignedId?.length ?? 0,
                description: item.profileInfo ?? "No profile info",
                profilePicture: item.profilePicture,
            }}
            layout={viewMode}
            onCall={() => dialPhone(item.phoneNumber)}
            onWhatsApp={() => openWhatsApp(item.phoneNumber)}
            onMail={() => sendEmail(item.email)}
            onChat={() => openSMS(item.phoneNumber)}
            onMenu={() => openMenu(item)}
        />
    );

    return (
        <GradientBackground>
            <View style={{ flex: 1 }}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={{ flex: 1, paddingTop: 24 }}>
                    {/* HEADER */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <View style={styles.backIconWrap}>
                                <Ionicons name="chevron-back" size={20} color="#fff" />
                            </View>
                            <Text style={styles.headerTitle}>Mentors</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() =>
                                setViewMode(viewMode === "card" ? "list" : "card")
                            }
                        >
                            <Ionicons
                                name={viewMode === "card" ? "list" : "grid"}
                                size={22}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* SEARCH */}
                    <View style={styles.searchContainer}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* TABS */}
                    <TabSwitcher
                        variant="frosted"
                        tabs={[
                            { key: "all", label: "All" },
                            { key: "mentor", label: "Mentor" },
                            { key: "field_mentor", label: "Field Mentor" },
                        ]}
                        activeTab={activeTab}
                        onChange={key =>
                            setActiveTab(key as "all" | "mentor" | "field_mentor")
                        }
                    />

                    {/* FILTER */}
                    <View style={styles.filterContainer}>
                        <Text style={styles.sortByText}>Sort By</Text>
                        <Pressable
                            style={styles.filterButton}
                            onPress={() => setFilterModalVisible(true)}
                        >
                            <Text style={styles.filterText}>
                                {selectedFilter || "Select Filter"}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
                        </Pressable>
                    </View>

                    {/* MENTOR LIST / SKELETON */}
                    {isLoading ? (
                        <View style={styles.flatListContent}>
                            <UserCardSkeleton layout={viewMode} />
                            <UserCardSkeleton layout={viewMode} />
                            <UserCardSkeleton layout={viewMode} />
                            <UserCardSkeleton layout={viewMode} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredMentors}
                            renderItem={renderItem}
                            keyExtractor={m => m.id}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isLoading}
                                    onRefresh={refetch}
                                    tintColor="#fff"
                                />
                            }
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.flatListContent}
                            onEndReached={() => {
                                if (hasNextPage && !isFetchingNextPage) {
                                    fetchNextPage();
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.3)" />
                                    <Text style={styles.emptyText}>No mentors found</Text>
                                </View>
                            }
                            ListFooterComponent={() => (
                                isFetchingNextPage ? (
                                    <View style={{ paddingVertical: 20 }}>
                                        <ActivityIndicator color="#fff" />
                                    </View>
                                ) : null
                            )}
                        />
                    )}
                </View>

                {/* FILTER POPUP */}
                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedFilter={selectedFilter}
                    onFilterSelect={f => {
                        setSelectedFilter(f);
                        setFilterModalVisible(false);
                    }}
                    filterOptions={filterOptions}
                />

                {selectedMentor && (
                    <ActionBottomSheet
                        ref={bottomSheetRef}
                        title={`${selectedMentor.firstName} ${selectedMentor.lastName ?? ""}`}
                        subtitle={`${selectedMentor.assignedId?.length ?? 0} Mentees`}
                        image={selectedMentor.profilePicture}
                        actions={
                            params?.type === "home" ? fromhomeScreenmenuItems :
                                selectedMentor.role === "mentor"
                                    ? menuItemsMentor
                                    : menuItemsFieldMentor
                        }
                        onClose={() => bottomSheetRef.current?.dismiss()}
                    />

                )}
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 14,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.12)",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    backIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: -0.2,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sortByText: {
        fontSize: 13,
        color: "rgba(255,255,255,0.65)",
        fontWeight: "500",
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        borderRadius: 20,
    },
    filterText: {
        fontSize: 13,
        fontWeight: "600",
        color: "rgba(255,255,255,0.85)",
    },
    flatListContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 15,
        fontWeight: "500",
    },
});
