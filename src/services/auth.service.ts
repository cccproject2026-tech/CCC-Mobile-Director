import { LoginCredentials, LoginResponse } from "@/types/auth.types";
import { ENDPOINTS } from "./api/endpoints";
import apiClient from "./api/client";

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        console.log('📤 Login request:', { email: credentials.email });
        const response = await apiClient.post<LoginResponse>(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );
        return response.data;
    },
}