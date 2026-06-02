import { getGoogleCalendarStatus } from '@/services/googleCalendar.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  GoogleCalendarConnectionStatus,
  GoogleCalendarStatus,
} from '@/types/googleCalendar.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const googleCalendarStatusQueryKey = (userId: string) =>
  ['google-calendar-status', userId] as const;

export function useGoogleCalendarStatus(options?: { enabled?: boolean }) {
  const userId = useAuthStore((s) => s.user?.id)?.trim() ?? '';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const enabled = (options?.enabled ?? true) && isAuthenticated && !!userId;

  const queryKey = useMemo(() => googleCalendarStatusQueryKey(userId), [userId]);

  const query = useQuery<GoogleCalendarConnectionStatus>({
    queryKey,
    enabled,
    staleTime: 60_000,
    queryFn: getGoogleCalendarStatus,
  });

  const status: GoogleCalendarStatus | null = query.data?.status ?? null;
  const connected = query.data?.connected ?? false;

  return {
    ...query,
    userId,
    queryKey,
    status,
    connected,
    email: query.data?.email ?? null,
    connectedAt: query.data?.connectedAt ?? null,
    lastSyncAt: query.data?.lastSyncAt ?? null,
    lastError: query.data?.lastError ?? null,
    calendarConnectionStatus: query.data ?? null,
  };
}

/** Invalidate and refetch Google Calendar status (after OAuth). */
export async function refreshGoogleCalendarStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
) {
  const key = googleCalendarStatusQueryKey(userId);
  await queryClient.invalidateQueries({ queryKey: ['google-calendar-status'] });
  await queryClient.invalidateQueries({ queryKey: key, exact: true });
  await queryClient.refetchQueries({ queryKey: key, exact: true });
}

/** Shared post-OAuth cache refresh (matches ccc-web). */
export async function invalidateAfterGoogleCalendarOAuth(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
) {
  await queryClient.invalidateQueries({ queryKey: ['mentor-availability'] });
  await queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
  await queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });
  await refreshGoogleCalendarStatus(queryClient, userId);
}
