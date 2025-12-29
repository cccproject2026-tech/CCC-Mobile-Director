import apiClient from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
    CreateDirectorRequest,
    UpdateDirectorRequest,
    DirectorResponse,
    GetDirectorsResponse,
} from "@/types/director.types";
import { CreateUserRequest, CreateUserResponse } from "@/types/user.types";
export const directorService = {
    getAll: async (page = 1) => {
        const res = await apiClient.get<GetDirectorsResponse>(
            ENDPOINTS.SUPER_ADMIN.GET_ALL_DIRECTORS,
            {
                params: {
                    page,
                    t: Date.now(),          // 🔹 cache-buster
                },
            }
        );
        return res.data.data.users;
    },

    getById: async (id: string) => {
        const res = await apiClient.get<DirectorResponse>(
            ENDPOINTS.SUPER_ADMIN.GET_DIRECTOR_BY_ID(id),
            {
                params: {
                    t: Date.now(),          // 🔹 cache-buster
                },
            }
        );
        return res.data.data;
    },

    createDirector: async (payload: CreateDirectorRequest) => {
        const res = await apiClient.post(
            ENDPOINTS.SUPER_ADMIN.CREATE_DIRECTOR,
            payload
        );
        return res.data;
    },

    updateDirector: async (id: string, payload: UpdateDirectorRequest) => {
        const res = await apiClient.patch(
            ENDPOINTS.SUPER_ADMIN.UPDATE_DIRECTOR(id),
            payload
        );
        return res.data;
    },

    deleteDirector: async (id: string) => {
        const res = await apiClient.delete(
            ENDPOINTS.SUPER_ADMIN.DELETE_DIRECTOR(id),
            {
                params: {
                    t: Date.now(),          // optional, for some proxies on DELETE too
                },
            }
        );
        return res.data;
    },
    addUser: async (payload: CreateUserRequest) => {
        console.log("[directorService.addUser] payload:", payload);
        const res = await apiClient.post<CreateUserResponse>(
            ENDPOINTS.INTERESTS.SUBMIT_INTEREST,
            payload
        );
        console.log("[directorService.addUser] response:", res.data);
        return res.data;
    },
};
