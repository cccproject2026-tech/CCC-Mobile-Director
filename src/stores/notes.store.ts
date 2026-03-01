import { create } from 'zustand';

interface NotesStore {
    /** Increment to trigger list refetch (after create/update/delete) */
    invalidationKey: number;
    invalidateNotes: () => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
    invalidationKey: 0,
    invalidateNotes: () => set((s) => ({ invalidationKey: s.invalidationKey + 1 })),
}));
