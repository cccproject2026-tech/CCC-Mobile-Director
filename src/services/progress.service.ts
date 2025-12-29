import {
    AddFinalCommentApiResponse,
    AddFinalCommentRequest,
    AssignAssessmentApiResponse,
    AssignAssessmentRequest,
    AssignRoadmapApiResponse,
    AssignRoadmapRequest,
    DeleteFinalCommentApiResponse,
    DeleteFinalCommentRequest,
    DirectorOverviewData,
    DirectorOverviewResponse,
    GetFinalCommentsApiResponse,
    UpdateFinalCommentApiResponse,
    UpdateFinalCommentRequest,
} from '@/types/progress.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const progressService = {
    /**
     * Assign roadmaps to users
     */
    async assignRoadmap(payload: AssignRoadmapRequest): Promise<AssignRoadmapApiResponse> {
        try {
            const response = await apiClient.post<AssignRoadmapApiResponse>(
                ENDPOINTS.PROGRESS.ASSIGN_ROADMAP,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to assign roadmap');
            }
            return response.data;
        } catch (error) {
            console.error('Error assigning roadmap:', error);
            throw error;
        }
    },

    /**
     * Assign assessment to a user
     */
    async assignAssessment(payload: AssignAssessmentRequest): Promise<AssignAssessmentApiResponse> {
        try {
            const response = await apiClient.post<AssignAssessmentApiResponse>(
                ENDPOINTS.PROGRESS.ASSIGN_ASSESSMENT,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to assign assessment');
            }
            return response.data;
        } catch (error) {
            console.error('Error assigning assessment:', error);
            throw error;
        }
    },

    /**
     * Add final comment for a user's progress
     */
    async addFinalComment(payload: AddFinalCommentRequest): Promise<AddFinalCommentApiResponse> {
        try {
            const response = await apiClient.post<AddFinalCommentApiResponse>(
                ENDPOINTS.PROGRESS.FINAL_COMMENTS,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to add final comment');
            }
            return response.data;
        } catch (error) {
            console.error('Error adding final comment:', error);
            throw error;
        }
    },

    /**
     * Get final comments for a user's progress
     */
    async getFinalComments(userId: string): Promise<GetFinalCommentsApiResponse> {
        try {
            const response = await apiClient.get<GetFinalCommentsApiResponse>(
                ENDPOINTS.PROGRESS.GET_FINAL_COMMENTS(userId)
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get final comments');
            }
            return response.data;
        } catch (error) {
            console.error('Error getting final comments:', error);
            throw error;
        }
    },

    /**
     * Update an existing final comment
     */
    async updateFinalComment(payload: UpdateFinalCommentRequest): Promise<UpdateFinalCommentApiResponse> {
        try {
            const response = await apiClient.patch<UpdateFinalCommentApiResponse>(
                ENDPOINTS.PROGRESS.FINAL_COMMENTS,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update final comment');
            }
            return response.data;
        } catch (error) {
            console.error('Error updating final comment:', error);
            throw error;
        }
    },

    /**
     * Delete a final comment
     */
    async deleteFinalComment(payload: DeleteFinalCommentRequest): Promise<DeleteFinalCommentApiResponse> {
        try {
            const response = await apiClient.delete<DeleteFinalCommentApiResponse>(
                ENDPOINTS.PROGRESS.FINAL_COMMENTS,
                { data: payload }
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete final comment');
            }
            return response.data;
        } catch (error) {
            console.error('Error deleting final comment:', error);
            throw error;
        }
    },

    /** Get Director Overview */
    async getDirectorOverview(period: string = 'yearly', year?: number): Promise<DirectorOverviewData> {
        const response = await apiClient.get<DirectorOverviewResponse>(ENDPOINTS.PROGRESS.DIRECTOR_OVERVIEW, {
            params: { period, year, t: Date.now() },
        });
        return response.data.data;
    },

};


