import TopBar from "@/components/Header/TopBar";
import { GradientBackground } from "@/components/ui/design-system";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function PlaceholderRouteScreen({ title, message, icon = "information-circle-outline" }: Props) {
  const router = useRouter();

  return (
    <GradientBackground>
      <Stack.Screen options={{ headerShown: false, title }} />
      <TopBar showUserName showNotifications />

      <View style={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#D9EEF8" />
          <Text style={styles.backText}>{title}</Text>
        </Pressable>

        <View style={styles.card}>
          <Ionicons name={icon} size={40} color="rgba(255,255,255,0.5)" />
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>{message}</Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 },
  backText: { color: "#D9EEF8", fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  card: {
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "800", textAlign: "center" },
  cardBody: { color: "rgba(255,255,255,0.75)", textAlign: "center", fontSize: 14, fontWeight: "600" },
});
