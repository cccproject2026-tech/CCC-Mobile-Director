/**
 * Axios Interceptors with DEV Logging
 * -----------------------------------
 * Helps debug:
 * - Request flow
 * - Token attachment
 * - Refresh flow
 * - Queue handling
 */

import { useAuthStore } from '@/stores/auth.store';
import { tokenStorage as storage } from '@/utils/tokenStorage';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';



let isRefreshing = false;

type QueuedRequest = {
    resolve: (token: string) => void;
    reject: (error: any) => void;
};

let failedQueue: QueuedRequest[] = [];

if (__DEV__) {
    console.log("🚀 API Interceptors initialized");
}

const devLog = (...args: any[]) => {
    if (__DEV__) console.log("[API]", ...args);
};

const processQueue = (error: any, token: string | null = null) => {
    devLog("Processing Failed Queue → count:", failedQueue.length);

    failedQueue.forEach((req) => {
        error ? req.reject(error) : req.resolve(token!);
    });
    failedQueue = [];
};

// =========================================
// REQUEST INTERCEPTOR
// =========================================
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        devLog("↗ REQUEST:", config.url);

        // Attach tokens
        const { accessToken } = await storage.getTokens();
        if (accessToken && config.headers) {
            devLog("→ Attached Access Token");
            config.headers.Authorization = `Bearer ${accessToken}`;
            config.headers['Cache-Control'] = 'no-cache';
            config.headers['Pragma'] = 'no-cache';
        }

        // Clean Params
        if (config.params) {
            devLog("→ Cleaning Query Params");

            const cleaned: Record<string, any> = {};
            for (const [key, value] of Object.entries(config.params)) {
                const str = String(value);
                if (
                    value !== undefined &&
                    value !== null &&
                    str.trim() !== '' &&
                    str !== 'undefined' &&
                    str !== 'null'
                ) {
                    cleaned[key] = value;
                }
            }

            config.params = Object.keys(cleaned).length > 0 ? cleaned : undefined;
        }

        // Clean bad URL params
        if (config.url?.includes("undefined")) {
            devLog("⚠️ Found 'undefined' in URL — cleaning...");
            config.url = config.url
                .replace(/[?&][^=]*=undefined/g, "")
                .replace(/[?&]$/, "");
        }

        return config;
    },
    (error) => {
        devLog("❌ REQUEST ERROR:", error);
        return Promise.reject(error);
    }
);

// =========================================
// RESPONSE INTERCEPTOR
// =========================================
apiClient.interceptors.response.use(
    (response) => {
        devLog("✔ RESPONSE:", response.config.url, "Status:", JSON.stringify(response?.data));
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // ---------------------------
        // Handle 401 → Refresh Flow
        // ---------------------------
        if (error.response?.status === 401 && !originalRequest._retry) {
            devLog("⚠️ 401 RECEIVED → Starting Refresh Flow");

            const isAuthEndpoint =
                originalRequest.url === ENDPOINTS.AUTH.LOGIN ||
                originalRequest.url === ENDPOINTS.AUTH.REFRESH_TOKEN ||
                originalRequest.url === ENDPOINTS.AUTH.SEND_OTP ||
                originalRequest.url === ENDPOINTS.AUTH.VERIFY_OTP ||
                originalRequest.url === ENDPOINTS.AUTH.SET_PASSWORD;

            if (isAuthEndpoint) {
                devLog("❌ 401 from Auth Endpoint — Not Refreshing");
                return Promise.reject(error);
            }

            // If already refreshing → queue the request
            if (isRefreshing) {
                devLog("⏳ Refresh already in progress → Queuing Request");
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        devLog("🔁 Retrying queued request");
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // Start refresh
            originalRequest._retry = true;
            isRefreshing = true;
            devLog("🔄 Refresh Token API Call");

            try {
                const { refreshToken } = await storage.getTokens();
                if (!refreshToken) throw new Error("No refresh token available");

                const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                devLog("✔ Refresh Success — New Tokens Saved");

                await storage.setTokens(accessToken, newRefreshToken);

                processQueue(null, accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                devLog("🔁 Retrying original request");
                return apiClient(originalRequest);
            } catch (refreshError) {
                devLog("❌ Refresh FAILED:", refreshError);

                processQueue(refreshError, null);

                await useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                devLog("🔚 Refresh flow ended");
                isRefreshing = false;
            }
        }

        // ---------------------------
        // Handle Network Errors
        // ---------------------------
        if (!error.response) {
            devLog("❌ NETWORK ERROR:", error);
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            });
        }

        // ---------------------------
        // Other API Errors
        // ---------------------------
        devLog("❌ API ERROR:", error.response.status, error.response.data);

        const apiError = {
            message: (error.response.data as any)?.message || 'An error occurred',
            statusCode: error.response.status,
            errors: (error.response.data as any)?.errors,
        };

        return Promise.reject(apiError);
    }
);

export { };
