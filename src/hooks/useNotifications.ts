import { notificationsService } from '@/services/notifications.service';
import { NotificationsPayload } from '@/types/notification.types';
import { useQuery } from '@tanstack/react-query';

export const notificationKeys = {
    byRole: (role: string) => ['notifications', role, 'v2'] as const,
};

const NOTIFICATIONS_STALE_TIME = 60_000;

export function getNotificationsApiRole(role?: string): string {
    const normalized = String(role ?? 'director').toLowerCase().trim();

    if (normalized === 'super admin' || normalized === 'superadmin') {
        return 'director';
    }

    return normalized || 'director';
}

function notificationsQueryOptions(role: string) {
    return {
        queryKey: notificationKeys.byRole(role),
        queryFn: () => notificationsService.getByRole(role),
        staleTime: NOTIFICATIONS_STALE_TIME,
        gcTime: 5 * 60_000,
    };
}

export function useNotifications(role?: string, enabled = true) {
    const apiRole = getNotificationsApiRole(role);

    return useQuery<NotificationsPayload>({
        ...notificationsQueryOptions(apiRole),
        enabled,
        placeholderData: (previous) => previous,
    });
}

export function useUnreadNotificationCount(role?: string, enabled = true) {
    const apiRole = getNotificationsApiRole(role);

    const { data = 0 } = useQuery({
        ...notificationsQueryOptions(apiRole),
        enabled,
        select: (payload) => payload.unreadCount,
    });

    return data;
}
