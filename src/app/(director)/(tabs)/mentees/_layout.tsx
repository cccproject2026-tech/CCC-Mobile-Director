import { Stack } from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index', // ✅ Force to always start at index
};

export default function MenteesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}
