import type {
    MicrograntApplication,
    MicrograntApplicationDetail,
    MicroGrantStatus,
} from '@/types/microgrant.types';

const TAB_STATUSES: MicroGrantStatus[] = ['new', 'pending', 'accepted'];

export const MICROGRANT_PAGE_TITLE =
    'The Center for Community Change Micro-Grant Application';

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

export function churchLabelFromApplication(app: MicrograntApplication): string {
    const a = app.answers ?? {};
    return (
        (a['Church Name'] as string) ||
        (a['Name of the church'] as string) ||
        (a['name of the church'] as string) ||
        'Unknown applicant'
    );
}

export function displayNameFromMicrograntDetail(
    detail: MicrograntApplicationDetail,
    profile?: { firstName?: string; lastName?: string } | null,
): string {
    const fn = profile?.firstName?.trim();
    const ln = profile?.lastName?.trim();
    if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
    if (detail.user?.email) return detail.user.email;
    return churchLabelFromApplication(detail.application);
}