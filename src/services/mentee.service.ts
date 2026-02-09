import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { MenteeResponse } from '@/types/mentee.types';

export const menteesService = {
    getMentees: async (page?: number, limit?: number): Promise<MenteeResponse> => {
        const response = await apiClient.get<MenteeResponse>(ENDPOINTS.MENTEES.GET_ALL_MENTEES,
            {
                params: {
                    ...(page && { page }),
                    ...(limit && { limit }),
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

    assignAssessmentsToMentee: async (
        menteeIds: string[],
        assessmentIds: string[],
    ): Promise<void> => {
        await apiClient.post(
            ENDPOINTS.PROGRESS.ASSIGN_ASSESSMENT,
            {
                userIds: menteeIds,
                assessmentIds: assessmentIds
            },
        );
    },

    assignRoadmapsToMentee: async (
        menteeIds: string[],
        roadmapIds: string[],
    ): Promise<void> => {
        console.log('Assigning roadmaps', roadmapIds, 'to mentees', menteeIds);
        await apiClient.post(
            ENDPOINTS.PROGRESS.ASSIGN_ROADMAP,
            {
                userIds: menteeIds,
                roadMapIds: roadmapIds
            },
        );
    },
};
