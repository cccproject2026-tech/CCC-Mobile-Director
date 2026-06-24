/**
 * Axios Interceptors with DEV Logging
 * -----------------------------------
 * Helps debug:
 * - Request flow
 * - Token attachment
 * - Refresh flow
 * - Queue handling
 */

import { API_CONFIG } from '@/config';
import { useAuthStore } from '@/stores/auth.store';
import { unwrapAuthTokens } from '@/utils/authTokenResponse';
import { tokenStorage as storage } from '@/utils/tokenStorage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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

const getFullEndpoint = (config: InternalAxiosRequestConfig) => {
    const method = (config.method || 'get').toUpperCase();

    const fullUrl = axios.getUri({
        ...config,
        baseURL: config.baseURL || API_CONFIG.BASE_URL,
    });

    return { method, fullUrl };
};

const logApiRequest = (config: InternalAxiosRequestConfig) => {
    const { method, fullUrl } = getFullEndpoint(config);

    devLog('────────────────────────────────────────');
    devLog(`${method} ${fullUrl}`);

    if (config.params && Object.keys(config.params).length > 0) {
        devLog('Query:', config.params);
    }

    if (config.data !== undefined && config.data !== null && config.data !== '') {
        devLog('Body:', config.data);
    }
};

const logApiResponse = (config: InternalAxiosRequestConfig, status: number, data?: unknown) => {
    const { method, fullUrl } = getFullEndpoint(config);

    devLog(`${method} ${fullUrl} → ${status}`);
    if (data !== undefined) {
        devLog('Response:', data);
    }
    devLog('────────────────────────────────────────');
};

const processQueue = (error: any, token: string | null = null) => {
    devLog("Processing Failed Queue → count:", failedQueue.length);

    failedQueue.forEach((req) => {
        error ? req.reject(error) : req.resolve(token!);
    });
    failedQueue = [];
};

function requestUrlMatchesEndpoint(url: string | undefined, endpoint: string): boolean {
    if (!url) return false;
    return url === endpoint || url.endsWith(endpoint) || url.includes(endpoint);
}

function isAuthRequestUrl(url: string | undefined): boolean {
    return (
        requestUrlMatchesEndpoint(url, ENDPOINTS.AUTH.LOGIN) ||
        requestUrlMatchesEndpoint(url, ENDPOINTS.AUTH.REFRESH_TOKEN) ||
        requestUrlMatchesEndpoint(url, ENDPOINTS.AUTH.SEND_OTP) ||
        requestUrlMatchesEndpoint(url, ENDPOINTS.AUTH.VERIFY_OTP) ||
        requestUrlMatchesEndpoint(url, ENDPOINTS.AUTH.SET_PASSWORD)
    );
}

function shouldLogoutAfterRefreshFailure(error: unknown): boolean {
    if (error instanceof Error && error.message === 'No refresh token available') {
        return true;
    }
    if (error instanceof Error && error.message === 'Invalid refresh token response') {
        return true;
    }
    const status = (error as AxiosError)?.response?.status;
    // Only end the session when the server rejects the refresh token — not on transient network errors.
    return status === 401 || status === 403;
}

// =========================================
// REQUEST INTERCEPTOR
// =========================================
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Attach tokens
        const { accessToken } = await storage.getTokens();
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            config.headers['Cache-Control'] = 'no-cache';
            config.headers['Pragma'] = 'no-cache';
        }

        // Clean Params
        if (config.params) {
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

        logApiRequest(config);

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
        logApiResponse(response.config, response.status, response.data);
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // ---------------------------
        // Handle 401 → Refresh Flow
        // ---------------------------
        if (error.response?.status === 401 && !originalRequest._retry) {
            devLog("⚠️ 401 RECEIVED → Starting Refresh Flow");

            const isAuthEndpoint = isAuthRequestUrl(originalRequest.url);

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

                const tokens = unwrapAuthTokens(response.data);
                if (!tokens?.accessToken || !tokens.refreshToken) {
                    throw new Error('Invalid refresh token response');
                }

                const { accessToken, refreshToken: newRefreshToken } = tokens;

                devLog("✔ Refresh Success — New Tokens Saved");

                await storage.setTokens(accessToken, newRefreshToken);

                processQueue(null, accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                devLog("🔁 Retrying original request");
                return apiClient(originalRequest);
            } catch (refreshError) {
                devLog("❌ Refresh FAILED:", refreshError);

                processQueue(refreshError, null);

                if (shouldLogoutAfterRefreshFailure(refreshError)) {
                    await useAuthStore.getState().logout();
                }
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
        if (originalRequest) {
            const { method, fullUrl } = getFullEndpoint(originalRequest);
            devLog(`${method} ${fullUrl} → ERROR ${error.response.status}`);
            devLog('Error Response:', error.response.data);
            devLog('────────────────────────────────────────');
        } else {
            devLog("❌ API ERROR:", error.response.status, error.response.data);
        }

        const apiError = {
            message: (error.response.data as any)?.message || 'An error occurred',
            statusCode: error.response.status,
            errors: (error.response.data as any)?.errors,
        };

        return Promise.reject(apiError);
    }
);

export { };
