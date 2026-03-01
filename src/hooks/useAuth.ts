import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { LoginCredentials } from "@/types/auth.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
// Assuming 'storage' (for tokens) and 'authKeys' are imported or available in this file.
import { tokenStorage as storage } from '@/utils/tokenStorage';

export const authKeys = {
    all: ['auth'] as const,
    login: ['auth', 'login'] as const,
    logout: ['auth', 'logout'] as const,
};


export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);
    // Profile picture state dependency is correctly removed

    return useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            authService.login(credentials),
        onSuccess: async (response) => {
            console.log('✅ Login successful');

            try {
                const { user, accessToken, refreshToken } = response.data;

                // 🛡️ SECURITY GUARD: 
                // Ensure only Directors or Super Admins can access this app
                const allowedRoles = ['director', 'super admin'];

                if (!allowedRoles.includes(user.role)) {
                    Alert.alert(
                        "Access Denied",
                        "This application is restricted to Directors and Administrators."
                    );
                    return;
                }

                // 1. Store tokens in SecureStore (using the global 'storage' utility)
                await storage.setTokens(accessToken, refreshToken);

                // 2. Normalize user so id is always set (backend may send _id only)
                const normalizedUser = {
                    ...user,
                    id: (user as { id?: string; _id?: string }).id ?? (user as { _id?: string })._id ?? '',
                };

                // 3. Update auth store: This single call updates runtime state AND
                // triggers Zustand's persistence middleware (MMKV) to save the user object.
                setUser(normalizedUser as any);

                // 4. Invalidate all auth queries
                await queryClient.invalidateQueries({
                    queryKey: authKeys.all,
                });

                console.log(`✅ Logged in as [${normalizedUser.role}]:`, normalizedUser.email);

                // 5. Unified Routing: Both roles go to the same dashboard layout.
                router.replace('/(director)/(tabs)');

            } catch (error) {
                console.error('❌ Error in login onSuccess:', error);
                Alert.alert("Login Error", "Failed to save session data.");
            }
        },
        onError: (error: any) => {
            // Returns the error object for the consuming component to display
            return error;
        },
    });
};