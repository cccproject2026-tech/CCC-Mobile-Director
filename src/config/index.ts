export const API_CONFIG = {
    BASE_URL: `${process.env.EXPO_PUBLIC_API_URL}/api/v1` || 'http://13.221.25.133',
    TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
} as const;
