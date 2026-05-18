import { GradientBackground } from '@/components/ui/design-system';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MenteesLocations() {
    const router = useRouter();
    return (
        <GradientBackground>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <View style={styles.backIconWrap}>
                        <Ionicons name="chevron-back" size={20} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Pastor Locations</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.center}>
                <Ionicons name="map-outline" size={40} color="rgba(255,255,255,0.3)" />
                <Text style={styles.text}>Map coming soon</Text>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    text: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500' },
});
