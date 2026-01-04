import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProfileContent from '@/components/ProfileSection/ProfileContent';
import { useAuthStore } from '@/stores/auth.store';
import { Colors } from '@/constants/Colors';
import { useUserProfile } from '@/hooks/useProfile';

export default function DirectorProfileScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { user: authUser } = useAuthStore();
  // For this specific page, the target is always the logged-in Director
  const targetUserId = authUser?.id || "";

  if (!targetUserId) {
    return (
      <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
        <View style={styles.centeredPadded}>
          <Text style={styles.errorText}>No session found. Please login again.</Text>
          <TouchableOpacity
            onPress={() => router.replace('/login' as any)}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }
  const { data: profileData, isLoading, isError } = useUserProfile(authUser?.id || "");

  return (
    <ProfileContent
      userId={targetUserId}
      isOwnProfile={true}
      bottomInsets={bottom}
      profileData={profileData}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredPadded: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  goBackButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.lightBlue,
    borderRadius: 8,
  },
  goBackText: {
    color: '#fff',
    fontSize: 14,
  },
});