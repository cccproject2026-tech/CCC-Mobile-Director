export type NotificationModule = 'interest' | 'APPOINTMENT' | string;

export type ApiNotificationItem = {
    _id: string;
    name: string;
    details: string;
    module: NotificationModule;
    read: boolean;
    createdAt: string;
};

export type NotificationsData = {
    _id: string;
    userId: string | null;
    role: string;
    notifications: ApiNotificationItem[];
    createdAt: string;
    updatedAt: string;
};

export type NotificationsApiResponse = {
    success: boolean;
    message: string;
    data: NotificationsData;
};

export type AppNotification = {
    id: string;
    title: string;
    details: string;
    module: string;
    read: boolean;
    createdAt: string;
};

export type NotificationsPayload = {
    items: AppNotification[];
    unreadCount: number;
};
