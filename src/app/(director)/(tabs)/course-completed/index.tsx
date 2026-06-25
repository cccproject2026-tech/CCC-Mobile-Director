import TopBar from "@/components/Header/TopBar";
import SearchBar from "@/components/Header/SearchBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import CompletionWorkflowModal from "@/components/Modals/CompletionWorkflowModal";
import { GradientBackground, homeLayout, roadmapTheme } from "@/components/ui/design-system";
import {
  filterCourseCompletedByTab,
  sortCourseCompletedUsers,
  useCompletionWorkflow,
  useCourseCompletedUsers,
} from "@/hooks/useCompletionWorkflow";
import { useSafeBack } from "@/hooks/useSafeBack";
import { CourseCompletedStatus } from "@/types/progress.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = CourseCompletedStatus;

const SORT_OPTIONS: Record<TabKey, { value: string; label: string }[]> = {
  completed: [
    { value: "latest_completed", label: "Latest Completed" },
    { value: "oldest_completed", label: "Oldest Completed" },
  ],
  certificate_issued: [
    { value: "latest_issued", label: "Latest Issued" },
    { value: "oldest_issued", label: "Oldest Issued" },
  ],
  invited: [
    { value: "waiting", label: "Waiting for Response" },
    { value: "accepted", label: "Accepted" },
  ],
};

function parseInitialTab(raw?: string | string[]): TabKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "certificate_issued" || value === "invited" || value === "completed") {
    return value;
  }
  return "completed";
}

export default function CourseCompletedScreen() {
  const safeBack = useSafeBack();
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ initialTab?: string }>();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    parseInitialTab(params.initialTab),
  );
  const [sortBy, setSortBy] = useState("latest_completed");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    setActiveTab(parseInitialTab(params.initialTab));
  }, [params.initialTab]);

  useEffect(() => {
    const options = SORT_OPTIONS[activeTab];
    setSortBy(options[0]?.value ?? "latest_completed");
  }, [activeTab]);

  const { data: users = [], isLoading, refetch, isRefetching } =
    useCourseCompletedUsers(search);

  const filtered = useMemo(() => {
    const tabbed = filterCourseCompletedByTab(users, activeTab);
    return sortCourseCompletedUsers(tabbed, sortBy);
  }, [users, activeTab, sortBy]);

  const counts = useMemo(
    () => ({
      completed: filterCourseCompletedByTab(users, "completed").length,
      certificate_issued: filterCourseCompletedByTab(users, "certificate_issued")
        .length,
      invited: filterCourseCompletedByTab(users, "invited").length,
    }),
    [users],
  );

  const tabs = [
    { key: "completed", label: `Completed (${counts.completed})` },
    { key: "certificate_issued", label: `Cert issued (${counts.certificate_issued})` },
    { key: "invited", label: `Invited (${counts.invited})` },
  ];

  const sortOptions = SORT_OPTIONS[activeTab];
  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label ?? sortOptions[0]?.label;

  const emptyMessage =
    activeTab === "completed"
      ? "No pastors have completed the course yet."
      : activeTab === "certificate_issued"
        ? "No certificates have been issued yet."
        : "No field mentor invitations have been sent yet.";

  return (
    <GradientBackground>
      <TopBar showUserName showNotifications />

      <View style={styles.header}>
        <TouchableOpacity onPress={safeBack} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.headerTitle}>
            {activeTab === "invited" ? "Invite to be a Field Mentor" : "Course Completed"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerSub}>Course completion and field mentor invitations.</Text>
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

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(true)}
        >
          <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

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
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.empty}>{emptyMessage}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CourseCompletedRow item={item} activeTab={activeTab} />
          )}
        />
      )}

      <Modal visible={showSortMenu} transparent animationType="fade">
        <Pressable style={styles.sortOverlay} onPress={() => setShowSortMenu(false)}>
          <View style={styles.sortMenu}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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
    fieldMentorInvitation:
      item.status === "invited" ? { invitedAt: item.invitationDate } : null,
  } as any);

  const openDetail = () =>
    router.push({
      pathname: "/(director)/(tabs)/progress-tracker/[userId]",
      params: { userId: item.id },
    } as any);

  const openIssueCertificate = () =>
    router.push({
      pathname: "/(director)/(tabs)/progress-tracker/[userId]",
      params: { userId: item.id, issueCertificate: "1" },
    } as any);

  const alreadyInvited = Boolean(item.fieldMentorInvitation);

  return (
    <>
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
            Completed: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
        {activeTab === "invited" && item.invitationDate && (
          <>
            <Text style={styles.meta}>Invitation sent: {item.invitationDate}</Text>
            {item.response && (
              <Text style={styles.meta}>Response: {item.response}</Text>
            )}
          </>
        )}
      </View>

      {activeTab === "completed" && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            openIssueCertificate();
          }}
          disabled={workflow.isBusy}
        >
          <Text style={styles.actionBtnText}>Issue Certificate</Text>
        </TouchableOpacity>
      )}

      {activeTab === "certificate_issued" &&
        (alreadyInvited ? (
          <View style={[styles.actionBtn, styles.actionBtnDisabled]}>
            <Text style={styles.actionBtnText}>Invitation sent</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              workflow.runInviteFieldMentor(item.email);
            }}
            disabled={workflow.isBusy}
          >
            <Text style={styles.actionBtnText}>Invite as Field Mentor</Text>
          </TouchableOpacity>
        ))}

      {activeTab === "invited" && (
        <View style={[styles.actionBtn, styles.actionBtnDisabled]}>
          <Text style={styles.actionBtnText}>Invitation sent</Text>
        </View>
      )}
    </Pressable>
    <CompletionWorkflowModal dialog={workflow.dialog} onClose={workflow.closeDialog} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: roadmapTheme.divider,
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: roadmapTheme.textPrimary, fontSize: 18, fontWeight: "800" },
  headerSub: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    marginTop: 6,
    paddingLeft: 30,
  },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  sortLabel: { color: roadmapTheme.textMuted, fontSize: 14, fontWeight: "600" },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: roadmapTheme.newfrostedBorder,
    backgroundColor: roadmapTheme.newfrostedSurfaceStrong,
  },
  sortButtonText: { color: roadmapTheme.textPrimary, fontSize: 13, fontWeight: "600" },
  sortOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  sortMenu: {
    borderRadius: homeLayout.cardRadius,
    borderWidth: 1,
    borderColor: roadmapTheme.newfrostedBorder,
    backgroundColor: roadmapTheme.newfrostedSurfaceStrong,
    overflow: "hidden",
  },
  sortOption: { paddingHorizontal: 16, paddingVertical: 14 },
  sortOptionActive: { backgroundColor: "rgba(142, 197, 235, 0.2)" },
  sortOptionText: { color: roadmapTheme.textMuted, fontSize: 15 },
  sortOptionTextActive: { color: roadmapTheme.textPrimary, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 48 },
  emptyTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  empty: {
    color: roadmapTheme.textMuted,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: homeLayout.cardRadius,
    borderWidth: 1,
    borderColor: roadmapTheme.newfrostedBorder,
    backgroundColor: roadmapTheme.newfrostedSurfaceStrong,
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
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(142, 197, 235, 0.45)",
    backgroundColor: "rgba(142, 197, 235, 0.2)",
  },
  actionBtnDisabled: { opacity: 0.55 },
  actionBtnText: { color: "#fff", fontWeight: "800", fontSize: 11 },
});
