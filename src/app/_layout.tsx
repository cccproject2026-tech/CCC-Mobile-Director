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
      retry: (failureCount, error: unknown) => {
        const status =
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          typeof (error as { statusCode?: number }).statusCode === 'number'
            ? (error as { statusCode: number }).statusCode
            : undefined;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F3B5C' }}>
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
