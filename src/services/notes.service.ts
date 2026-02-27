import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface ApiNote {
    _id: string;
    id?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

/** Normalize array from various backend response shapes */
function normalizeNotesList(response: unknown): ApiNote[] {
    const data = response as Record<string, unknown>;
    if (!data) return [];
    if (Array.isArray(data.data)) return data.data as ApiNote[];
    if (Array.isArray(data.notes)) return data.notes as ApiNote[];
    if (Array.isArray(data)) return data as ApiNote[];
    if (data.result && Array.isArray(data.result)) return data.result as ApiNote[];
    // Fallback: any key whose value is an array of objects with content/_id
    if (typeof data === 'object') {
        for (const value of Object.values(data)) {
            if (Array.isArray(value) && value.length > 0) {
                const first = value[0];
                if (first && typeof first === 'object' && ('content' in first || '_id' in first || 'id' in first)) {
                    return value as ApiNote[];
                }
            }
        }
    }
    return [];
}

/** Normalize single note from create/update response */
function normalizeNote(response: unknown): ApiNote | null {
    const data = response as Record<string, unknown>;
    if (!data) return null;
    const note = (data.data ?? data.note ?? data) as ApiNote | undefined;
    if (note && typeof note === 'object' && (note._id || (note as ApiNote & { id?: string }).id)) {
        return { ...note, _id: note._id ?? (note as ApiNote & { id?: string }).id! } as ApiNote;
    }
    return null;
}

export const NotesService = {
    async getNotes(userId: string, options?: { cacheBust?: boolean }): Promise<ApiNote[]> {
        const url = ENDPOINTS.USERS.NOTES(userId);
        const params = options?.cacheBust ? { _t: Date.now() } : undefined;
        const response = await apiClient.get(url, { params });
        return normalizeNotesList(response.data ?? response);
    },

    async getNoteById(userId: string, noteId: string): Promise<ApiNote | null> {
        try {
            const response = await apiClient.get(ENDPOINTS.USERS.NOTE_BY_ID(userId, noteId));
            return normalizeNote(response.data ?? response);
        } catch {
            return null;
        }
    },

    async createNote(userId: string, content: string): Promise<ApiNote | null> {
        // Send both 'content' and 'text' for backend compatibility (some APIs use 'text')
        const body = { content, text: content };
        const response = await apiClient.post(ENDPOINTS.USERS.NOTES(userId), body);
        return normalizeNote(response.data ?? response);
    },

    async updateNote(userId: string, noteId: string, content: string): Promise<ApiNote | null> {
        const response = await apiClient.patch(ENDPOINTS.USERS.NOTE_BY_ID(userId, noteId), {
            content,
        });
        return normalizeNote(response.data ?? response);
    },

    async deleteNote(userId: string, noteId: string): Promise<boolean> {
        const response = await apiClient.delete(ENDPOINTS.USERS.NOTE_BY_ID(userId, noteId));
        const data = (response.data ?? response) as Record<string, unknown>;
        // Support various backend success shapes
        if (data?.success === true) return true;
        if (data?.deleted === true) return true;
        if (typeof data?.success === 'undefined' && response.status >= 200 && response.status < 300) return true;
        return false;
    },
};
