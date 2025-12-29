import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { MenteeResponse } from '@/types/mentee.types';

export const menteesService = {
    getMentees: async (): Promise<MenteeResponse> => {
        const response = await apiClient.get<MenteeResponse>(ENDPOINTS.MENTEES.GET_ALL_MENTEES,
            {
                params: {
                    t: Date.now(),          // 🔹 cache-buster
                },
            }
        );
        return response.data
    },

    getMenteeById: async (menteeId: string): Promise<MenteeResponse> => {
        const response = await apiClient.get<MenteeResponse>(ENDPOINTS.USERS.GET_USER(menteeId), {
            params: {
                t: Date.now(),          // 🔹 cache-buster
            },
        });
        return response.data;
    },

    assignMentorsToMentee: async (
        menteeId: string,
        assignedIds: string[],
    ): Promise<void> => {
        await apiClient.post(
            ENDPOINTS.MENTEES.ASSIGN_MENTORS(menteeId),
            { assignedId: assignedIds },
        );
    },

    removeMentorsFromMentee: async (
        menteeId: string,
        assignedIds: string[],
    ): Promise<void> => {
        console.log('Removing mentors', assignedIds, 'from mentee', menteeId);
        await apiClient.patch(
            ENDPOINTS.MENTEES.REMOVE_MENTORS(menteeId),
            { assignedId: assignedIds },
        );
    },

};
