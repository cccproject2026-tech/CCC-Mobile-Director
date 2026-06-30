import { Stack } from 'expo-router';

export default function MicroGrantLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="application-details" />
            <Stack.Screen name="application-review" />
        </Stack>
    );
}
