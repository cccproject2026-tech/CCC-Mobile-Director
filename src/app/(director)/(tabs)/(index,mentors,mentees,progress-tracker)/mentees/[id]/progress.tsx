import { ChartData, ProgressBarChart } from "@/components/Charts/progress-bar-chart";
import { ProgressPieChart } from "@/components/Charts/progress-pie-chart";
import TopBar from "@/components/Header/TopBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import { Colors } from "@/constants/Colors";
import { useAssignedAssessments } from "@/hooks/useAssessments";
import { useMentees } from "@/hooks/useMentees";
import { useAssessmentProgress, useProgress, useRoadmapProgress } from "@/hooks/useProgress";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GradientBackground } from "@/components/ui/design-system";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getRoadmapCard } from "@/utils/roadmapMapper";
import RoadmapCard from "@/components/Cards/RoadmapCard";
import AssessmentCard from "@/components/Cards/AssessmentCard";
import { useAssignedRoadmaps } from "@/hooks/roadmap/useRoadmaps";
import { Mentee } from "@/types/user.types";

type TabKey = "All" | "Completed" | "Remaining";

export default function MenteeProgressScreen() {
    const { id: menteeIdParam } = useLocalSearchParams();
    const menteeId = Array.isArray(menteeIdParam) ? menteeIdParam[0] : menteeIdParam;

    const [roadmapTabs, setRoadmapTabs] = useState<TabKey>("All");
    const [assessmentTabs, setAssessmentTabs] = useState<TabKey>("All");
    const pmpSheetRef = useRef<BottomSheetModal>(null);
    const { bottom } = useSafeAreaInsets();

    // mentee info for header
    const { data: menteesData } = useMentees();
    const mentee = menteesData?.pages.flatMap(page => page.mentees).find((m: Mentee) => m.id === menteeId) ?? null;

    // progress hooks (userId‑aware)
    const {
        data: progressData,
        isLoading: isProgressLoading,
        error: progressError,
    } = useProgress(menteeId);

    const {
        data: roadmaps,
        isLoading: isRoadmapsLoading,
        refetch: refetchRoadmaps,
        isRefetching: isRoadmapsRefetching,
    } = useAssignedRoadmaps(menteeId);

    const {
        data: assessments,
        isLoading: isAssessmentsLoading,
        refetch: refetchAssessments,
    } = useAssignedAssessments(menteeId);


    const hasProgress =
        !!progressData &&
        (progressData.overallProgress > 0 ||
            (roadmaps && roadmaps.length > 0) ||
            (assessments && assessments.length > 0));

    const { data: roadmapProgress } = useRoadmapProgress(menteeId);
    const { data: assessmentProgress } = useAssessmentProgress(menteeId);

    const overallProgress = useMemo(() => {
        if (!progressData)
            return { completedPercentage: 0, remainingPercentage: 100 };

        return {
            completedPercentage: progressData.overallProgress,
            remainingPercentage: 100 - progressData.overallProgress,
        };
    }, [progressData]);

    const closePMPSheet = useCallback(() => pmpSheetRef.current?.dismiss(), []);
    const openPMPSheet = useCallback(() => pmpSheetRef.current?.present(), []);
    const handleNext = () => {
        closePMPSheet();
        router.push("/(director)/(tabs)/progress-report");
    };
    const handleDownload = () => {
        closePMPSheet();
        router.push("/(director)/(tabs)/progress-report");
    };

    // TabSwitcher config
    const roadmapTabItems = [
        { key: "All", label: "All" },
        { key: "Completed", label: "Completed" },
        { key: "Remaining", label: "Remaining" },
    ];
    const assessmentTabItems = [
        { key: "All", label: "All" },
        { key: "Completed", label: "Completed" },
        { key: "Remaining", label: "Remaining" },
    ];

    const filteredRoadmaps = useMemo(() => {
        if (!roadmaps) return [];
        switch (roadmapTabs) {
            case "Completed":
                return roadmaps.filter(r => r.status === "completed");
            case "Remaining":
                return roadmaps.filter(r => r.status !== "completed");
            default:
                return roadmaps;
        }
    }, [roadmaps, roadmapTabs]);

    const filteredAssessments = useMemo(() => {
        if (!assessments) return [];
        switch (assessmentTabs) {
            case "Completed":
                return assessments.filter(a => a.status === "Completed");
            case "Remaining":
                return assessments.filter(a => a.status !== "Completed");
            default:
                return assessments;
        }
    }, [assessments, assessmentTabs]);

    const chartData: ChartData = useMemo(() => {
        if (!roadmapProgress || !assessmentProgress)
            return {
                roadmapsTotal: 0,
                roadmapsCompleted: 0,
                roadmapsRemaining: 0,
                assessmentsTotal: 0,
                assessmentsCompleted: 0,
                assessmentsRemaining: 0,
            };

        return {
            roadmapsTotal: roadmapProgress.total,
            roadmapsCompleted: roadmapProgress.completed,
            roadmapsRemaining: roadmapProgress.total - roadmapProgress.completed,
            assessmentsTotal: assessmentProgress.total,
            assessmentsCompleted: assessmentProgress.completed,
            assessmentsRemaining:
                assessmentProgress.total - assessmentProgress.completed,
        };
    }, [roadmapProgress, assessmentProgress]);

    const handleRefresh = useCallback(() => {
        refetchRoadmaps();
        refetchAssessments();
    }, [refetchRoadmaps, refetchAssessments]);

    const handleRoadmapPress = useCallback(
        (
            roadmapId: string,
            hasNested: boolean,
            nestedCount: number,
            firstNestedId?: string,
        ) => {
            if (!hasNested || nestedCount === 0) return;

            if (nestedCount === 1 && firstNestedId)
                router.push(`/roadmaps`);
            else router.push(`/roadmaps`);
            //     router.push(`/roadmap/${roadmapId}/${firstNestedId}`);
            // else router.push(`/roadmap/${roadmapId}`);
        },
        [],
    );

    const isLoading =
        isProgressLoading || isRoadmapsLoading || isAssessmentsLoading;

    if (isLoading) {
        return (
            <GradientBackground>
                <TopBar showUserName />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: "#fff", marginTop: 16 }}>Loading progress...</Text>
                </View>
            </GradientBackground>
        );
    }

    if (progressError) {
        return (
            <GradientBackground>
                <TopBar role="pastor" showUserName />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, textAlign: "center", marginTop: 12 }}>
                        Failed to load progress data
                    </Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </GradientBackground>
        );
    }

    const menteeName = mentee
        ? `${mentee.firstName} ${mentee.lastName ?? ""}`
        : "Mentee";
    const currentTitle = "Individual - Roadmaps, Assessments";

    return (
        <GradientBackground>
            <View style={styles.scrollContainer}>
                {/* Top Bar */}
                <TopBar role="pastor" showUserName />

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={24} color="#fff" />

                            <View>
                                <Text style={styles.myProgressText}>Progress Tracker</Text>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 13,
                                        opacity: 0.8,
                                        marginTop: 2,
                                    }}
                                >
                                    Mentee &gt; {menteeName}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {hasProgress ? (

                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: bottom * 1.3,
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRoadmapsRefetching}
                                onRefresh={handleRefresh}
                                tintColor="#fff"
                                colors={["#fff"]}
                                progressBackgroundColor={"#264387"}
                            />
                        }
                    >
                        {/* Pie Chart */}
                        <ProgressPieChart
                            data={overallProgress}
                            title="Overall Progress - Roadmaps & Assessments"
                        />

                        {/* Bar Chart */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{currentTitle}</Text>
                            <View style={styles.chartWrapper}>
                                <ProgressBarChart data={chartData} showRemaining={true} />
                            </View>
                        </View>

                        {/* Roadmaps */}
                        <View style={styles.progressBlock}>
                            <Text style={styles.progressBlockTitle}>
                                Revitalization Roadmap Progress
                            </Text>

                            {/* Tabs via TabSwitcher */}
                            <TabSwitcher
                                tabs={roadmapTabItems}
                                activeTab={roadmapTabs}
                                onChange={key => setRoadmapTabs(key as TabKey)}
                            />

                            {/* Roadmap Cards */}
                            <View style={styles.cardListContainer}>
                                {filteredRoadmaps.length > 0 ? (
                                    filteredRoadmaps.map((roadmap, index) => {
                                        const cardData = getRoadmapCard(roadmap);
                                        return (
                                            <View
                                                key={roadmap._id}
                                                style={[
                                                    styles.cardWrapper,
                                                    { paddingTop: index === 0 ? 15 : 0 },
                                                ]}
                                            >
                                                <Pressable
                                                    onPress={() =>
                                                        handleRoadmapPress(
                                                            roadmap._id,
                                                            roadmap.haveNextedRoadMaps,
                                                            roadmap.roadmaps.length,
                                                            roadmap.roadmaps[0]?._id,
                                                        )
                                                    }
                                                >
                                                    <RoadmapCard
                                                        data={{ ...cardData, phaseNumber: undefined }}
                                                    />
                                                </Pressable>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            {roadmapTabs === "Completed"
                                                ? "No completed roadmaps yet"
                                                : "No roadmaps available"}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Assessments */}
                        <View style={styles.progressBlock}>
                            <Text style={styles.progressBlockTitle}>Assessment Progress</Text>

                            {/* Tabs via TabSwitcher */}
                            <TabSwitcher
                                tabs={assessmentTabItems}
                                activeTab={assessmentTabs}
                                onChange={key => setAssessmentTabs(key as TabKey)}
                            />

                            {/* Assessment Cards */}
                            <View style={styles.cardListContainer}>
                                {filteredAssessments.length > 0 ? (
                                    filteredAssessments.map((a, i) => (
                                        <View
                                            key={`assessment-${i}`}
                                            style={[
                                                styles.cardWrapper,
                                                { paddingTop: i === 0 ? 15 : 0 },
                                            ]}
                                        >
                                            <AssessmentCard
                                                onDevelopmentPlanPress={openPMPSheet}
                                                data={a as any}
                                            />
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            {assessmentTabs === "Completed"
                                                ? "No completed assessments yet"
                                                : "No assessments available"}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                ) : (
                    <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, }}>
                        <Text style={styles.emptyText}>
                            This mentee has no progress yet. Progress charts will appear once
                            roadmaps or assessments are assigned.
                        </Text>
                    </View>
                )}

                {/* Body */}

                {/* Bottom Sheet */}
                {/* <PMPBottomSheet
                    ref={pmpSheetRef}
                    onClose={closePMPSheet}
                    onNext={handleNext}
                    onDownload={handleDownload}
                /> */}
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flex: 1 },
    headerContainer: { width: "100%", alignItems: "center", paddingVertical: 10 },
    headerContent: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.12)",
    },
    myProgressText: { color: "#fff", fontWeight: "800", fontSize: 18, letterSpacing: -0.2 },
    backButton: { flexDirection: "row", alignItems: "center", gap: 10 },
    backIcon: { width: 18, height: 18, transform: [{ scaleX: -1 }] },
    section: { marginHorizontal: 16, marginBottom: 20 },
    sectionTitle: {
        color: "white",
        fontSize: 17,
        fontWeight: "500",
        marginBottom: 10,
    },
    chartWrapper: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        borderRadius: 16,
        paddingVertical: 20,
        paddingLeft: 16,
        paddingRight: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    progressBlock: { marginTop: 20, gap: 20 },
    progressBlockTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        paddingHorizontal: 16,
    },
    cardListContainer: {
        marginVertical: 10,
        paddingHorizontal: 16,
        width: "100%",
    },
    cardWrapper: { width: "100%", marginBottom: 12 },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 15,
        textAlign: "center",
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 11,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
});
