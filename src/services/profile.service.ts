import { Document, FormFieldsResponse, GetMyProfileResponse, User, UserWithInterest } from "@/types/user.types";
import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";
import { InterestItem } from "@/types/interest.types";

export const profileService = {
    // Get current user's details
    getMyProfile: async (userId: string): Promise<UserWithInterest> => {
        const response = await apiClient.get<GetMyProfileResponse>(
            ENDPOINTS.USERS.GET_USER(userId), {
            params: { t: Date.now() },
        }
        );
        return response.data.data;
    },
    async getFormFields(): Promise<FormFieldsResponse> {
        const response = await apiClient.get<FormFieldsResponse>('/interests/form-fields', {
            params: { t: Date.now() },
        })
        return response.data;
    },
    // Get current user's interest details
    getInterestDetails: async (email: string): Promise<InterestItem> => {
        const response = await apiClient.get<{
            success: boolean;
            message?: string;
            data: InterestItem;
        }>(ENDPOINTS.USERS.GET_INTERESTS(email), {
            params: { t: Date.now() },
        });
        return response.data.data;
    },

    // Update user profile (basic info)
    updateUserProfile: async (
        userId: string,
        updates: Partial<User>
    ): Promise<User> => {
        const response = await apiClient.patch<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.UPDATE_USER(userId),
            updates,
        );
        return response.data.data;
    },

    // Update user interest details
    updateInterestDetails: async (
        email: string,
        updates: Partial<InterestItem>
    ): Promise<InterestItem> => {
        console.log('Updating interest details for', email, 'with', updates);
        const response = await apiClient.patch<{
            success: boolean;
            data: InterestItem;
        }>(ENDPOINTS.USERS.UPDATE_INTERESTS(email), updates);
        return response.data.data;
    },

    // Get user by ID
    getUserById: async (userId: string): Promise<User> => {
        const response = await apiClient.get<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.GET_USER(userId), {
            params: { t: Date.now() },
        }
        );
        return response.data.data;
    },

    // Get all users (optional role filter)
    getAllUsers: async (role?: string): Promise<User[]> => {
        const response = await apiClient.get<{ success: boolean; data: User[] }>(
            ENDPOINTS.USERS.GET_ALL_USERS(role as any), {
            params: { t: Date.now() },
        }
        );
        return response.data.data;
    },

    // Upload avatar
    uploadProfilePicture: async (userId: string, file: any): Promise<User> => {
        const formData = new FormData();
        formData.append(
            "file",
            {
                uri: file.uri,
                type: file.type || "image/jpeg",
                name: file.fileName || "profile-picture.jpg",
            } as any
        );

        const response = await apiClient.patch<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.UPDATE_PROFILE_PICTURE(userId),
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data.data;
    },

    // Get documents
    getDocuments: async (userId: string): Promise<Document[]> => {
        const response = await apiClient.get<{ success: boolean; data: Document[] }>(
            ENDPOINTS.USERS.GET_DOCUMENTS(userId), {
            params: { t: Date.now() },
        }
        );
        return response.data.data;
    },

    // Upload document
    uploadDocument: async (userId: string, file: any): Promise<Document> => {
        const formData = new FormData();
        formData.append(
            "file",
            {
                uri: file.uri,
                type: file.mimeType || file.type || "application/octet-stream",
                name: file.name || file.fileName || `document-${Date.now()}`,
            } as any
        );

        const response = await apiClient.post<{ success: boolean; data: Document }>(
            ENDPOINTS.USERS.UPLOAD_DOCUMENT(userId),
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data.data;
    },

    // Delete document
    deleteDocument: async (userId: string, documentUrl: string): Promise<void> => {
        await apiClient.delete(ENDPOINTS.USERS.DELETE_DOCUMENT(userId), {
            data: { documentUrl },
        });
    },

    // Notifications
    // getNotifications: async (userId: string): Promise<any[]> => {
    //     const response = await apiClient.get<{
    //         success: boolean;
    //         data: { notifications: any[] };
    //     }>(ENDPOINTS.USERS.GET_NOTIFICATIONS(userId));

    //     return response.data.data?.notifications || [];
    // },
};
