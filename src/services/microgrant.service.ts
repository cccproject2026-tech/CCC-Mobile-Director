import {
    CheckApplicationResponse,
    GrantFormResponse,
    GrantSubmissionPayload,
    GrantSubmissionResponse,
    MicrograntApplication,
    MicrograntApplicationDetail,
    MicrograntApplicationsApiResponse,
    MicroGrantStatus,
} from '@/types/microgrant.types';
import {
    buildMicrograntDetailFromListApplication,
    getMicrograntApplicantUserId,
    unwrapMicrograntApplicationsList,
    unwrapMicrograntWithUser,
} from '@/utils/microgrant';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

function isNotFoundError(error: unknown): boolean {
    const e = error as { statusCode?: number; response?: { status?: number } };
    return e?.statusCode === 404 || e?.response?.status === 404;
}

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
    getApplications: async (status?: MicroGrantStatus): Promise<MicrograntApplication[]> => {
        try {
            const response = await apiClient.get<MicrograntApplicationsApiResponse>(
                ENDPOINTS.GRANT.GET_APPLICATIONS(status),
                {
                    params: {
                        t: Date.now(),
                    }
                }
            );
            return unwrapMicrograntApplicationsList(response);
        } catch (error) {
            console.error('Error fetching microgrant applications:', error);
            throw error;
        }
    },

    /**
     * GET `/microgrant/application/:userId` — accepts applicant user id, not application `_id`.
     */
    getApplicationByUserId: async (userId: string): Promise<MicrograntApplicationDetail | null> => {
        try {
            const response = await apiClient.get(ENDPOINTS.GRANT.GET_APPLICATION(userId), {
                params: { t: Date.now() },
            });
            return unwrapMicrograntWithUser(response);
        } catch (error) {
            if (isNotFoundError(error)) return null;
            console.error('Error fetching microgrant application by user:', error);
            throw error;
        }
    },

    /**
     * Load application detail by route slug (user id preferred; falls back via applications list).
     */
    getApplication: async (slug: string): Promise<MicrograntApplicationDetail> => {
        const trimmed = slug.trim();
        if (!trimmed) {
            throw new Error('Application id is required');
        }

        const direct = await grantService.getApplicationByUserId(trimmed);
        if (direct) return direct;

        const list = await grantService.getApplications();
        const byAppId = list.find((a) => String(a._id) === trimmed);
        if (byAppId) {
            const uid = getMicrograntApplicantUserId(byAppId);
            if (uid && uid !== trimmed) {
                const byUser = await grantService.getApplicationByUserId(uid);
                if (byUser) return byUser;
            }
            const built = buildMicrograntDetailFromListApplication(byAppId);
            if (built) return built;
        }

        const byUserInList = list.find((a) => getMicrograntApplicantUserId(a) === trimmed);
        if (byUserInList) {
            const built = buildMicrograntDetailFromListApplication(byUserInList);
            if (built) return built;
        }

        throw new Error('Application not found for this user');
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

    updateApplicationStatus: async (applicationId: string, status: MicroGrantStatus): Promise<void> => {
        try {
            await apiClient.patch(
                ENDPOINTS.GRANT.UPDATE_APPLICATION_STATUS(applicationId),
                { status }
            );
        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    }
};
