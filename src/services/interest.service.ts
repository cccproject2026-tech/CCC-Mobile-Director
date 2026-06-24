import { AddDynamicFieldResponse, DeleteInterestResponse, DynamicFieldRequest, InterestFormResponse, InterestItem, InterestsApiResponse, UpdateInterestStatusRequest, UpdateInterestStatusResponse } from "@/types/interest.types";
import apiClient from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const interestService = {
    /**
     * Fetch all interests
     */
    getAll: async (): Promise<InterestItem[]> => {
        const response = await apiClient.get<InterestsApiResponse>(
            ENDPOINTS.INTERESTS.GET_ALL,
            {
                params: { t: Date.now() }, // cache-buster
            }
        );


        const list = response.data.data ?? [];
        return list.map((item: any) => ({
            ...item,
            id: item.id ?? item._id,
        }));
        // const ts = Date.now();

        // const response = await fetch(
        //     `${process.env.EXPO_PUBLIC_API_URL}/api/v1/interests?t=${ts}`,
        //     {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Cache-Control': 'no-cache',
        //             Pragma: 'no-cache',
        //         },
        //     }
        // );


        // if (!response.ok) {
        //     throw new Error('Failed to fetch interests');
        // }

        // const data: InterestsApiResponse = await response.json();
        // const list = data.data ?? [];
        // return list.map((item: any) => ({
        //     ...item,
        //     id: item.id ?? item._id,     // always produce "id"
        // }));
    },
    /**
 * Update interest request status (accept/reject)
 */
    updateStatus: async (
        interestId: string,
        status: 'accepted' | 'rejected' | 'pending'
    ): Promise<UpdateInterestStatusResponse> => {
        const response = await apiClient.patch<UpdateInterestStatusResponse>(
            ENDPOINTS.INTERESTS.UPDATE_STATUS(interestId),
            { status } as UpdateInterestStatusRequest
        );
        return response.data;
    },

    deleteById: async (interestId: string): Promise<DeleteInterestResponse> => {
        const response = await apiClient.delete<DeleteInterestResponse>(
            ENDPOINTS.INTERESTS.DELETE_BY_ID(interestId),
        );
        return response.data;
    },

    getFormConfig: async () => {
        const res = await apiClient.get<InterestFormResponse>(
            ENDPOINTS.INTERESTS.FORM_CONFIG,
            {
                params: { t: Date.now() }, // cache-buster
            }
        );
        return res.data.data;
    },
    addDynamicField: async (payload: DynamicFieldRequest) => {
        const res = await apiClient.post<AddDynamicFieldResponse>(
            ENDPOINTS.INTERESTS.ADD_DYNAMIC_FIELD,
            payload,
        );
        return res.data;
    },
    removeDynamicField: async (fieldId: string) => {
        const res = await apiClient.delete<{ success: boolean; message: string }>(
            ENDPOINTS.INTERESTS.REMOVE_DYNAMIC_FIELD(fieldId),
        );
        return res.data;
    }
};
