import apiClient from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
    CreateDirectorRequest,
    UpdateDirectorRequest,
    DirectorResponse,
    GetDirectorsResponse,
} from "@/types/director.types";

export const directorService = {
    getAll: async (page = 1) => {
        const res = await apiClient.get<GetDirectorsResponse>(ENDPOINTS.SUPER_ADMIN.GET_ALL_DIRECTORS, {
            params: { page },
        });
        return res.data.data.users;
    },

    getById: async (id: string) => {
        const res = await apiClient.get<DirectorResponse>(`${ENDPOINTS.SUPER_ADMIN.GET_DIRECTOR_BY_ID(id)}`);
        return res.data.data;
    },

    createDirector: async (payload: CreateDirectorRequest) => {
        const res = await apiClient.post(ENDPOINTS.SUPER_ADMIN.CREATE_DIRECTOR, payload);
        return res.data;
    },

    updateDirector: async (id: string, payload: UpdateDirectorRequest) => {
        const res = await apiClient.patch(`${ENDPOINTS.SUPER_ADMIN.UPDATE_DIRECTOR(id)}`, payload);
        return res.data;
    },
    deleteDirector: async (id: string) => {
        const res = await apiClient.delete(`${ENDPOINTS.SUPER_ADMIN.DELETE_DIRECTOR(id)}`);
        return res.data;
    }
};
