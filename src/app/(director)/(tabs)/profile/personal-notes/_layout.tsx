import { Stack } from 'expo-router';

export default function PersonalNotesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="new-note" />
            <Stack.Screen name="note-detail" />
        </Stack>
    );
}
