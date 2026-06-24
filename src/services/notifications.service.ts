import apiClient from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
    NotificationsApiResponse,
    NotificationsPayload,
} from '@/types/notification.types';

export const notificationsService = {
    getByRole: async (role: string): Promise<NotificationsPayload> => {
        const response = await apiClient.get<NotificationsApiResponse>(
            ENDPOINTS.HOME.NOTIFICATIONS,
            {
                params: {
                    role: role.toLowerCase(),
                    t: Date.now(),
                },
                timeout: 60_000,
            },
        );

        const body = response.data;
        const list =
            body?.data?.notifications ??
            (body as { notifications?: typeof body.data.notifications }).notifications ??
            [];
        let unreadCount = 0;

        const items = (Array.isArray(list) ? list : [])
            .map((raw) => {
                const item = raw as {
                    _id?: string;
                    id?: string;
                    name?: string;
                    title?: string;
                    details?: string;
                    description?: string;
                    module?: string;
                    read?: boolean;
                    createdAt?: string;
                };

                if (!item?.read) unreadCount += 1;

                return {
                    id: String(item?._id ?? item?.id ?? ''),
                    title: String(item?.name ?? item?.title ?? ''),
                    details: String(item?.details ?? item?.description ?? ''),
                    module: String(item?.module ?? ''),
                    read: Boolean(item?.read),
                    createdAt: String(item?.createdAt ?? ''),
                };
            })
            .filter((item) => item.id && item.title)
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

        return { items, unreadCount };
    },
};
