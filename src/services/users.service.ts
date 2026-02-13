import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { UserRole, User } from '@/types/user.types';

export interface GetUsersApiResponse {
    success: boolean;
    message: string;
    data: {
        users: User[];
        page: number;
        totalPages: number;
        total: number;
    };
}

export const usersService = {
    getUsersByRole: async (role: UserRole, page: number = 1, limit: number = 10): Promise<GetUsersApiResponse['data']> => {
        const response = await apiClient.get<GetUsersApiResponse>(
            `${ENDPOINTS.USERS.GET_ALL_USERS(role)}${ENDPOINTS.USERS.GET_ALL_USERS(role).includes('?') ? '&' : '?'}page=${page}&limit=${limit}&roleMatch=mixed&t=${Date.now()}`
        );
        return response.data.data;
    },
};
