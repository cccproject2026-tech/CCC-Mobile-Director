import {
    ApiAssessment,
    ApiAssessmentSection,
    AssignAssessmentPayload,
    CreateAssessmentRequest,
    SubmitAnswersPayload,
    SubmitPreSurveyPayload,
    SubmittedAnswersResponse,
} from '@/types/assessment.types';
import {
    AssignedAssessmentRow,
    flattenAssignedAssessmentRow,
    parseAssignedAssessmentsListBody,
} from '@/utils/assignedAssessmentParser';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const assessmentService = {
    getAssessments: async (): Promise<ApiAssessment[]> => {
        const response = await apiClient.get<ApiAssessment[]>(
            ENDPOINTS.ASSESSMENTS.GET_ASSESSMENTS,
            { params: { t: Date.now() } },
        );
        return response.data;
    },

    getAssessmentById: async (assessmentId: string): Promise<ApiAssessment> => {
        const response = await apiClient.get<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.GET_ASSESSMENT_BY_ID(assessmentId),
        );
        return response.data;
    },

    getAssignedAssessments: async (userId: string): Promise<AssignedAssessmentRow[]> => {
        const response = await apiClient.get(ENDPOINTS.ASSESSMENTS.GET_ASSIGNED(userId), {
            params: { _cb: Date.now() },
            headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        const rows = parseAssignedAssessmentsListBody(response.data);
        const parsed: AssignedAssessmentRow[] = [];
        for (const item of rows) {
            const flat = flattenAssignedAssessmentRow(item);
            if (!flat) continue;
            parsed.push({
                assessmentId: flat.assessmentId,
                assignmentId: flat.assignmentId,
                dueDate: flat.dueDate,
                meetingDate: flat.meetingDate,
                updatedAt: flat.updatedAt,
                assessment: flat.assessment as unknown as ApiAssessment,
            });
        }
        return parsed;
    },

    assignAssessment: async (payload: AssignAssessmentPayload): Promise<void> => {
        await apiClient.post(ENDPOINTS.PROGRESS.ASSIGN_ASSESSMENT, payload);
    },

    getRecommendations: async (assessmentId: string, userId: string): Promise<unknown> => {
        const response = await apiClient.get(
            ENDPOINTS.ASSESSMENTS.GET_RECOMMENDATIONS(assessmentId, userId),
        );
        return response.data;
    },

    createAssessment: async (data: CreateAssessmentRequest): Promise<ApiAssessment> => {
        const response = await apiClient.post<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.CREATE_ASSESSMENT,
            data,
        );
        return response.data;
    },

    deleteAssessment: async (assessmentId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(
            ENDPOINTS.ASSESSMENTS.DELETE_ASSESSMENT,
            { data: { ids: [assessmentId] } },
        );
        return response.data;
    },

    updateAssessmentDetails: async (
        assessmentId: string,
        updates: { name?: string; description?: string; instructions?: string[] },
    ): Promise<ApiAssessment> => {
        const response = await apiClient.patch<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.UPDATE_INSTRUCTIONS(assessmentId),
            updates,
        );
        return response.data;
    },

    updateSections: async (
        assessmentId: string,
        sections: ApiAssessmentSection[],
    ): Promise<ApiAssessment> => {
        const response = await apiClient.patch<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.UPDATE_SECTIONS(assessmentId),
            { sections },
        );
        return response.data;
    },

    submitPreSurvey: async (assessmentId: string, payload: SubmitPreSurveyPayload): Promise<unknown> => {
        const response = await apiClient.post(
            ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT_PRESURVEY(assessmentId),
            payload,
        );
        return response.data;
    },

    submitAssessmentAnswers: async (
        assessmentId: string,
        payload: SubmitAnswersPayload,
    ): Promise<unknown> => {
        const response = await apiClient.post(
            ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT_ANSWERS(assessmentId),
            payload,
        );
        return response.data;
    },

    fetchAnswers: async (
        assessmentId: string,
        userId: string,
    ): Promise<SubmittedAnswersResponse> => {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: SubmittedAnswersResponse;
        }>(ENDPOINTS.ASSESSMENTS.FETCH_ANSWERS(assessmentId, userId));
        return response.data.data;
    },

    uploadBannerImage: async (
        assessmentId: string,
        imageUri: string,
    ): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'banner.jpg',
        } as unknown as Blob);

        const response = await apiClient.patch<{ imageUrl: string }>(
            ENDPOINTS.ASSESSMENTS.UPLOAD_BANNER_IMAGE(assessmentId),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return response.data;
    },
};
