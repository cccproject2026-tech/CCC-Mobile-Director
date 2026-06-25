import { MentorAvailabilityWorkspace } from "@/components/mentor/availability/MentorAvailabilityWorkspace";
import TopBar from "@/components/Header/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { ScreenBackHeader } from "@/components/ui/design-system";
import { useAuthStore } from "@/stores/auth.store";
import { useSafeBack } from "@/hooks/useSafeBack";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AvailabilityScreen = () => {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuthStore();
  const mentorId = user?.id ?? "";
  const [activeTab, setActiveTab] = useState<"appointments" | "availability">(
    "availability",
  );

  useFocusEffect(
    useCallback(() => {
      setActiveTab("availability");
    }, []),
  );

  const handleTabPress = (tab: "appointments" | "availability") => {
    setActiveTab(tab);
    if (tab === "appointments") {
      router.replace("/(director)/(tabs)/appointments");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground>
        <View style={{ paddingBottom: 10 }}>
          <TopBar role="director" showUserName />
        </View>
        <View style={{ flex: 1 }}>
          <ScreenBackHeader title="Schedule" onPressBack={safeBack} />

          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === "appointments" && styles.activeTab]}
              onPress={() => handleTabPress("appointments")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "appointments" && styles.activeTabText,
                ]}
              >
                Appointments
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "availability" && styles.activeTab]}
              onPress={() => handleTabPress("availability")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "availability" && styles.activeTabText,
                ]}
              >
                Availability
              </Text>
            </Pressable>
          </View>

          <View style={{ flex: 1, paddingBottom: bottom + 8 }}>
            {mentorId ? (
              <MentorAvailabilityWorkspace mentorId={mentorId} />
            ) : (
              <View style={styles.signInHint}>
                <Text style={styles.signInText}>
                  Sign in to manage your availability.
                </Text>
              </View>
            )}
          </View>
        </View>
      </AppGradientBackground>
    </>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: { backgroundColor: "rgba(255,255,255,0.18)" },
  tabText: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "800",
    fontSize: 13,
  },
  activeTabText: { color: "#FFFFFF" },
  signInHint: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  signInText: { color: "rgba(255,255,255,0.75)", textAlign: "center" },
});

export default AvailabilityScreen;
