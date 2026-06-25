import UserDocumentsScreen from '@/components/ProfileSection/UserDocumentsScreen';
import { useAuthStore } from '@/stores/auth.store';
import React from 'react';

/** Director's own documents — Profile tab only. */
export default function DirectorDocumentsScreen() {
    const { user } = useAuthStore();
    return <UserDocumentsScreen userId={user?.id ?? ''} />;
}
