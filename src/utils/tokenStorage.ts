import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
    setTokens: async (accessToken: string, refreshToken: string) => {
        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
    },

    getTokens: async () => {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        return { accessToken, refreshToken };
    },

    clearTokens: async () => {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
    }
};
