import { InterestItem, InterestsApiResponse, UpdateInterestStatusRequest, UpdateInterestStatusResponse } from "@/types/interest.types";
import apiClient from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const interestService = {
    /**
     * Fetch all interests
     */
    getAll: async (): Promise<InterestItem[]> => {
        const response = await apiClient.get<InterestsApiResponse>(ENDPOINTS.INTERESTS.GET_ALL);

        const list = response.data.data ?? [];
        return list.map((item: any) => ({
            ...item,
            id: item.id ?? item._id,     // always produce "id"
        }));
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
};
