import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GradientBackground } from '@/components/ui/design-system';
import { roadmapTheme } from '@/components/ui/design-system/roadmapTheme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProfileContent from '@/components/ProfileSection/ProfileContent';
import { useAuthStore } from '@/stores/auth.store';
import { useUserProfile } from '@/hooks/useProfile';

export default function DirectorProfileScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { user: authUser } = useAuthStore();
  const targetUserId = authUser?.id || "";

  if (!targetUserId) {
    return (
      <GradientBackground>
        <View style={styles.centeredPadded}>
          <Text style={styles.errorText}>No session found. Please login again.</Text>
          <TouchableOpacity
            onPress={() => router.replace('/login' as any)}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }
  const { data: userData, isLoading, isError } = useUserProfile(authUser?.id || "");

  const profileData = React.useMemo(() => {
    if (!userData) return null;
    return {
      user: userData,
      interest: userData.interest || null,
      progress: null,
    };
  }, [userData]);

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
  centeredPadded: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  goBackButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  goBackText: {
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});