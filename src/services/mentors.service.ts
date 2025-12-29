import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { MentorsResponse } from '@/types/mentor.types';

export const mentorsService = {
    getMentors: async (): Promise<MentorsResponse> => {
        const response = await apiClient.get<MentorsResponse>(ENDPOINTS.MENTORS.GET_ALL_MENTORS,
            {
                params: {
                    t: Date.now(),          // 🔹 cache-buster
                },
            }
        );
        return response.data
    },
    assignMenteesToMentor: async (
        mentorId: string,
        assignedIds: string[],
    ): Promise<void> => {
        await apiClient.post(
            ENDPOINTS.MENTORS.ASSIGN_MENTEES(mentorId),
            { assignedId: assignedIds },
        );
    },
    removeMenteesFromMentor: async (
        mentorId: string,
        assignedIds: string[],
    ): Promise<void> => {
        console.log('Removing mentees', assignedIds, 'from mentor', mentorId);
        await apiClient.patch(
            ENDPOINTS.MENTORS.REMOVE_MENTEES(mentorId),
            { assignedId: assignedIds },
        );
    },
};
