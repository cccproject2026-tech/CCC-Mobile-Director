import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { safeGoBack } from '@/utils/navigation';

/**
 * When `returnTo` is set, native stack back (iOS swipe / some Android gestures)
 * should restore that href instead of the default pop target.
 */
export function useReturnToAwareBack(returnTo?: string) {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const trimmed = String(returnTo ?? '').trim();
    if (!trimmed) return;

    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      const actionType = event.data.action.type;
      if (actionType !== 'GO_BACK' && actionType !== 'POP') return;

      event.preventDefault();
      safeGoBack(router, { returnTo: trimmed });
    });

    return unsubscribe;
  }, [navigation, returnTo, router]);
}
