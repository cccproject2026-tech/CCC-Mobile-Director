// src/services/scholarship.service.ts
import { AwardedUser, Scholarship } from "@/types/scholorship.types";
import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";


type GetScholarshipsResponse = {
    success: boolean;
    message: string;
    data: Scholarship[];
};

type GetScholarshipStatsResponse = {
    success: boolean;
    message: string;
    data: any; // shape not provided yet
};

export const scholarshipService = {
    getAll: async (status?: "active" | "inactive"): Promise<Scholarship[]> => {
        const res = await apiClient.get<GetScholarshipsResponse>(
            ENDPOINTS.SCHOLARSHIPS.GET_ALL(),
            {
                params: {
                    t: Date.now(),
                },
            }
        );
        return res.data.data;
    },

    getStats: async (): Promise<GetScholarshipStatsResponse["data"]> => {
        const res = await apiClient.get<GetScholarshipStatsResponse>(
            ENDPOINTS.SCHOLARSHIPS.GET_STATS,
            {
                params: {
                    t: Date.now(),
                },
            }
        );
        return res.data.data;
    },

    addAwardedUser: async (
        scholarshipId: string,
        payload: AwardedUser
    ): Promise<Scholarship> => {
        const res = await apiClient.post<{
            success: boolean;
            message: string;
            data: Scholarship;
        }>(ENDPOINTS.SCHOLARSHIPS.ADD_AWARDED_USER(scholarshipId), payload);
        return res.data.data;
    },

    updateAwardedUser: async (
        scholarshipId: string,
        index: number,
        payload: Partial<AwardedUser>
    ): Promise<Scholarship> => {
        const res = await apiClient.patch<{
            success: boolean;
            message: string;
            data: Scholarship;
        }>(ENDPOINTS.SCHOLARSHIPS.UPDATE_AWARDED_USER(scholarshipId, index), payload);
        return res.data.data;
    },
    updateScholarship: async (
        scholarshipId: string,
        payload: Partial<Pick<Scholarship, "type" | "amount" | "status">>
    ): Promise<Scholarship> => {
        const res = await apiClient.patch<{
            success: boolean;
            message: string;
            data: Scholarship;
        }>(`/scholarships/${scholarshipId}`, payload);
        return res.data.data;
    },
};
