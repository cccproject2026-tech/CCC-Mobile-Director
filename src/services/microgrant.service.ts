import { CheckApplicationResponse, GrantFormResponse, GrantSubmissionPayload, GrantSubmissionResponse, MicrograntApplication, MicrograntApplicationDetail, MicrograntApplicationDetailApiResponse, MicrograntApplicationsApiResponse } from '@/types/microgrant.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';


export const grantService = {
    /**
     * Fetch the grant application form structure
     */
    getGrantForm: async (): Promise<GrantFormResponse> => {
        try {
            const response = await apiClient.get<GrantFormResponse>(
                ENDPOINTS.GRANT.GET_FORM
            );
            return response.data
        } catch (error) {
            console.error('Error fetching grant form:', error);
            throw error;
        }
    },

    /**
     * Submit grant application with form data
     */
    submitGrant: async (
        payload: GrantSubmissionPayload
    ): Promise<GrantSubmissionResponse> => {
        try {
            const response = await apiClient.post<GrantSubmissionResponse>(
                ENDPOINTS.GRANT.APPLY_GRANT,
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting grant application:', error);
            throw error;
        }
    },

    /**
     * Get grant application status
     */
    getGrantStatus: async (userId: string): Promise<any> => {
        try {
            const response = await apiClient.get(
                `${ENDPOINTS.GRANT.APPLY_GRANT}/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching grant status:', error);
            throw error;
        }
    },

    /**
     * Check if user has already applied for microgrant
     */
    checkApplication: async (userId: string): Promise<CheckApplicationResponse> => {
        try {
            const response = await apiClient.get<CheckApplicationResponse>(
                ENDPOINTS.GRANT.CHECK_APPLICATION(userId)
            );
            return response.data;
        } catch (error) {
            console.error('Error checking application:', error);
            throw error;
        }
    },

    /**
     * Fetch all microgrant applications with optional status filter
     */
    getApplications: async (status?: string): Promise<MicrograntApplication[]> => {
        try {
            const response = await apiClient.get<MicrograntApplicationsApiResponse>(
                ENDPOINTS.GRANT.GET_APPLICATIONS(status),
                {
                    params: {
                        t: Date.now(), // Prevent caching
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching microgrant applications:', error);
            throw error;
        }
    },

    /**
     * Fetch a single microgrant application by ID
     */
    getApplication: async (applicationId: string): Promise<MicrograntApplicationDetail> => {
        try {
            const response = await apiClient.get<MicrograntApplicationDetailApiResponse>(
                ENDPOINTS.GRANT.GET_APPLICATION(applicationId), {
                params: {
                    t: Date.now(), // Prevent caching
                }
            }
            );

            console.log('Microgrant application response:', response.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching microgrant application:', error);
            throw error;
        }
    },

    /**
     * Helper method to build submission payload
     */
    buildSubmissionPayload: (
        userId: string,
        formAnswers: Record<string, string>,
        supportingDocUrl: string = 'https://example.com/uploads/proof.pdf'
    ): GrantSubmissionPayload => {
        return {
            userId,
            answers: formAnswers,
            supportingDoc: supportingDocUrl,
        };
    },

    updateApplicationStatus: async (userId: string, status: string): Promise<void> => {
        try {
            await apiClient.patch(
                ENDPOINTS.GRANT.UPDATE_APPLICATION_STATUS(userId),
                { status }
            );
        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    }
};
