
import { Stack } from 'expo-router';

export const unstable_settings = {
    // Dashboard context
    'index': {
        initialRouteName: '../index', // Points to dashboard outside group
    },

    'mentors': {
        initialRouteName: 'mentors/index',
    },

    'mentees': {
        initialRouteName: 'mentees/index',
    },
    'progress-tracker': {
        initialRouteName: 'progress-tracker/mentors',
    },
};

export default function SharedStackLayout({ segment }: { segment: string }) {
    return (
        <Stack
            screenOptions={{ headerShown: false }}>
            {/* Roadmap routes - ALL inside shared group */}
            <Stack.Screen name="mentees/index" />
            <Stack.Screen name="mentees/[id]/index" />
            <Stack.Screen name="mentees/[id]/progress" />
            <Stack.Screen name="mentees/assign-mentors" />
            <Stack.Screen name="mentees/remove-mentors" />
            <Stack.Screen name="mentees/mentees-location" />
            <Stack.Screen name="mentees/notes" />

            <Stack.Screen name="mentors/index" />
            <Stack.Screen name="mentors/[id]/index" />
            <Stack.Screen name="mentors/assign-mentees" />
            <Stack.Screen name="mentors/remove-mentee" />
            <Stack.Screen name="mentors/mentor-mentees" />

            <Stack.Screen name="progress-tracker/index" />
            <Stack.Screen name="progress-tracker/mentors/[id]" />



        </Stack>
    );
}
