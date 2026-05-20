import TopBar from "@/components/Header/TopBar";
import SearchBar from "@/components/Header/SearchBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import { GradientBackground, roadmapTheme } from "@/components/ui/design-system";
import {
  filterCourseCompletedByTab,
  useCompletionWorkflow,
  useCourseCompletedUsers,
} from "@/hooks/useCompletionWorkflow";
import { CourseCompletedStatus } from "@/types/progress.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = CourseCompletedStatus;

export default function CourseCompletedScreen() {
  const { bottom } = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("completed");

  const { data: users = [], isLoading, refetch, isRefetching } =
    useCourseCompletedUsers(search);

  const filtered = useMemo(
    () => filterCourseCompletedByTab(users, activeTab),
    [users, activeTab]
  );

  const counts = useMemo(
    () => ({
      completed: users.filter((u) => u.status === "completed").length,
      certificate_issued: users.filter((u) => u.status === "certificate_issued").length,
      invited: users.filter((u) => u.status === "invited").length,
    }),
    [users]
  );

  const tabs = [
    { key: "completed", label: `Completed (${counts.completed})` },
    { key: "certificate_issued", label: `Cert issued (${counts.certificate_issued})` },
    { key: "invited", label: `Invited (${counts.invited})` },
  ];

  return (
    <GradientBackground>
      <TopBar showUserName showNotifications />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Course Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeValue={setSearch} placeholder="Search pastors..." />
      </View>

      <TabSwitcher
        variant="frosted"
        tabs={tabs}
        activeTab={activeTab}
        onChange={(k) => setActiveTab(k as TabKey)}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom + 20 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.35)" />
              <Text style={styles.empty}>No users in this category</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CourseCompletedRow item={item} activeTab={activeTab} />
          )}
        />
      )}
    </GradientBackground>
  );
}

function CourseCompletedRow({
  item,
  activeTab,
}: {
  item: ReturnType<typeof filterCourseCompletedByTab>[number];
  activeTab: TabKey;
}) {
  const workflow = useCompletionWorkflow(item.id, {
    id: item.id,
    email: item.email,
    hasCompleted: item.hasCompleted,
    hasIssuedCertificate: item.hasIssuedCertificate,
    fieldMentorInvitation: item.status === "invited" ? { invitedAt: item.invitationDate } : null,
  } as any);

  const openDetail = () =>
    router.push(`/(director)/(tabs)/progress-tracker/${item.id}` as any);

  return (
    <Pressable style={styles.card} onPress={openDetail}>
      {item.profilePicture ? (
        <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPh}>
          <Ionicons name="person-outline" size={22} color={roadmapTheme.accentMint} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.createdAt && (
          <Text style={styles.meta}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
        {activeTab === "invited" && item.invitationDate && (
          <Text style={styles.meta}>Invited: {item.invitationDate}</Text>
        )}
      </View>

      {activeTab === "completed" && (
        <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
          <TouchableOpacity
            style={styles.btn}
            onPress={(e) => {
              e.stopPropagation?.();
              workflow.runIssueCertificate();
            }}
            disabled={workflow.isBusy}
          >
            <Text style={styles.btnText}>Issue Cert</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {activeTab === "certificate_issued" && (
        <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
          <TouchableOpacity
            style={styles.btn}
            onPress={(e) => {
              e.stopPropagation?.();
              workflow.runInviteFieldMentor(item.email);
            }}
            disabled={workflow.isBusy}
          >
            <Text style={styles.btnText}>Invite FM</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 48 },
  empty: { color: roadmapTheme.textMuted, marginTop: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPh: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(111,212,190,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: roadmapTheme.textPrimary, fontWeight: "800", fontSize: 15 },
  meta: { color: roadmapTheme.textMuted, fontSize: 12, marginTop: 2 },
  btnWrap: { borderRadius: 10, overflow: "hidden" },
  btn: { paddingHorizontal: 12, paddingVertical: 8 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
});
