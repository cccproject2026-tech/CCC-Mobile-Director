import type {
    MicrograntApplication,
    MicrograntApplicationDetail,
    MicroGrantStatus,
    GrantApplicationData,
} from '@/types/microgrant.types';

const TAB_STATUSES: MicroGrantStatus[] = ['new', 'pending', 'accepted'];

export const MICROGRANT_QUESTION_LABELS = [
    'Name of the church',
    'Name of the project/program',
    'Who does the project/program serve and why is it important?',
    'Amount requested',
    'Project amount of denominational support (Local Conference, Union, NAD, GC, etc.)',
    'What action steps will you take to achieve your goals?',
    'What resources do you already have?',
    'Who will be leading and overseeing the project/program, and what are their qualifications?',
    'What are the measurable markers of your success?',
] as const;

export type MicrograntQuestionKey = (typeof MICROGRANT_QUESTION_LABELS)[number];

export const MICROGRANT_PAGE_TITLE =
    'The Center for Community Change Micro-Grant Application';

export const MICROGRANT_PAGE_DESCRIPTION =
    'Please keep in mind that the church applying for a grant must become a partner with the CCC by signing a MOU.';

export const MICROGRANT_REPORTING_TEXT = [
    'If approved, you will sign a grant agreement that lays out action steps. CCC may request mid-year updates and a final report upon completion.',
    'Upon completion of this project, the grantee church agrees to submit a general reporting form in light of the goals listed in the application.',
    'Our hope is that you will form valuable stories of connection that can be replicated and shared.',
];

export const MICROGRANT_CONFIRMATION_LABELS = {
    reviewed:
        'I have reviewed the application and filled out each section to the best of my knowledge.',
    uploadsIncluded:
        "I have included all of my uploads, and I realize this ensures it's sent within 4 weeks after receipt.",
};

const REPORTING_PROCEDURE_ITEMS = [
    'Upon approval, a grant agreement will be signed based on the submitted Action Steps—the CCC may modify, suspend, or stop payment of grant funds if the terms of the agreement are changed or not followed.',
    'Upon completion of the project, the grantee must submit a grant report regarding the use of funds consisting of a narrative report and financial accounting—the report ought to include copies of relevant receipts and records of expenditures.',
    'Any grant funds that have not been used for, or committed to, the project upon expiration or termination of the grant agreement must be returned to the CCC.',
];

export function getMicrograntReportingProcedureItems(): string[] {
    return REPORTING_PROCEDURE_ITEMS;
}

export function getMicrograntAnswerEntries(
    answers?: GrantApplicationData | null,
): { label: string; value: string }[] {
    if (!answers) return [];

    const used = new Set<string>();
    const entries: { label: string; value: string }[] = [];

    for (const label of MICROGRANT_QUESTION_LABELS) {
        const value = String(answers[label] ?? '').trim();
        if (value) {
            entries.push({ label, value });
            used.add(label);
        }
    }

    for (const [label, raw] of Object.entries(answers)) {
        if (used.has(label) || label === 'Other') continue;
        const value = String(raw ?? '').trim();
        if (value) entries.push({ label, value });
    }

    return entries;
}

export function normalizeMicrograntSupportingDocs(
    raw: unknown,
): { name: string; url: string }[] {
    if (!raw) return [];
    if (typeof raw === 'string' && raw.trim()) {
        const url = raw.trim();
        return [{ name: 'Supporting document', url }];
    }
    if (!Array.isArray(raw)) return [];

    return raw.map((doc, idx) => {
        if (typeof doc === 'string') {
            const looksUrl = /^https?:\/\//i.test(doc);
            return {
                name: looksUrl ? `Document ${idx + 1}` : doc,
                url: looksUrl ? doc : '',
            };
        }
        if (doc && typeof doc === 'object') {
            const o = doc as { name?: string; url?: string };
            return {
                name: o.name?.trim() || `Document ${idx + 1}`,
                url: typeof o.url === 'string' ? o.url : '',
            };
        }
        return { name: `Document ${idx + 1}`, url: '' };
    });
}

