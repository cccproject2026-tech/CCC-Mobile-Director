import { ProgressBarChart, ChartData } from "@/components/Charts/progress-bar-chart";
import { ProgressPieChart } from "@/components/Charts/progress-pie-chart";
import AssessmentCard from "@/components/Cards/AssessmentCard";
import RoadmapCard from "@/components/Cards/RoadmapCard";
import TopBar from "@/components/Header/TopBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import FinalCommentsSection from "@/components/progress/FinalCommentsSection";
import { GradientBackground, roadmapTheme } from "@/components/ui/design-system";
import { useAssignedAssessments } from "@/hooks/useAssessments";
import { Routes } from "@/navigation/routes";
import { useCompletionWorkflow } from "@/hooks/useCompletionWorkflow";
import { useAssignedRoadmaps } from "@/hooks/roadmap/useRoadmaps";
import {
  useAssessmentProgress,
  useFinalComments,
  useProgress,
  useRoadmapProgress,
} from "@/hooks/useProgress";
import { useUserProfile } from "@/hooks/useProfile";
import { getRoadmapCard } from "@/utils/roadmapMapper";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "All" | "Completed" | "Remaining";

function StatusChip({ label, tone }: { label: string; tone: "done" | "progress" | "pending" }) {
  const colors = {
    done: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", text: "#6ee7b7" },
    progress: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#fcd34d" },
    pending: { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)", text: "#cbd5e1" },
  }[tone];
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.chipText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export default function TrackProgressDetailScreen() {
  const { userId: userIdParam } = useLocalSearchParams<{ userId: string }>();
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam ?? "";
  const { bottom } = useSafeAreaInsets();

  const [roadmapTab, setRoadmapTab] = useState<TabKey>("All");
  const [assessmentTab, setAssessmentTab] = useState<TabKey>("All");

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(userId);
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
    isRefetching,
  } = useProgress(userId);
  const { data: finalComments = [] } = useFinalComments(userId);
  const { data: roadmaps, isLoading: roadmapsLoading, refetch: refetchRoadmaps } =
    useAssignedRoadmaps(userId);
  const { data: assessments, isLoading: assessmentsLoading, refetch: refetchAssessments } =
    useAssignedAssessments(userId);
  const { data: roadmapProgress } = useRoadmapProgress(userId);
  const { data: assessmentProgress } = useAssessmentProgress(userId);

  const workflow = useCompletionWorkflow(userId, profile ?? undefined);

  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "User";

  const overallPct = progressData?.overallProgress ?? 0;
  const canInviteFieldMentor =
    !!profile?.hasCompleted &&
    !profile?.fieldMentorInvitation &&
    !profile?.isFieldMentor;
  const canIssueCertificate =
    !!profile?.hasCompleted && !profile?.hasIssuedCertificate;
  const canMarkFromComments =
    overallPct >= 99 &&
    !profile?.hasCompleted &&
    finalComments.length > 0;

  const handleRefresh = useCallback(() => {
    refetchProfile();
    refetchProgress();
    refetchRoadmaps();
    refetchAssessments();
  }, [refetchProfile, refetchProgress, refetchRoadmaps, refetchAssessments]);

  const chartData: ChartData = useMemo(
    () => ({
      roadmapsTotal: roadmapProgress?.total ?? 0,
      roadmapsCompleted: roadmapProgress?.completed ?? 0,
      roadmapsRemaining: (roadmapProgress?.total ?? 0) - (roadmapProgress?.completed ?? 0),
      assessmentsTotal: assessmentProgress?.total ?? 0,
      assessmentsCompleted: assessmentProgress?.completed ?? 0,
      assessmentsRemaining:
        (assessmentProgress?.total ?? 0) - (assessmentProgress?.completed ?? 0),
    }),
    [roadmapProgress, assessmentProgress]
  );

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return [];
    if (roadmapTab === "Completed") return roadmaps.filter((r) => r.status === "completed");
    if (roadmapTab === "Remaining") return roadmaps.filter((r) => r.status !== "completed");
    return roadmaps;
  }, [roadmaps, roadmapTab]);

  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];
    if (assessmentTab === "Completed")
      return assessments.filter(
        (a) =>
          a.progressStatus === "completed" ||
          a.progressStatus === "submitted",
      );
    if (assessmentTab === "Remaining")
      return assessments.filter(
        (a) =>
          a.progressStatus !== "completed" &&
          a.progressStatus !== "submitted",
      );
    return assessments;
  }, [assessments, assessmentTab]);

  const tabItems = [
    { key: "All", label: "All" },
    { key: "Completed", label: "Completed" },
    { key: "Remaining", label: "Remaining" },
  ];

  const isLoading =
    profileLoading || progressLoading || roadmapsLoading || assessmentsLoading;

  if (!userId) {
    return (
      <GradientBackground>
        <TopBar showUserName />
        <View style={styles.center}>
          <Text style={styles.errorText}>Invalid user</Text>
        </View>
      </GradientBackground>
    );
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <TopBar showUserName />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (progressError) {
    return (
      <GradientBackground>
        <TopBar showUserName />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.4)" />
          <Text style={styles.errorText}>Failed to load progress</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <TopBar showUserName />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Track Progress</Text>
            <Text style={styles.headerSub}>{fullName}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 24, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#fff" />
        }
      >
        <View style={styles.profileCard}>
          {profile?.profilePicture ? (
            <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color={roadmapTheme.accentMint} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileRole}>{profile?.role ?? "Pastor"}</Text>
            <View style={styles.chipRow}>
              {profile?.hasCompleted ? (
                <StatusChip label="Course completed" tone="done" />
              ) : overallPct >= 100 ? (
                <StatusChip label="Ready to complete" tone="progress" />
              ) : (
                <StatusChip label="In progress" tone="pending" />
              )}
              {profile?.hasIssuedCertificate && (
                <StatusChip label="Certificate issued" tone="done" />
              )}
              {profile?.fieldMentorInvitation && (
                <StatusChip label="FM invited" tone="progress" />
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {canIssueCertificate && (
            <TouchableOpacity
              style={styles.actionBtn}
              disabled={workflow.isBusy}
              onPress={workflow.runIssueCertificate}
            >
              <Ionicons name="ribbon-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Issue Certificate</Text>
            </TouchableOpacity>
          )}
          {canInviteFieldMentor && (
            <TouchableOpacity
              style={styles.actionBtn}
              disabled={workflow.isBusy}
              onPress={() => workflow.runInviteFieldMentor(profile?.email)}
            >
              <Ionicons name="school-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Invite Field Mentor</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => router.push("/(director)/(tabs)/progress-tracker/report" as any)}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Progress Report</Text>
          </TouchableOpacity>
        </View>

        <ProgressPieChart
          data={{
            completedPercentage: overallPct,
            remainingPercentage: 100 - overallPct,
          }}
          title="Overall Progress"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roadmaps & Assessments</Text>
          <ProgressBarChart data={chartData} showRemaining />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roadmaps</Text>
          <TabSwitcher
            tabs={tabItems}
            activeTab={roadmapTab}
            onChange={(k) => setRoadmapTab(k as TabKey)}
            variant="frosted"
          />
          {filteredRoadmaps.length === 0 ? (
            <Text style={styles.empty}>No roadmaps in this filter</Text>
          ) : (
            filteredRoadmaps.map((roadmap) => (
              <View key={roadmap._id} style={styles.cardGap}>
                <RoadmapCard
                  data={getRoadmapCard(roadmap)}
                  onPress={() =>
                    router.push(Routes.roadmaps.phaseListFor(roadmap._id, userId, true))
                  }
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessments</Text>
          <TabSwitcher
            tabs={tabItems}
            activeTab={assessmentTab}
            onChange={(k) => setAssessmentTab(k as TabKey)}
            variant="frosted"
          />
          {filteredAssessments.length === 0 ? (
            <Text style={styles.empty}>No assessments in this filter</Text>
          ) : (
            filteredAssessments.map((a, idx) => (
              <View key={a._id ?? `${a.name}-${idx}`} style={styles.cardGap}>
                <AssessmentCard
                  data={a}
                  onPress={() => {
                    const submitted =
                      a.progressStatus === "submitted" ||
                      a.progressStatus === "completed";
                    if (submitted) {
                      router.push(Routes.assessments.resultFor(a._id, userId));
                    } else {
                      router.push(Routes.assessments.detail(a._id));
                    }
                  }}
                />
              </View>
            ))
          )}
        </View>

        <FinalCommentsSection
          userId={userId}
          canMarkComplete={canMarkFromComments}
          isMarkingComplete={workflow.isMarkingComplete}
          onMarkProgramComplete={workflow.runMarkComplete}
        />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { color: "#fff", marginTop: 12 },
  errorText: { color: "rgba(255,255,255,0.8)", marginTop: 12, textAlign: "center" },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  retryText: { color: "#fff", fontWeight: "700" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 2 },
  profileCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(111,212,190,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { color: roadmapTheme.textPrimary, fontSize: 17, fontWeight: "800" },
  profileRole: { color: roadmapTheme.textMuted, fontSize: 13, marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: "700" },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(124,58,237,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  section: { marginTop: 18, gap: 10 },
  sectionTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  cardGap: { marginTop: 8 },
  empty: { color: roadmapTheme.textMuted, fontSize: 13, marginTop: 8 },
});
