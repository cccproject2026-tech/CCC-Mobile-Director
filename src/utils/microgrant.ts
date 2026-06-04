import type { MicroGrantStatus } from '@/types/microgrant.types';

const TAB_STATUSES: MicroGrantStatus[] = ['new', 'pending', 'accepted'];

/** Normalize API/legacy status values to tab filter keys (CCC-Web aligned). */
export function normalizeMicroGrantStatus(
    status: string | undefined | null,
): MicroGrantStatus | null {
    const s = String(status ?? '').toLowerCase();
    if (s === 'new') return 'new';
    if (s === 'pending' || s === 'under_review') return 'pending';
    if (s === 'accepted' || s === 'approved') return 'accepted';
    if (s === 'rejected') return 'rejected';
    return null;
}

export function countMicroGrantApplicationsByTab(
    applications: { status?: string }[],
): Record<'new' | 'pending' | 'accepted', number> {
    const counts = { new: 0, pending: 0, accepted: 0 };
    for (const app of applications) {
        const normalized = normalizeMicroGrantStatus(app.status);
        if (normalized && TAB_STATUSES.includes(normalized)) {
            counts[normalized] += 1;
        }
    }
    return counts;
}