export function getMicrograntOtherNote(answers?: GrantApplicationData | null): string {
    return String(answers?.Other ?? answers?.other ?? '').trim();
}

export function unwrapMicrograntApplicationsList(res: { data?: unknown }): MicrograntApplication[] {
    const root = res?.data as Record<string, unknown> | unknown[] | undefined | null;
    if (root == null) return [];
    if (Array.isArray(root)) return root as MicrograntApplication[];
    if (typeof root === 'object') {
        const r = root as Record<string, unknown>;
        const candidates = [r.data, r.applications, r.items, r.records];
        for (const inner of candidates) {
            if (Array.isArray(inner)) return inner as MicrograntApplication[];
        }
    }
    return [];
}

export function unwrapMicrograntWithUser(
    res: { data?: unknown },
): MicrograntApplicationDetail | null {
    const root = res?.data;
    if (root == null || typeof root !== 'object') return null;
    const r = root as Record<string, unknown>;
    const inner = r.data;
    if (inner && typeof inner === 'object') {
        const p = inner as Record<string, unknown>;
        if ((p.user || p.userId) && p.application) {
            return normalizeMicrograntDetail(inner as MicrograntApplicationDetail);
        }
    }
    if ((r.user || r.userId) && r.application) {
        return normalizeMicrograntDetail(r as unknown as MicrograntApplicationDetail);
    }
    return null;
}

/** API may return `user` or `userId` — normalize to `userId` for the app. */
export function normalizeMicrograntDetail(
    detail: MicrograntApplicationDetail | null | undefined,
): MicrograntApplicationDetail | null {
    if (!detail) return null;
    const d = detail as MicrograntApplicationDetail & {
        user?: MicrograntApplicationDetail['userId'];
    };
    if (d.userId?._id) return detail;
    if (d.user?._id) {
        return { userId: d.user, application: d.application };
    }
    return detail;
}

export function getMicrograntApplicantUserId(app: MicrograntApplication): string | undefined {
    const u = app.userId as unknown;
    if (typeof u === 'string' && u.trim()) return u.trim();
    if (u && typeof u === 'object' && '_id' in (u as object)) {
        const id = (u as { _id?: string })._id;
        if (id != null && String(id).trim() !== '') return String(id);
    }
    return undefined;
}

/** Prefer applicant user id for GET `/microgrant/application/:id`; fall back to application `_id`. */
export function micrograntListDetailSlug(app: MicrograntApplication): string | undefined {
    return getMicrograntApplicantUserId(app) ?? (app._id ? String(app._id) : undefined);
}

export function getMicrograntDetailUserId(detail: MicrograntApplicationDetail): string | undefined {
    const normalized = normalizeMicrograntDetail(detail);
    return (
        normalized?.userId?._id ??
        (typeof normalized?.application?.userId === 'string'
            ? normalized.application.userId
            : undefined)
    );
}

export function buildMicrograntDetailFromListApplication(
    app: MicrograntApplication,
): MicrograntApplicationDetail | null {
    const uid = getMicrograntApplicantUserId(app);
    if (!uid) return null;

    const u = app.userId;
    let email = '—';
    let role = 'pastor';
    if (u && typeof u === 'object') {
        const o = u as { email?: string; role?: string };
        if (typeof o.email === 'string' && o.email) email = o.email;
        if (typeof o.role === 'string' && o.role) role = o.role;
    }

    return {
        userId: { _id: uid, email, role },
        application: {
            ...app,
            userId: uid,
            answers: app.answers ?? {},
        },
    };
}

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
    const email = (detail as { user?: { email?: string } }).user?.email ?? detail.userId?.email;
    if (email) return email;
    return churchLabelFromApplication(detail.application);
}