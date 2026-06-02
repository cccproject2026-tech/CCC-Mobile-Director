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
        dueDate?: string,
    ): Promise<void> => {
        const isoDue = dueDate
            ? new Date(`${dueDate}T23:59:59`).toISOString()
            : undefined;
        for (const assessmentId of assessmentIds) {
            await apiClient.post(ENDPOINTS.PROGRESS.ASSIGN_ASSESSMENT, {
                userIds: menteeIds,
                assessmentIds: [assessmentId],
                dueDate: isoDue,
            });
        }
    },

    assignRoadmapsToMentee: async (
        menteeIds: string[],
        roadmapIds: string[],
    ): Promise<void> => {
        for (const roadmapId of roadmapIds) {
            await apiClient.post(ENDPOINTS.PROGRESS.ASSIGN_ROADMAP, {
                userIds: menteeIds,
                roadMapIds: [roadmapId],
            });
        }
    },
  getAssignedMentees: async (mentorId: string) => {
    const response = await apiClient.get(
        ENDPOINTS.MENTEES.GET_ASSIGNED_MENTEES(mentorId),
        {
            params: {
                t: Date.now(),
            },
        }
    );

    return response.data;
},
};
