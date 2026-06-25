import UserDocumentsScreen from '@/components/ProfileSection/UserDocumentsScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function MenteeDocumentsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <UserDocumentsScreen userId={id} />;
}
