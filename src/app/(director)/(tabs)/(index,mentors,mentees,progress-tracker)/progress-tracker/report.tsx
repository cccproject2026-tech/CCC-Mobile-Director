import TopBar from "@/components/Header/TopBar";
import { CommonCard, GradientBackground, roadmapTheme } from "@/components/ui/design-system";
import { useCompletedPastorsCount } from "@/hooks/useCompletionWorkflow";
import { useDirectorOverview, useOverallProgressList } from "@/hooks/useProgress";
import { readUserOverallRow } from "@/utils/progressOverviewMerge";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProgressReportScreen() {
  const { bottom } = useSafeAreaInsets();
  const { data: overview, isLoading: overviewLoading } = useDirectorOverview();
  const { data: allRows = [], isLoading: rowsLoading } = useOverallProgressList(["pastor"]);
  const { data: completedCount } = useCompletedPastorsCount();

  const stats = useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    for (const row of allRows) {
      const { overallProgress, overallCompleted } = readUserOverallRow(row);
      if (overallCompleted || overallProgress >= 100) completed += 1;
      else inProgress += 1;
    }
    return { inProgress, completed, total: allRows.length };
  }, [allRows]);

  const isLoading = overviewLoading || rowsLoading;

  const handleExport = () => {
    Alert.alert(
      "Export",
      "PDF/CSV export is not available in the mobile app yet. View summary below."
    );
  };

  return (
    <GradientBackground>
      <TopBar showUserName showNotifications />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Progress Report</Text>
        </TouchableOpacity>
        <Pressable onPress={handleExport} style={styles.exportBtn}>
          <Ionicons name="download-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24, gap: 14 }}>
          <CommonCard>
            <Text style={styles.cardTitle}>Director overview</Text>
            <View style={styles.statGrid}>
              <StatBox label="Total pastors" value={overview?.totalPastors ?? 0} />
              <StatBox label="Completed pastors" value={overview?.completedPastors ?? 0} />
              <StatBox label="Total mentors" value={overview?.totalMentors ?? 0} />
              <StatBox label="Combined progress" value={`${overview?.overallCombinedProgress ?? 0}%`} />
            </View>
          </CommonCard>

          <CommonCard>
            <Text style={styles.cardTitle}>Pastor track progress</Text>
            <View style={styles.statGrid}>
              <StatBox label="Listed pastors" value={stats.total} />
              <StatBox label="In progress" value={stats.inProgress} />
              <StatBox label="At 100%" value={stats.completed} />
              <StatBox label="Course completed" value={completedCount ?? 0} />
            </View>
          </CommonCard>

          <CommonCard>
            <Text style={styles.cardTitle}>Monthly completions</Text>
            {!overview?.monthlyData?.length ? (
              <Text style={styles.empty}>No monthly data yet</Text>
            ) : (
              overview.monthlyData.slice(-6).map((m) => (
                <View key={`${m.year}-${m.month}`} style={styles.monthRow}>
                  <Text style={styles.monthLabel}>{m.monthName}</Text>
                  <Text style={styles.monthValue}>
                    P: {m.pastorsCompleted} · M: {m.mentorsCompleted}
                  </Text>
                </View>
              ))
            )}
          </CommonCard>

          <Text style={styles.note}>
            Export to PDF/CSV will be added in a later release. This screen mirrors web progress
            summary stats.
          </Text>
        </ScrollView>
      )}
    </GradientBackground>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  exportBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "47%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  statValue: { color: roadmapTheme.textPrimary, fontSize: 20, fontWeight: "800" },
  statLabel: { color: roadmapTheme.textMuted, fontSize: 11, marginTop: 4 },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  monthLabel: { color: roadmapTheme.textPrimary, fontWeight: "600" },
  monthValue: { color: roadmapTheme.textMuted, fontSize: 13 },
  empty: { color: roadmapTheme.textMuted, fontSize: 13 },
  note: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
