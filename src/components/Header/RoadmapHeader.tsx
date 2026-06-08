import { Ionicons } from "@expo/vector-icons";
import { useSafeBack } from "@/hooks/useSafeBack";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomMenu, { MenuItem } from "../Menu/CustomMenu";


type Props = {
    handleOpenCreateRoadmapModal: () => void;
    activeTab: 'roadmap-library' | 'mentors' | 'mentees';
};

const RoadmapHeader = ({ handleOpenCreateRoadmapModal, activeTab }: Props) => {
    const safeBack = useSafeBack();
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string>("");

    const getOutcomeMenuItems = (): MenuItem[] => [
        {
            id: "outcome-4-months",
            label: "Expected Outcome - 4 Months",
            onPress: () => {
                setSelectedOutcome("Expected Outcome - First Four Months");
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: "outcome-6-months",
            label: "Expected Outcome - 6 Months",
            onPress: () => {
                setSelectedOutcome("Expected Outcome - Six Months");
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: "outcome-9-months",
            label: "Expected Outcome - 9 Months",
            onPress: () => {
                setSelectedOutcome("Expected Outcome - Nine Months");
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: "outcome-end-year",
            label: "Expected Outcome - End of Year",
            onPress: () => {
                setSelectedOutcome("Expected Outcome - End of Year");
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
    ];
    const getOutcomeData = (title: string) => {
        // This is the data from your screenshot - you can customize for different periods
        const fourMonthsData = [
            {
                id: "1",
                text: "The church is committed to the revitalization process.",
            },
            {
                id: "2",
                text: "The Church is praying consistently and intentionally for revitalization.",
            },
            {
                id: "3",
                text: "The church understands its current health and is committed to making improvements.",
            },
            {
                id: "4",
                text: "The church is beginning to feel like a warm and welcoming place for new attendees.",
            },
            {
                id: "5",
                text: "Church members have begun to build new relationships with people who have attended a community engagement event and its follow-up event.",
            },
            {
                id: "6",
                text: "Church members will begin to feel a sense of hope for the future and begin expecting God to do something exciting in their church.",
            },
        ];

        // For now, return the same data for all periods
        // You can customize this based on the title parameter
        return fourMonthsData;
    };
    return (
        <View style={styles.navigationBar}>
            {/* Left Section - Back Button + Title with Subtitle */}
            <View style={styles.navigationLeft}>
                <TouchableOpacity style={styles.backButton} onPress={safeBack}>
                    <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.pageTitle}>R.Roadmap</Text>
                    <Text style={styles.pageSubtitle}>Library</Text>
                </View>
            </View>

            {/* Right Section - Pill Buttons + Menu */}
            <View style={styles.navigationRight}>
                {/* Select Button - Only show for roadmap library tab */}
                {activeTab === "roadmap-library" && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                            router.push(
                                "/(director)/(tabs)/roadmaps/select-roadmap"
                            )
                        }
                    >
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Select</Text>
                    </TouchableOpacity>
                )}

                {/* Roadmap Button */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleOpenCreateRoadmapModal}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Roadmap</Text>
                </TouchableOpacity>

                {/* Three Dots Menu */}
                {/* <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowOutcomeMenu(!showOutcomeMenu)}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
                </TouchableOpacity> */}
            </View>

            {/* Outcome Context Menu */}
            <CustomMenu
                visible={showOutcomeMenu}
                items={getOutcomeMenuItems()}
                onClose={() => setShowOutcomeMenu(false)}
                position={{ top: 60, right: 16 }}
                minWidth={280}
                showIcons={false}
                itemTextStyle={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#1A4882",
                }}
            />

            {/* <ExpectedOutcomeModal
                visible={showOutcomeModal}
                onClose={() => setShowOutcomeModal(false)}
                title={selectedOutcome}
                outcomes={getOutcomeData(selectedOutcome)}
                onSelect={() => {
                    console.log("Select outcome");
                    setShowOutcomeModal(false);
                }}
                onEdit={() => {
                    console.log("Edit outcome");
                    setShowOutcomeModal(false);
                }}
                onDownload={() => {
                    console.log("Download outcome");
                }}
            /> */}
        </View>
    );
};

export default RoadmapHeader;

const styles = StyleSheet.create({
    navigationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    navigationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        flexShrink: 1,
    },
    backButton: {
        padding: 4,
    },
    pageTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    pageSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    navigationRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        gap: 4,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    iconButton: {
        padding: 4,
    },
});
