import type { Href } from 'expo-router';

export function getNotificationRoute(module: string): Href | null {
    const normalized = String(module ?? '').toLowerCase();

    if (normalized === 'interest') {
        return '/(director)/(tabs)/new-interests';
    }

    if (normalized === 'appointment') {
        return '/(director)/(tabs)/appointments';
    }

    return null;
}

export function mapNotificationModuleToCardType(
    module: string,
): 'course' | 'note' | 'assignment' | 'profile' {
    const normalized = String(module ?? '').toLowerCase();

    if (normalized === 'interest') return 'assignment';
    if (normalized === 'appointment') return 'course';

    return 'note';
}

export function formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '';

    return date
        .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .toLowerCase();
}

export function formatNotificationBadgeCount(count: number): string {
    if (count <= 0) return '0';
    if (count >= 100) return '99+';
    return String(count);
}
