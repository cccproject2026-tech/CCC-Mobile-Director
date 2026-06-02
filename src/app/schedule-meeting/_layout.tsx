import { Stack } from "expo-router";

export default function ScheduleMeetingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <Stack.Screen name="person" />
      <Stack.Screen name="time" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}

