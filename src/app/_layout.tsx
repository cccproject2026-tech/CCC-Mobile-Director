import "@/services/api/interceptors";
import "@/utils/patchRouterBack";
import { NavigationBackHandler } from "@/components/navigation/NavigationBackHandler";
import { AddFieldSheetProvider } from "@/contexts/AddFieldSheetContext";
import { useGoogleCalendarOAuthReturn } from "@/hooks/googleCalendar/useGoogleCalendarOAuthReturn";
import { useAuthStore } from "@/stores/auth.store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";

// Initialize TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 5 * 60 * 1000, // 5 minutes
      // retry: 2,
      // refetchOnWindowFocus: false,
    },
  },
});

function GoogleCalendarOAuthListener() {
  useGoogleCalendarOAuthReturn();
  return null;
}

function RootNav() {
  const { isAuthenticated } = useAuthStore();
  const canUseScheduleMeeting = isAuthenticated;

  return (
    <>
      <GoogleCalendarOAuthListener />
      <Stack screenOptions={{ headerShown: false }}>

      {/* AUTH ROUTES */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* DIRECTOR ROUTESs */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(director)" />
      </Stack.Protected>

      <Stack.Protected guard={canUseScheduleMeeting}>
        <Stack.Screen name="schedule-meeting" />
      </Stack.Protected>

      <Stack.Screen
        name="oauth/google-calendar"
        options={{ headerShown: false, animation: "none" }}
      />

      <Stack.Screen name="appointments/meeting-details" />

      <Stack.Screen name="+not-found" />

    </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <AddFieldSheetProvider>
              <NavigationBackHandler />
              <RootNav />
            </AddFieldSheetProvider>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
