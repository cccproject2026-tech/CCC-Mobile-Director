import SearchBar from "@/components/Header/SearchBar";
import { useAssignedAssessmentsForUser } from "@/hooks/useAssessments";
import { Routes } from "@/navigation/routes";
import { usersService } from "@/services/users.service";
import { User } from "@/types/user.types";
import { isCompletedAssessmentForCdp } from "@/utils/assignedAssessmentParser";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function getUserId(user: User): string {
  return String(user.id ?? (user as { _id?: string })._id ?? "").trim();
}

function getDisplayName(user: User): string {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email || "Unnamed pastor";
}

export default function CdpDevelopmentPlanModal({ visible, onClose }: Props) {
  const [pastorSearch, setPastorSearch] = useState("");
  const [selectedPastorId, setSelectedPastorId] = useState("");
  const [selectedPastorName, setSelectedPastorName] = useState("");

  const pastorsQuery = useQuery({
    queryKey: ["cdp", "pastors"],
    queryFn: () =>
      usersService.getAllUsers({
        role: "pastor",
        limit: 100,
        roleMatch: "mixed",
      }),
    enabled: visible,
    staleTime: 60 * 1000,
  });

  const {
    data: assignedAssessments = [],
    isLoading: assessmentsLoading,
  } = useAssignedAssessmentsForUser(selectedPastorId || undefined);

  const pastors = pastorsQuery.data?.users ?? [];

  const filteredPastors = useMemo(() => {
    const q = pastorSearch.trim().toLowerCase();
    if (!q) return pastors;
    return pastors.filter((pastor) => {
      const name = getDisplayName(pastor).toLowerCase();
      const email = String(pastor.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [pastors, pastorSearch]);

  const cdpAssessments = useMemo(() => {
    return assignedAssessments
      .filter((row) => isCompletedAssessmentForCdp(row))
      .map((row) => ({
        id: String(row._id ?? row.id ?? ""),
        title: row.name || row.title || "Untitled assessment",
      }))
      .filter((row) => row.id);
  }, [assignedAssessments]);

  const resetState = () => {
    setPastorSearch("");
    setSelectedPastorId("");
    setSelectedPastorName("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSelectPastor = (pastor: User) => {
    const id = getUserId(pastor);
    if (!id) return;
    setSelectedPastorId(id);
    setSelectedPastorName(getDisplayName(pastor));
  };

  const handleBackToPastors = () => {
    setSelectedPastorId("");
    setSelectedPastorName("");
  };

  const handleOpenCdp = (assessmentId: string) => {
    handleClose();
    router.push(Routes.assessments.cdpFor(assessmentId, selectedPastorId));
  };

  const headerTitle = selectedPastorId
    ? "Customized Development Plan"
    : "Select Pastor";
  const headerSubtitle = selectedPastorId
    ? `Showing completed assessments with CDP for ${selectedPastorName}.`
    : "Select a pastor to view completed assessments with customized development plans.";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
          <View style={styles.headerActions}>
            {selectedPastorId ? (
              <TouchableOpacity
                onPress={handleBackToPastors}
                style={styles.iconButton}
                accessibilityLabel="Back to pastors"
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={handleClose}
              style={styles.iconButton}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {!selectedPastorId ? (
          <>
            <View style={styles.searchContainer}>
              <SearchBar
                value={pastorSearch}
                onChangeValue={setPastorSearch}
                placeholder="Search pastor"
                backgroundColor="#14517D"
              />
            </View>

            {pastorsQuery.isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : pastorsQuery.isError ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>Failed to load pastors.</Text>
              </View>
            ) : filteredPastors.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No pastors found.</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredPastors.map((pastor) => {
                  const pastorId = getUserId(pastor);
                  return (
                    <TouchableOpacity
                      key={pastorId}
                      style={styles.listCard}
                      onPress={() => handleSelectPastor(pastor)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={20} color="#8ec5eb" />
                      </View>
                      <View style={styles.listCardBody}>
                        <Text style={styles.listTitle} numberOfLines={1}>
                          {getDisplayName(pastor)}
                        </Text>
                        <Text style={styles.listSubtitle} numberOfLines={1}>
                          {pastor.email ?? "Pastor"}
                        </Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>View CDP</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>Selected pastor</Text>
            <Text style={styles.selectedName}>{selectedPastorName}</Text>

            {assessmentsLoading ? (
              <View style={styles.centerInline}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : cdpAssessments.length === 0 ? (
              <Text style={styles.emptyBlock}>
                No completed assessments with customized development plan found.
              </Text>
            ) : (
              cdpAssessments.map((assessment) => (
                <TouchableOpacity
                  key={assessment.id}
                  style={styles.listCard}
                  onPress={() => handleOpenCdp(assessment.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.avatar, styles.assessmentAvatar]}>
                    <Ionicons
                      name="clipboard-outline"
                      size={20}
                      color="#8ec5eb"
                    />
                  </View>
                  <View style={styles.listCardBody}>
                    <Text style={styles.listTitle} numberOfLines={2}>
                      {assessment.title}
                    </Text>
                    <Text style={styles.listSubtitle}>
                      Completed assessment with CDP
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#8ec5eb" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#176192",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  centerInline: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    textAlign: "center",
  },
  emptyBlock: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#8ec5eb",
  },
  selectedName: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(19, 42, 66, 0.85)",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(142, 197, 235, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  assessmentAvatar: {
    borderRadius: 12,
  },
  listCardBody: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  listSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(142, 197, 235, 0.45)",
    backgroundColor: "rgba(142, 197, 235, 0.15)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
});
