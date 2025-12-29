import {
    ApiAssessment,
    CreateAssessmentRequest,
    SubmitAnswersPayload,
    SubmitPreSurveyPayload,
    SubmittedAnswersResponse
} from '@/types/assessment.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const assessmentService = {
    // Get all assessments
    getAssessments: async (): Promise<ApiAssessment[]> => {
        console.log('📤 Fetching assessments');
        const response = await apiClient.get<ApiAssessment[]>(
            ENDPOINTS.ASSESSMENTS.GET_ASSESSMENTS
        );
        console.log('📥 Assessments fetched:', response.data);
        return response.data;
    },

    // Get assessment by ID
    getAssessmentById: async (assessmentId: string): Promise<ApiAssessment> => {
        console.log('📤 Fetching assessment:', assessmentId);
        const response = await apiClient.get<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.GET_ASSESSMENT_BY_ID(assessmentId)
        );
        console.log('📥 Assessment fetched:', response.data);
        return response.data;
    },

    // Create new assessment
    createAssessment: async (
        data: CreateAssessmentRequest
    ): Promise<ApiAssessment> => {
        console.log('📤 Creating assessment:', data.name);
        const response = await apiClient.post<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.CREATE_ASSESSMENT,
            data
        );
        console.log('📥 Assessment created:', response.data);
        return response.data;
    },

    // Delete assessment
    deleteAssessment: async (assessmentId: string): Promise<{ message: string }> => {
        console.log('📤 Deleting assessment:', assessmentId);
        const response = await apiClient.delete<{ message: string }>(
            ENDPOINTS.ASSESSMENTS.DELETE_ASSESSMENT(assessmentId)
        );
        console.log('📥 Assessment deleted:', response.data);
        return response.data;
    },

    // Update assessment instructions
    updateInstructions: async (
        assessmentId: string,
        instructions: string[]
    ): Promise<ApiAssessment> => {
        console.log('📤 Updating assessment instructions:', assessmentId);
        const response = await apiClient.patch<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.UPDATE_INSTRUCTIONS(assessmentId),
            { instructions }
        );
        console.log('📥 Assessment instructions updated:', response.data);
        return response.data;
    },

    // Submit pre-survey answers
    submitPreSurvey: async (
        assessmentId: string,
        payload: SubmitPreSurveyPayload
    ): Promise<any> => {
        console.log('📤 Submitting pre-survey for assessment:', assessmentId);
        const response = await apiClient.post(
            ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT_PRESURVEY(assessmentId),
            payload
        );
        console.log('📥 Pre-survey submitted:', response.data);
        return response.data;
    },

    // Submit assessment answers
    submitAssessmentAnswers: async (
        assessmentId: string,
        payload: SubmitAnswersPayload
    ): Promise<any> => {
        console.log('📤 Submitting assessment answers:', assessmentId);
        console.log('Payload:', payload);
        const response = await apiClient.post(
            ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT_ANSWERS(assessmentId),
            payload
        );
        console.log('📥 Assessment answers submitted:', response.data);
        return response.data;
    },

    // Fetch submitted answers - UPDATED
    fetchAnswers: async (
        assessmentId: string,
        userId: string
    ): Promise<SubmittedAnswersResponse> => {
        console.log('📤 Fetching answers for assessment:', assessmentId, 'user:', userId);

        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: SubmittedAnswersResponse;
        }>(
            ENDPOINTS.ASSESSMENTS.FETCH_ANSWERS(assessmentId, userId)
        );

        console.log('📥 Answers fetched:', response.data);

        // Return the data object from the response
        return response.data.data;
    },
};
