import {
    AddRoadmapCommentPayload,
    RoadmapComment,
    RoadmapExtraAnswer,
    RoadmapExtrasDocument,
    RoadmapQuery,
    NestedRoadmap,
} from '@/types/roadmap.types';

export function unwrapApiData<T>(body: unknown): T | null {
    if (body == null) return null;
    if (typeof body !== 'object') return body as T;
    const o = body as Record<string, unknown>;
    if (o.success === false) return null;
    if ('data' in o && o.data !== undefined) return unwrapApiData<T>(o.data);
    return o as T;
}

export function unwrapComments(body: unknown): RoadmapComment[] {
    const thread = unwrapApiData<{ comments?: RoadmapComment[] } | RoadmapComment[]>(body);
    if (Array.isArray(thread)) return thread;
    if (thread && typeof thread === 'object' && Array.isArray((thread as { comments?: RoadmapComment[] }).comments)) {
        return (thread as { comments: RoadmapComment[] }).comments;
    }
    return [];
}

export function unwrapQueries(body: unknown): RoadmapQuery[] {
    const data = unwrapApiData<unknown>(body);
    const threads = Array.isArray(data) ? data : data ? [data] : [];
    const out: RoadmapQuery[] = [];
    for (const t of threads) {
        if (!t || typeof t !== 'object') continue;
        const q = (t as { queries?: RoadmapQuery[] }).queries;
        if (Array.isArray(q)) out.push(...q);
        else if ('_id' in (t as object)) out.push(t as RoadmapQuery);
    }
    return out;
}

export function unwrapExtrasRows(body: unknown): RoadmapExtraAnswer[] {
    const data = unwrapApiData<{ extras?: RoadmapExtraAnswer[] } | RoadmapExtraAnswer[]>(body);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as { extras?: RoadmapExtraAnswer[] }).extras)) {
        return (data as { extras: RoadmapExtraAnswer[] }).extras;
    }
    return [];
}

export function unwrapExtrasDocuments(body: unknown): RoadmapExtrasDocument[] {
    const data = unwrapApiData<{ documents?: RoadmapExtrasDocument[] } | RoadmapExtrasDocument[]>(body);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as { documents?: RoadmapExtrasDocument[] }).documents)) {
        return (data as { documents: RoadmapExtrasDocument[] }).documents;
    }
    return [];
}

export function isRenderableExtraRow(item: RoadmapExtraAnswer): boolean {
    const t = String(item.type ?? '').toUpperCase();
    return t !== '' && t !== 'JUMPSTART_COMPLETE';
}

export function dedupeExtrasByLabel(rows: RoadmapExtraAnswer[]): RoadmapExtraAnswer[] {
    const map = new Map<string, RoadmapExtraAnswer>();
    for (const row of rows) {
        if (!isRenderableExtraRow(row)) continue;
        const label = String(row.name ?? row.key ?? '').trim().toLowerCase();
        if (!label) continue;
        map.set(label, row);
    }
    return Array.from(map.values());
}

export function findNestedTaskById(nodes: unknown[], id: string): NestedRoadmap | null {
    const target = String(id);
    for (const node of nodes) {
        if (!node || typeof node !== 'object') continue;
        const n = node as NestedRoadmap & { id?: string };
        if (String(n._id ?? n.id) === target) return n;
        const children = (n as { roadmaps?: unknown[] }).roadmaps;
        if (Array.isArray(children)) {
            const found = findNestedTaskById(children, id);
            if (found) return found;
        }
    }
    return null;
}

export function formatRoadmapDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function mapStatusChip(status?: string): string {
    const s = (status ?? '').toLowerCase();
    if (s.includes('complete')) return 'Completed';
    if (s.includes('progress')) return 'In Progress';
    if (s.includes('due') || s.includes('overdue')) return 'Due';
    return 'Not Started';
}

export function recordMatchesNestedTask(
    record: { nestedRoadMapItemId?: string | null; taskId?: string | null },
    nestedTaskId: string,
): boolean {
    const ids = [record.nestedRoadMapItemId, record.taskId]
        .filter((v): v is string => v != null && String(v).trim() !== '')
        .map(String);
    if (ids.length === 0) return false;
    return ids.some((id) => id === nestedTaskId);
}

export function withNestedTaskScope(
    payload: AddRoadmapCommentPayload,
    nestedTaskId?: string,
): AddRoadmapCommentPayload {
    if (!nestedTaskId) return payload;
    return {
        ...payload,
        nestedRoadMapItemId: payload.nestedRoadMapItemId ?? nestedTaskId,
        taskId: payload.taskId ?? nestedTaskId,
    };
}

export function documentsByFieldName(docs: RoadmapExtrasDocument[]): Map<string, RoadmapExtrasDocument[]> {
    const map = new Map<string, RoadmapExtrasDocument[]>();
    for (const batch of docs) {
        const key = String(batch.name ?? '').trim().toLowerCase();
        if (!key) continue;
        const prev = map.get(key) ?? [];
        prev.push(batch);
        map.set(key, prev);
    }
    return map;
}

export function formatExtraValue(item: RoadmapExtraAnswer): string {
    const val = item.value ?? item.signatureData;
    if (val == null) return '';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val).trim();
}
