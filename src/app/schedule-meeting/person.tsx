import AppGradientBackground from "@/components/layout/AppGradientBackground";
import TopBar from "@/components/Header/TopBar";
import { TabSwitcher } from "@/components/Header/TabSwitcher";
import { ScreenBackHeader } from "@/components/ui/design-system";
import { useAuthStore } from "@/stores/auth.store";
import { useScheduleMeetingStore, type SchedulePerson } from "@/stores/scheduleMeeting.store";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import {
  buildScheduleFlowParams,
  getScheduleMeetingBase,
  leaveScheduleMeetingPersonStep,
} from "@/lib/scheduling/scheduleMeetingNavigation";
import { getReturnToParam } from "@/utils/navigation";
import { useMentees } from "@/hooks/useMentees";
import {
  useScheduleMentorsList,
  useSchedulePastors,
} from "@/hooks/scheduling/useScheduleMeetingUsers";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DirectorPersonTab = "pastor" | "mentor";

export default function ScheduleMeetingPersonScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { mode, appointmentId, personData } = useLocalSearchParams<{
    mode?: "schedule" | "reschedule";
    appointmentId?: string;
    personData?: string;
  }>();
  const params = useLocalSearchParams<{
    drawerContext?: string;
    preserveDraft?: string;
    assessmentId?: string;
    returnTo?: string;
  }>();
  const scheduleBase = getScheduleMeetingBase(params.drawerContext, user?.role);
  const flowParams = useMemo(
    () =>
      buildScheduleFlowParams({
        drawerContext: params.drawerContext,
        assessmentId: params.assessmentId,
        returnTo: getReturnToParam(params),
      }),
    [params.assessmentId, params.drawerContext, params.returnTo],
  );

  const {
    setMode,
    setAppointmentId,
    setPerson,
    reset,
  } = useScheduleMeetingStore();

  const [search, setSearch] = useState("");
  const [directorTab, setDirectorTab] = useState<DirectorPersonTab>("pastor");

  // Drawer screens are frozen between visits — reset when starting a new flow (not when backing from time).
  useFocusEffect(
    useCallback(() => {
      const keepDraft = String(params.preserveDraft ?? "") === "1";
      if (!keepDraft) {
        reset();
      }
      setMode((mode as any) || "schedule");
      setAppointmentId(appointmentId);
      if (personData) {
        try {
          const parsed = JSON.parse(String(personData));
          if (parsed?.id) {
            setPerson({
              id: String(parsed.id),
              name: String(parsed.name || parsed.firstName || "Person"),
              role: String(parsed.role || ""),
              profilePicture: parsed.profilePicture,
              profileImage: parsed.profileImage,
            });
            router.replace({
              pathname: `${scheduleBase}/time` as any,
              params: flowParams,
            });
          }
        } catch {
          // ignore
        }
      }
    }, [
      appointmentId,
      flowParams,
      mode,
      params.drawerContext,
      params.preserveDraft,
      personData,
      reset,
      scheduleBase,
      setAppointmentId,
      setMode,
      setPerson,
    ]),
  );

  const roleLower = String(user?.role || "").toLowerCase();
  const isMentor = roleLower === "mentor";
  const isDirector = roleLower === "director";

  const { mentors: assignedMentors, isLoading: isLoadingMentors } = useAssignedMentors(
    !isMentor && !isDirector ? (user?.id ?? null) : null,
  );

  const { data: pastors = [], isLoading: isLoadingPastors } = useSchedulePastors(isDirector);
  const { data: mentors = [], isLoading: isLoadingAllMentors } = useScheduleMentorsList(isDirector);

  const { data: menteesData, isLoading: isLoadingMentees } = useMentees();

  const people: SchedulePerson[] = useMemo(() => {
    if (isMentor) {
      const mentees = menteesData?.pages?.flatMap((p: any) => p.mentees) ?? [];
      return mentees.map((m: any) => ({
        id: String(m.id),
        name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Pastor",
        role: String(m.role || "pastor"),
        profilePicture: m.profilePicture,
      }));
    }
    if (isDirector) {
      const source = directorTab === "pastor" ? pastors : mentors;
      return source.map((m: any) => ({
        id: String(m.id),
        name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || (directorTab === "pastor" ? "Pastor" : "Mentor"),
        role: String(m.role || (directorTab === "pastor" ? "pastor" : "mentor")),
        profilePicture: m.profilePicture,
      }));
    }
    return (assignedMentors ?? []).map((m: any) => ({
      id: String(m.id),
      name: String(m.name || "Mentor"),
      role: String(m.role || "mentor"),
      profilePicture: m.profilePicture,
    }));
  }, [assignedMentors, directorTab, isDirector, isMentor, menteesData, mentors, pastors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      return (
        String(p.name).toLowerCase().includes(q) ||
        String(p.role || "").toLowerCase().includes(q)
      );
    });
  }, [people, search]);

  const loading = isMentor
    ? isLoadingMentees
    : isDirector
      ? directorTab === "pastor"
        ? isLoadingPastors
        : isLoadingAllMentors
      : isLoadingMentors;

  const handleBack = useCallback(() => {
    leaveScheduleMeetingPersonStep(router, user?.role, getReturnToParam(params));
  }, [params, router, user?.role]);

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar
        role={String(user?.role || "pastor")}
        showUserName
        showDrawer={false}
      />
      <ScreenBackHeader title="Schedule" onPressBack={handleBack} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Pick person</Text>
        <Text style={styles.subtitle}>Select who you want to meet with.</Text>

        {isDirector ? (
          <TabSwitcher
            tabs={[
              { key: "pastor", label: "Pastor" },
              { key: "mentor", label: "Mentor" },
            ]}
            activeTab={directorTab}
            onChange={(key) => setDirectorTab(key as DirectorPersonTab)}
            variant="frosted"
          />
        ) : null}

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.75)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name"
            placeholderTextColor="rgba(255,255,255,0.55)"
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.subtle}>Loading…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.subtle}>No people found.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 12) + 24 }}
          >
            {filtered.map((p) => (
              <Pressable
                key={p.id}
                style={styles.personCard}
                onPress={() => {
                  setPerson(p);
                  router.replace({
                    pathname: `${scheduleBase}/time` as any,
                    params: flowParams,
                  });
                }}
              >
                <View style={styles.avatarWrap}>
                  {p.profilePicture ? (
                    <Image source={{ uri: p.profilePicture }} style={styles.avatar} />
                  ) : (
                    <Ionicons name="person" size={18} color="#FFFFFF" />
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.personName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.personRole} numberOfLines={1}>{p.role}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  subtitle: { marginVertical: 6,marginBottom: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  subtle: { color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  center: { paddingTop: 24, alignItems: "center", gap: 10 },
  searchRow: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  searchInput: { flex: 1, color: "#FFFFFF", fontWeight: "700" },
  personCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  personName: { color: "#FFFFFF", fontWeight: "900", fontSize: 15 },
  personRole: { marginTop: 3, color: "rgba(255,255,255,0.65)", fontWeight: "700", fontSize: 12 },
});
