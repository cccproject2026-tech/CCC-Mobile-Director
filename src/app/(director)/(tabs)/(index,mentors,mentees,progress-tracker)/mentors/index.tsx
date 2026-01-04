import MentorCard from "@/components/Cards/MentorCard";
import { UserCardSkeleton } from "@/components/Cards/MentorCard/UserCardSkeleton";
import SearchBar from "@/components/Header/SearchBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import TopBar from "@/components/Header/TopBar";
import FilterModal, { FilterOption } from "@/components/Modals/FilterModal";
import ActionBottomSheet from "@/components/Sheets/ActionBottomSheet";
import { useMentors } from "@/hooks/useMentors";
import { Mentor } from "@/types/user.types";

import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
} from "react-native";

export default function Mentors() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] =
        useState<"all" | "mentor" | "field_mentor">("all");
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("");
    const [viewMode, setViewMode] = useState<"card" | "list">("list");
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { mentors, isLoading, refetch } = useMentors();

    const menuItemsMentor = [
        {
            icon: "people-outline",
            label: "List of Mentees",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/(director)/(tabs)/mentors/mentor-mentees",
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
                        pathname: "/(director)/(tabs)/mentors/assign-mentees",
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
                        pathname: "/(director)/(tabs)/mentors/remove-mentee",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },
        {
            icon: "clipboard-outline",
            label: "Roadmaps of Mentees",
            onPress: () => console.log("Roadmaps of Mentees"),
        },
        {
            icon: "checkmark-done-outline",
            label: "Assessments of Mentees",
            onPress: () => router.push("/(director)/(tabs)/assessments"),
        },
        {
            icon: "book-outline",
            label: "Assignments of Mentees",
            onPress: () => console.log("Assignments of Mentees"),
        },
        {
            icon: "stats-chart-outline",
            label: "Progress of Mentees",
            onPress: () => {
                if (selectedMentor?.id) {
                    // Close the bottom sheet before navigating
                    bottomSheetRef.current?.dismiss();

                    // Navigate and pass the mentorId param
                    router.push(`/(director)/(tabs)/progress-tracker/mentors/${selectedMentor.id}`);
                }
            },
        },
        {
            icon: "calendar-outline",
            label: "Schedule a Meeting",
            onPress: () => console.log("Schedule a Meeting"),
        },
        {
            icon: "create-outline",
            label: "Edit Profile",
            onPress: () => console.log("Edit Profile"),
        },
    ];

    const menuItemsFieldMentor = [
        {
            icon: "people-outline",
            label: "List of Mentees",
            onPress: () =>
                router.push("/(director)/(tabs)/mentors/mentor-mentees"),
        },
        {
            icon: "person-add-outline",
            label: "Assign New Mentee",
            onPress: () => {
                if (selectedMentor?.id) {
                    router.push({
                        pathname: "/(director)/(tabs)/mentors/assign-mentees",
                        params: { id: selectedMentor.id },
                    });
                }
            },
        },
        {
            icon: "person-remove-outline",
            label: "Remove a Mentee",
            onPress: () =>
                router.push("/(director)/(tabs)/mentors/remove-mentee"),
        },
        {
            icon: "calendar-outline",
            label: "Schedule a Meeting",
            onPress: () => console.log("Schedule a Meeting"),
        },
        {
            icon: "create-outline",
            label: "Edit Profile",
            onPress: () => console.log("Edit Profile"),
        },
        {
            icon: "person-remove-outline",
            label: "Remove as Field Mentor",
            onPress: () => console.log("Remove as Field Mentor"),
        },
    ];

    const filterOptions: FilterOption[] = [
        { label: "Least number of Mentees" },
    ];

    /* ------------------- APPLY SEARCH & FILTERS ------------------- */
    const filteredMentors = useMemo(() => {
        let list = mentors;

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(m =>
                `${m.firstName} ${m.lastName ?? ""}`.toLowerCase().includes(q),
            );
        }
        if (activeTab === "mentor") list = list.filter(m => m.role === "mentor");
        if (activeTab === "field_mentor")
            list = list.filter(m => m.role === "field_mentor");

        return list;
    }, [mentors, search, activeTab, selectedFilter]);

    /* ------------------- OPEN ACTION SHEET ------------------- */
    const openMenu = useCallback((mentor: Mentor) => {
        setSelectedMentor(mentor);
        setTimeout(() => bottomSheetRef.current?.present(), 10);
    }, []);


    const renderItem = ({ item }: { item: Mentor }) => (
        <MentorCard
            onPress={() =>
                router.push(`/(director)/(tabs)/mentors/${item.id}`)
            }
            mentor={{
                id: item.id,
                name: `${item.firstName} ${item.lastName ?? ""}`,
                role: item.role === "field_mentor" ? "Field Mentor" : "Mentor",
                menteesCount: item.assignedId?.length ?? 0,
                description: item.profileInfo ?? "No profile info",
                profilePicture: item.profilePicture,
            }}
            layout={viewMode}
            onCall={() => console.log("CALL", item.phoneNumber)}
            onWhatsApp={() => console.log("WHATSAPP", item.phoneNumber)}
            onMail={() => console.log("MAIL", item.email)}
            onChat={() => console.log("CHAT")}
            onMenu={() => openMenu(item)}
        />
    );

    return (
        <LinearGradient
            colors={["#176192", "#1D548D", "#264387"]}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1 }}>
                <TopBar notifications={3} showUserName showNotifications />

                <View style={{ flex: 1, paddingTop: 24 }}>
                    {/* HEADER */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                            <Text style={styles.headerTitle}>Mentors</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                setViewMode(viewMode === "card" ? "list" : "card")
                            }
                        >
                            <Ionicons
                                name={viewMode === "card" ? "list" : "grid"}
                                size={24}
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
                            <Ionicons name="chevron-down" size={14} color="#fff" />
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
                            selectedMentor.role === "mentor"
                                ? menuItemsMentor
                                : menuItemsFieldMentor
                        }
                        onClose={() => bottomSheetRef.current?.dismiss()}
                    />
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.3)",
    },

    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },

    headerTitle: {
        marginLeft: 8,
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },

    viewToggle: {
        padding: 8,
    },

    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },

    swiperContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.3)",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
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
        fontSize: 16,
        color: "#fff",
    },

    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderRadius: 25,
    },

    filterText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },

    flatList: {
        flex: 1,
    },

    flatListContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
