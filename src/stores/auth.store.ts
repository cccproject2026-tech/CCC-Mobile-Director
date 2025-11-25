import { User } from '@/types/user.types';
import { tokenStorage } from '@/utils/tokenStorage';
import zustandStorage from '@/utils/zustandStorage';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    setUser: (user: User) => void;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({

            user: null,
            isAuthenticated: false,

            /**
             * Set user after login
             */
            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: true,
                });
            },

            /**
             * Logout:
             * 1. Clear JWT tokens from SecureStore
             * 2. Clear MMKV persisted Zustand store
             */
            logout: async () => {
                await tokenStorage.clearTokens();
                zustandStorage.removeItem('director-auth');

                set({
                    user: null,
                    isAuthenticated: false,
                });
            },

            /**
             * Check if user is authenticated on app startup
             * If accessToken exists → user is considered authenticated
             */
            initialize: async () => {
                const { accessToken } = await tokenStorage.getTokens();
                set({
                    isAuthenticated: !!accessToken,
                });
            },

            /**
             * Update part of user data
             */
            updateUser: (updates) => {
                const currentUser = get().user;
                if (!currentUser) return;

                set({
                    user: { ...currentUser, ...updates },
                });
            },
        }),

        {
            name: 'director-auth',
            storage: createJSONStorage(() => zustandStorage),

            /**
             * Only the user + auth flag goes into MMKV.
             * Tokens remain inside SecureStore.
             */
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
