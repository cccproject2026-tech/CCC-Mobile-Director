import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { MentorsResponse } from '@/types/mentor.types';

export const mentorsService = {
    getMentors: async (): Promise<MentorsResponse> => {
        const response = await apiClient.get<MentorsResponse>(ENDPOINTS.MENTORS.GET_ALL_MENTORS);
        return response.data
    },
};
