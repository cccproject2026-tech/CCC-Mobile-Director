import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function NewInterestsLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: Colors.appBgGradient[0] }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.appBgGradient[0] },
                    animation: 'fade',
                }}
            />
        </View>
    );
}
