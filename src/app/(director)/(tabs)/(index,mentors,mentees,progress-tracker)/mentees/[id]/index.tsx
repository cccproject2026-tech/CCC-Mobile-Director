import ProfileContent from '@/components/ProfileSection/ProfileContent';
import { useMentorMenteeProfile } from '@/hooks/useProfile';
import { getReturnToParam } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function MentorMenteeProfileScreen() {
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id: string; returnTo?: string }>();
    const { id } = params;

    const { data: profileData, isLoading, isError } = useMentorMenteeProfile(id);

    return (
        <ProfileContent
            userId={id}
            isOwnProfile={false}
            bottomInsets={bottom}
            profileData={profileData!}
            isLoading={isLoading}
            isError={isError}
            returnTo={getReturnToParam(params)}
        />
    );
}

